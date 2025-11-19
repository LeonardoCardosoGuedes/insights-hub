// src/integrations/hotelApi/client.ts
export const API_BASE_URL = "http://localhost:3004";

export type Reserva = {
  id: number;
  data_entrada: string;        // vem como string no JSON
  data_saida: string;
  quantidade_hospedes: number;
  valor_total: number;
  id_hospede: number;
  numero_quarto: number;
};

export async function listarReservas(): Promise<Reserva[]> {
  const resp = await fetch(`${API_BASE_URL}/api/reservas`);

  if (!resp.ok) {
    throw new Error(`Erro ao buscar reservas: ${resp.status}`);
  }

  return resp.json(); // aqui ele transforma o JSON da API em array de Reserva
}
