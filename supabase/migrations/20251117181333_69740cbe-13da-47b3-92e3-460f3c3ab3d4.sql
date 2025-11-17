-- Fix security warnings by recreating views with SECURITY INVOKER
DROP VIEW IF EXISTS vw_reservas_completas;
DROP VIEW IF EXISTS vw_relatorio_financeiro;

CREATE VIEW vw_reservas_completas WITH (security_invoker = true) AS
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

CREATE VIEW vw_relatorio_financeiro WITH (security_invoker = true) AS
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

-- Fix functions by setting search_path
CREATE OR REPLACE FUNCTION fn_calcula_idade(p_data_nasc DATE)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION trg_log_alteracao_valor_reserva_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.valor_total <> NEW.valor_total THEN
    INSERT INTO log_alteracoes_reserva (id_reserva, valor_antigo, valor_novo, observacao)
    VALUES (NEW.id_reserva, OLD.valor_total, NEW.valor_total, 'Atualização de valor_total da reserva');
  END IF;
  RETURN NEW;
END;
$$;