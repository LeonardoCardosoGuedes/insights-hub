import { Hotel, Settings } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { ViewsSection } from "@/components/dashboard/ViewsSection";
import { useReservas } from "@/hooks/use-reservas";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const { reservas, carregando, erro } = useReservas();

  // KPIs básicos a partir do JSON
  const totalReservas = reservas.length;
  const totalFaturado = reservas.reduce((acc, r) => acc + r.valor_total, 0);
  const mediaValorReserva =
    totalReservas > 0 ? totalFaturado / totalReservas : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-xl shadow-lg">
              <Hotel className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sistema de Gestão Hoteleira
              </h1>
              <p className="text-muted-foreground mt-1">
                Dashboard Analítico e Estatístico
              </p>
            </div>
          </div>
          <Link to="/gerenciamento">
            <Button className="gap-2">
              <Settings className="h-4 w-4" />
              Gerenciamento
            </Button>
          </Link>
        </div>

        <DashboardHeader />

        {/* Estados de loading/erro */}
        {carregando && (
          <p className="text-muted-foreground">Carregando reservas...</p>
        )}
        {erro && (
          <p className="text-red-500">Erro ao carregar dados: {erro}</p>
        )}

        {!carregando && !erro && (
          <>
            {/* Statistics Cards – agora com dados reais */}
            <StatsCards
              totalReservas={totalReservas}
              totalFaturado={totalFaturado}
              mediaValorReserva={mediaValorReserva}
            />

            {/* Charts Section – recebe a lista inteira para montar gráficos */}
            <ChartsSection reservas={reservas} />

            {/* Database Views Section – também com dados */}
            <ViewsSection reservas={reservas} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
