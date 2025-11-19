// src/components/dashboard/StatsCards.tsx
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = "http://localhost:3004/api";

export const StatsCards = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats-cards"],
    queryFn: async () => {
      const [reservasRes, quartosRes, pessoasRes, pessoasHospRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/reservas`),
          fetch(`${API_BASE_URL}/quartos`),
          fetch(`${API_BASE_URL}/pessoas`),
          fetch(`${API_BASE_URL}/pessoas&hospedes`),
        ]);

      const reservas = await reservasRes.json();
      const quartos = await quartosRes.json();
      const pessoas = await pessoasRes.json();
      const pessoasHospedes = await pessoasHospRes.json();

      // TOTAL DE RESERVAS
      const totalReservas = reservas.length;

      // TOTAL DE QUARTOS LIVRES / OCUPADOS
      const totalQuartos = quartos.length;
      const livres = quartos.filter((q) => q.statusAtual === "Livre").length;
      const ocupados = totalQuartos - livres;

      // TOTAL DE HÓSPEDES
      const totalHospedes = pessoasHospedes.filter(
        (p) => p.status === "É hóspede"
      ).length;

      // TOTAL DE PESSOAS NO SISTEMA
      const totalPessoas = pessoas.length;

      // RECEITA TOTAL
      const receitaTotal = reservas.reduce(
        (acc, r) => acc + Number(r.valor_total),
        0
      );

      return {
        totalReservas,
        totalQuartos,
        livres,
        ocupados,
        totalHospedes,
        totalPessoas,
        receitaTotal,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total de Reservas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{data?.totalReservas}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receita Total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            R$ {data?.receitaTotal.toLocaleString("pt-BR")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quartos Livres / Ocupados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            Livres: {data?.livres} <br /> Ocupados: {data?.ocupados}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
