import { Hotel, Settings } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChartsSection } from "@/components/dashboard/ChartsSection";
import { ViewsSection } from "@/components/dashboard/ViewsSection";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
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
              <p className="text-muted-foreground mt-1">Dashboard Analítico e Estatístico</p>
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
        
        {/* Statistics Cards */}
        <StatsCards />

        {/* Charts Section */}
        <ChartsSection />

        {/* Database Views Section */}
        <ViewsSection />
      </div>
    </div>
  );
};

export default Index;
