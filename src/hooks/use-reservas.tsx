// src/hooks/use-reservas.tsx
import { useEffect, useState } from "react";
import { listarReservas, Reserva } from "@/integrations/hotelApi/client";

export function useReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await listarReservas();
        setReservas(dados);
      } catch (e: any) {
        setErro(e.message ?? "Erro ao carregar reservas");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  return { reservas, carregando, erro };
}
