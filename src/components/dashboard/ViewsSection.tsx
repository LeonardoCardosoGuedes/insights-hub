import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const ViewsSection = () => {
  const { data: reservasCompletas, isLoading: loadingReservas } = useQuery({
    queryKey: ["vw-reservas-completas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_reservas_completas")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: relatorioFinanceiro, isLoading: loadingFinanceiro } = useQuery({
    queryKey: ["vw-relatorio-financeiro"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vw_relatorio_financeiro")
        .select("*")
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Consultas e Views do Banco de Dados</h2>
      
      {/* View 1: Reservas Completas */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Completas</CardTitle>
          <CardDescription>
            Visualização completa de reservas com dados de hóspedes, pessoas e quartos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReservas ? (
            <Skeleton className="h-64" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Hóspede</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Quarto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Dias</TableHead>
                    <TableHead>Hóspedes</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservasCompletas?.map((reserva) => (
                    <TableRow key={reserva.id_reserva}>
                      <TableCell className="font-medium">#{reserva.id_reserva}</TableCell>
                      <TableCell>{reserva.nome_hospede}</TableCell>
                      <TableCell className="text-xs">{reserva.cpf}</TableCell>
                      <TableCell>{reserva.numero_quarto}</TableCell>
                      <TableCell>{reserva.tipo_quarto}</TableCell>
                      <TableCell>{new Date(reserva.data_entrada).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{new Date(reserva.data_saida).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{reserva.dias_hospedagem}</TableCell>
                      <TableCell>{reserva.quantidade_hospedes}</TableCell>
                      <TableCell className="font-semibold">
                        R$ {Number(reserva.valor_total).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={reserva.status_quarto === "Disponível" ? "default" : "secondary"}>
                          {reserva.status_quarto}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View 2: Relatório Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Relatório Financeiro</CardTitle>
          <CardDescription>
            Análise financeira de reservas incluindo serviços adicionais e informações de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingFinanceiro ? (
            <Skeleton className="h-64" />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Hóspede</TableHead>
                    <TableHead>Quarto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Valor Reserva</TableHead>
                    <TableHead>Serviços</TableHead>
                    <TableHead>Total Geral</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorioFinanceiro?.map((relatorio) => (
                    <TableRow key={relatorio.id_reserva}>
                      <TableCell className="font-medium">#{relatorio.id_reserva}</TableCell>
                      <TableCell>{relatorio.nome_hospede}</TableCell>
                      <TableCell>{relatorio.numero_quarto}</TableCell>
                      <TableCell>{relatorio.tipo_quarto}</TableCell>
                      <TableCell>{new Date(relatorio.data_entrada).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>{new Date(relatorio.data_saida).toLocaleDateString("pt-BR")}</TableCell>
                      <TableCell>
                        R$ {Number(relatorio.valor_reserva).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-accent font-medium">
                        R$ {Number(relatorio.total_servicos_adicionais).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="font-bold">
                        R$ {Number(relatorio.valor_total_geral).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{relatorio.tipo_pagamento || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={relatorio.status_pagamento === "Pago" ? "default" : "destructive"}>
                          {relatorio.status_pagamento || "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
