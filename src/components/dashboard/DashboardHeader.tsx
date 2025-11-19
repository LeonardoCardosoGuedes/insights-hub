// src/components/dashboard/DashboardHeader.tsx
import { Calendar } from "lucide-react";

export const DashboardHeader = () => {
  return (
    <div className="flex items-center justify-between gap-4 p-6 bg-card rounded-xl border shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Calendar className="w-6 h-6" />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">
            Hotel Guedes
          </h2>
          <p className="text-sm text-muted-foreground">
            Bem-vindo ao dashboard do Hotel Guedes. Acompanhe reservas, hóspedes
            e operações do hotel em um único lugar, de forma simples e visual.
          </p>
        </div>
      </div>
    </div>
  );
};
