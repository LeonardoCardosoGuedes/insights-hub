import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DashboardHeader = () => {
  const [period, setPeriod] = useState("30");
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-card rounded-xl border shadow-sm">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-primary" />
        <div>
          <h2 className="font-semibold text-card-foreground">Período de Análise</h2>
          <p className="text-sm text-muted-foreground">Selecione o intervalo para visualização</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selecione o período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">Aplicar Filtros</Button>
      </div>
    </div>
  );
};
