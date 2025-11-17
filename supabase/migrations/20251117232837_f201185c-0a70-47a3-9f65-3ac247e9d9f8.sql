-- Add INSERT, UPDATE, DELETE policies for all tables

-- Pessoa policies
CREATE POLICY "Allow public insert to pessoa"
ON public.pessoa
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to pessoa"
ON public.pessoa
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to pessoa"
ON public.pessoa
FOR DELETE
TO public
USING (true);

-- Endereco policies
CREATE POLICY "Allow public insert to endereco"
ON public.endereco
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to endereco"
ON public.endereco
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to endereco"
ON public.endereco
FOR DELETE
TO public
USING (true);

-- Telefone policies
CREATE POLICY "Allow public insert to telefone"
ON public.telefone
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to telefone"
ON public.telefone
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to telefone"
ON public.telefone
FOR DELETE
TO public
USING (true);

-- Hospede policies
CREATE POLICY "Allow public insert to hospede"
ON public.hospede
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to hospede"
ON public.hospede
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to hospede"
ON public.hospede
FOR DELETE
TO public
USING (true);

-- Funcionario policies
CREATE POLICY "Allow public insert to funcionario"
ON public.funcionario
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to funcionario"
ON public.funcionario
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to funcionario"
ON public.funcionario
FOR DELETE
TO public
USING (true);

-- Quarto policies
CREATE POLICY "Allow public insert to quarto"
ON public.quarto
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to quarto"
ON public.quarto
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to quarto"
ON public.quarto
FOR DELETE
TO public
USING (true);

-- Reserva policies
CREATE POLICY "Allow public insert to reserva"
ON public.reserva
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to reserva"
ON public.reserva
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to reserva"
ON public.reserva
FOR DELETE
TO public
USING (true);

-- Servico_Adicional policies
CREATE POLICY "Allow public insert to servico_adicional"
ON public.servico_adicional
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to servico_adicional"
ON public.servico_adicional
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to servico_adicional"
ON public.servico_adicional
FOR DELETE
TO public
USING (true);

-- Pagamento policies
CREATE POLICY "Allow public insert to pagamento"
ON public.pagamento
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to pagamento"
ON public.pagamento
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to pagamento"
ON public.pagamento
FOR DELETE
TO public
USING (true);

-- Pet policies
CREATE POLICY "Allow public insert to pet"
ON public.pet
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to pet"
ON public.pet
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to pet"
ON public.pet
FOR DELETE
TO public
USING (true);

-- Supervisiona policies
CREATE POLICY "Allow public insert to supervisiona"
ON public.supervisiona
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Allow public update to supervisiona"
ON public.supervisiona
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete to supervisiona"
ON public.supervisiona
FOR DELETE
TO public
USING (true);