-- Hotel Management System Database Schema

-- Pessoa (Person) table
CREATE TABLE pessoa (
  cpf VARCHAR(14) PRIMARY KEY,
  nome_completo VARCHAR(255) NOT NULL,
  data_nascimento DATE NOT NULL,
  estado_civil VARCHAR(50),
  genero VARCHAR(50)
);

-- Endereco (Address) table
CREATE TABLE endereco (
  cpf_pessoa VARCHAR(14) PRIMARY KEY,
  rua VARCHAR(255),
  bairro VARCHAR(255),
  cidade VARCHAR(100),
  cep VARCHAR(9),
  FOREIGN KEY (cpf_pessoa) REFERENCES pessoa(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Telefone (Phone) table
CREATE TABLE telefone (
  id_telefone SERIAL PRIMARY KEY,
  numero VARCHAR(20) NOT NULL UNIQUE,
  fk_pessoa_cpf VARCHAR(14) NOT NULL,
  FOREIGN KEY (fk_pessoa_cpf) REFERENCES pessoa(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Funcionario (Employee) table
CREATE TABLE funcionario (
  matricula VARCHAR(50) PRIMARY KEY,
  fk_pessoa_cpf VARCHAR(14) NOT NULL UNIQUE,
  cargo VARCHAR(100),
  turno VARCHAR(50),
  status_emprego VARCHAR(50),
  salario DECIMAL(10,2),
  FOREIGN KEY (fk_pessoa_cpf) REFERENCES pessoa(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Hospede (Guest) table
CREATE TABLE hospede (
  id_hospede SERIAL PRIMARY KEY,
  fk_pessoa_cpf VARCHAR(14) NOT NULL UNIQUE,
  FOREIGN KEY (fk_pessoa_cpf) REFERENCES pessoa(cpf) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Supervisiona (Supervision) table
CREATE TABLE supervisiona (
  id_supervisao SERIAL PRIMARY KEY,
  fk_supervisor_matricula VARCHAR(50) NOT NULL,
  fk_supervisionado_matricula VARCHAR(50) NOT NULL,
  FOREIGN KEY (fk_supervisor_matricula) REFERENCES funcionario(matricula),
  FOREIGN KEY (fk_supervisionado_matricula) REFERENCES funcionario(matricula),
  CONSTRAINT uq_supervisao UNIQUE (fk_supervisor_matricula, fk_supervisionado_matricula)
);

-- Quarto (Room) table
CREATE TABLE quarto (
  numero INT PRIMARY KEY,
  capacidade INT,
  status_atual VARCHAR(50),
  tipo VARCHAR(255),
  valor_diaria DECIMAL(10,2)
);

-- Reserva (Reservation) table
CREATE TABLE reserva (
  id_reserva SERIAL PRIMARY KEY,
  data_entrada TIMESTAMP,
  data_saida TIMESTAMP,
  quantidade_hospedes INT,
  valor_total DECIMAL(10,2),
  fk_id_hospede INT NOT NULL,
  fk_quarto_numero INT,
  FOREIGN KEY (fk_id_hospede) REFERENCES hospede(id_hospede),
  FOREIGN KEY (fk_quarto_numero) REFERENCES quarto(numero) ON DELETE SET NULL
);

-- Servico_Adicional (Additional Service) table
CREATE TABLE servico_adicional (
  id_servico SERIAL PRIMARY KEY,
  tipo VARCHAR(150),
  preco DECIMAL(10,2),
  data_realizada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fk_reserva_id INT NOT NULL,
  FOREIGN KEY (fk_reserva_id) REFERENCES reserva(id_reserva)
);

-- Pagamento (Payment) table
CREATE TABLE pagamento (
  id_pagamento SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  juros DECIMAL(5,2),
  status_atual VARCHAR(50),
  fk_reserva_id INT NOT NULL,
  FOREIGN KEY (fk_reserva_id) REFERENCES reserva(id_reserva)
);

-- Pet table
CREATE TABLE pet (
  id_pet SERIAL PRIMARY KEY,
  nome VARCHAR(100),
  raca VARCHAR(100),
  fk_id_hospede INT NOT NULL,
  FOREIGN KEY (fk_id_hospede) REFERENCES hospede(id_hospede)
);

-- Log_Alteracoes_Reserva table for tracking changes
CREATE TABLE log_alteracoes_reserva (
  id_log SERIAL PRIMARY KEY,
  id_reserva INT NOT NULL,
  valor_antigo DECIMAL(10,2),
  valor_novo DECIMAL(10,2),
  data_alteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario VARCHAR(50) DEFAULT CURRENT_USER,
  observacao VARCHAR(255)
);

-- Create indexes for optimization
CREATE INDEX idx_pet_hospede ON pet(fk_id_hospede);
CREATE INDEX idx_quarto_valor ON quarto(valor_diaria);
CREATE INDEX idx_reserva_datas ON reserva(data_entrada, data_saida);
CREATE INDEX idx_reserva_hospede ON reserva(fk_id_hospede);

-- Views
CREATE VIEW vw_reservas_completas AS
SELECT
  r.id_reserva,
  r.data_entrada,
  r.data_saida,
  r.quantidade_hospedes,
  r.valor_total,
  h.id_hospede,
  p.cpf,
  p.nome_completo AS nome_hospede,
  p.data_nascimento,
  q.numero AS numero_quarto,
  q.tipo AS tipo_quarto,
  q.capacidade,
  q.valor_diaria,
  q.status_atual AS status_quarto,
  EXTRACT(DAY FROM (r.data_saida - r.data_entrada)) AS dias_hospedagem
FROM reserva r
INNER JOIN hospede h ON r.fk_id_hospede = h.id_hospede
INNER JOIN pessoa p ON h.fk_pessoa_cpf = p.cpf
INNER JOIN quarto q ON r.fk_quarto_numero = q.numero
ORDER BY r.data_entrada DESC;

CREATE VIEW vw_relatorio_financeiro AS
SELECT
  r.id_reserva,
  r.data_entrada,
  r.data_saida,
  p.cpf,
  p.nome_completo AS nome_hospede,
  q.numero AS numero_quarto,
  q.tipo AS tipo_quarto,
  r.valor_total AS valor_reserva,
  COALESCE(SUM(s.preco), 0) AS total_servicos_adicionais,
  r.valor_total + COALESCE(SUM(s.preco), 0) AS valor_total_geral,
  pg.tipo AS tipo_pagamento,
  pg.status_atual AS status_pagamento,
  pg.juros
FROM reserva r
INNER JOIN hospede h ON r.fk_id_hospede = h.id_hospede
INNER JOIN pessoa p ON h.fk_pessoa_cpf = p.cpf
INNER JOIN quarto q ON r.fk_quarto_numero = q.numero
LEFT JOIN servico_adicional s ON r.id_reserva = s.fk_reserva_id
LEFT JOIN pagamento pg ON r.id_reserva = pg.fk_reserva_id
GROUP BY r.id_reserva, r.data_entrada, r.data_saida, p.cpf, p.nome_completo,
         q.numero, q.tipo, r.valor_total, pg.tipo, pg.status_atual, pg.juros
ORDER BY r.data_entrada DESC;

-- Functions
CREATE OR REPLACE FUNCTION fn_calcula_idade(p_data_nasc DATE)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_idade INT;
BEGIN
  IF p_data_nasc IS NULL THEN
    RETURN NULL;
  END IF;
  
  v_idade := EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_data_nasc));
  RETURN v_idade;
END;
$$;

CREATE OR REPLACE FUNCTION fn_valor_total_com_servicos(p_id_reserva INT)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
  v_base DECIMAL(10,2);
  v_servicos DECIMAL(10,2);
BEGIN
  SELECT COALESCE(r.valor_total, 0) INTO v_base
  FROM reserva r
  WHERE r.id_reserva = p_id_reserva;
  
  SELECT COALESCE(SUM(s.preco), 0) INTO v_servicos
  FROM servico_adicional s
  WHERE s.fk_reserva_id = p_id_reserva;
  
  RETURN COALESCE(v_base, 0) + COALESCE(v_servicos, 0);
END;
$$;

-- Trigger for logging reservation value changes
CREATE OR REPLACE FUNCTION trg_log_alteracao_valor_reserva_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.valor_total <> NEW.valor_total THEN
    INSERT INTO log_alteracoes_reserva (id_reserva, valor_antigo, valor_novo, observacao)
    VALUES (NEW.id_reserva, OLD.valor_total, NEW.valor_total, 'Atualização de valor_total da reserva');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_log_alteracao_valor_reserva
AFTER UPDATE ON reserva
FOR EACH ROW
EXECUTE FUNCTION trg_log_alteracao_valor_reserva_func();

-- Enable RLS on all tables
ALTER TABLE pessoa ENABLE ROW LEVEL SECURITY;
ALTER TABLE endereco ENABLE ROW LEVEL SECURITY;
ALTER TABLE telefone ENABLE ROW LEVEL SECURITY;
ALTER TABLE funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospede ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisiona ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarto ENABLE ROW LEVEL SECURITY;
ALTER TABLE reserva ENABLE ROW LEVEL SECURITY;
ALTER TABLE servico_adicional ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_alteracoes_reserva ENABLE ROW LEVEL SECURITY;

-- Create public read policies for dashboard (you can restrict these later based on auth requirements)
CREATE POLICY "Allow public read access to pessoa" ON pessoa FOR SELECT USING (true);
CREATE POLICY "Allow public read access to endereco" ON endereco FOR SELECT USING (true);
CREATE POLICY "Allow public read access to telefone" ON telefone FOR SELECT USING (true);
CREATE POLICY "Allow public read access to funcionario" ON funcionario FOR SELECT USING (true);
CREATE POLICY "Allow public read access to hospede" ON hospede FOR SELECT USING (true);
CREATE POLICY "Allow public read access to supervisiona" ON supervisiona FOR SELECT USING (true);
CREATE POLICY "Allow public read access to quarto" ON quarto FOR SELECT USING (true);
CREATE POLICY "Allow public read access to reserva" ON reserva FOR SELECT USING (true);
CREATE POLICY "Allow public read access to servico_adicional" ON servico_adicional FOR SELECT USING (true);
CREATE POLICY "Allow public read access to pagamento" ON pagamento FOR SELECT USING (true);
CREATE POLICY "Allow public read access to pet" ON pet FOR SELECT USING (true);
CREATE POLICY "Allow public read access to log_alteracoes_reserva" ON log_alteracoes_reserva FOR SELECT USING (true);