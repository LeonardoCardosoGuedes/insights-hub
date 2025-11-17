import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, BedDouble, DollarSign, TrendingUp, Calendar, Percent } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const StatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [reservasCount, quartosCount, hospedesCount, totalReceita, avgDiaria] = await Promise.all([
        supabase.from("reserva").select("*", { count: "exact", head: true }),
        supabase.from("quarto").select("*", { count: "exact", head: true }),
        supabase.from("hospede").select("*", { count: "exact", head: true }),
        supabase.from("reserva").select("valor_total"),
        supabase.from("quarto").select("valor_diaria"),
      ]);

      const receita = totalReceita.data?.reduce((sum, r) => sum + (Number(r.valor_total) || 0), 0) || 0;
      const mediaDiaria = avgDiaria.data?.length
        ? avgDiaria.data.reduce((sum, q) => sum + (Number(q.valor_diaria) || 0), 0) / avgDiaria.data.length
        : 0;

      return {
        totalReservas: reservasCount.count || 0,
        totalQuartos: quartosCount.count || 0,
        totalHospedes: hospedesCount.count || 0,
        receitaTotal: receita,
        mediaDiaria: mediaDiaria,
        taxaOcupacao: quartosCount.count ? ((reservasCount.count || 0) / quartosCount.count) * 100 : 0,
      };
    },
  });

  const cards = [
    {
      title: "Total de Reservas",
      value: stats?.totalReservas || 0,
      icon: Calendar,
      gradient: "from-primary to-primary/80",
      change: "+12.5%",
    },
    {
      title: "Total de Hóspedes",
      value: stats?.totalHospedes || 0,
      icon: Users,
      gradient: "from-secondary to-secondary/80",
      change: "+8.2%",
    },
    {
      title: "Quartos Disponíveis",
      value: stats?.totalQuartos || 0,
      icon: BedDouble,
      gradient: "from-chart-4 to-chart-4/80",
      change: "0%",
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats?.receitaTotal || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      gradient: "from-accent to-accent/80",
      change: "+23.1%",
    },
    {
      title: "Média de Diária",
      value: `R$ ${(stats?.mediaDiaria || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      gradient: "from-chart-5 to-chart-5/80",
      change: "+5.3%",
    },
    {
      title: "Taxa de Ocupação",
      value: `${(stats?.taxaOcupacao || 0).toFixed(1)}%`,
      icon: Percent,
      gradient: "from-chart-6 to-chart-6/80",
      change: "+4.7%",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-0">
              <div className={`bg-gradient-to-br ${card.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <Icon className="w-8 h-8 opacity-90" />
                  <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                    {card.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-2">{card.title}</h3>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
