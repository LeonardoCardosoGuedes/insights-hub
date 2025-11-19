import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { GuestsManagement } from "@/components/management/GuestsManagement";
import { RoomsManagement } from "@/components/management/RoomsManagement";
import { ReservationsManagement } from "@/components/management/ReservationsManagement";
import { ServicesManagement } from "@/components/management/ServicesManagement";

const Gerenciamento = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Gerenciamento do Hotel
            </h1>
            <p className="text-muted-foreground">
              Cadastro e gestão de hóspedes, quartos, reservas e serviços
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>

        <Card className="p-6 bg-card/50 backdrop-blur border-primary/10">
          <Tabs defaultValue="guests" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="guests">Hóspedes</TabsTrigger>
              <TabsTrigger value="rooms">Quartos</TabsTrigger>
              <TabsTrigger value="reservations">Reservas</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
            </TabsList>

            <TabsContent value="guests">
              <GuestsManagement />
            </TabsContent>

            <TabsContent value="rooms">
              <RoomsManagement />
            </TabsContent>

            <TabsContent value="reservations">
              <ReservationsManagement />
            </TabsContent>

            <TabsContent value="services">
              <ServicesManagement />
            </TabsContent>

          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Gerenciamento;