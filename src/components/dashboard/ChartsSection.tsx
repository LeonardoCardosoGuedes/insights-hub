import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))"];

export const ChartsSection = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart-data"],
    queryFn: async () => {
      const [reservas, quartos, servicos, pagamentos] = await Promise.all([
        supabase.from("reserva").select("*, quarto(tipo, valor_diaria), hospede(*)"),
        supabase.from("quarto").select("*"),
        supabase.from("servico_adicional").select("tipo, preco"),
        supabase.from("pagamento").select("tipo, status_atual"),
      ]);

      // Chart 1: Distribuição por tipo de quarto (Gráfico de Pizza)
      const tipoQuartoDistribution = quartos.data?.reduce((acc: any, q) => {
        acc[q.tipo] = (acc[q.tipo] || 0) + 1;
        return acc;
      }, {});
      
      const tipoQuartoData = Object.entries(tipoQuartoDistribution || {}).map(([name, value]) => ({
        name,
        value,
      }));

      // Chart 2: Receita por tipo de quarto (Gráfico de Barras)
      const receitaPorTipo = reservas.data?.reduce((acc: any, r) => {
        const tipo = r.quarto?.tipo || "Outros";
        acc[tipo] = (acc[tipo] || 0) + (Number(r.valor_total) || 0);
        return acc;
      }, {});
      
      const receitaTipoData = Object.entries(receitaPorTipo || {}).map(([tipo, receita]) => ({
        tipo,
        receita,
      }));

      // Chart 3: Média de hóspedes por reserva (Estatística)
      const mediaHospedes = reservas.data?.map(r => r.quantidade_hospedes || 0) || [];
      const soma = mediaHospedes.reduce((a, b) => a + b, 0);
      const media = mediaHospedes.length ? soma / mediaHospedes.length : 0;
      const ordenado = [...mediaHospedes].sort((a, b) => a - b);
      const mediana = ordenado.length ? ordenado[Math.floor(ordenado.length / 2)] : 0;
      
      const distribuicaoHospedes = mediaHospedes.reduce((acc: any, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      const moda = Object.entries(distribuicaoHospedes).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 0;
      
      const distribuicaoData = Object.entries(distribuicaoHospedes).map(([hospedes, freq]) => ({
        hospedes: `${hospedes} hóspedes`,
        frequencia: freq,
      }));

      // Chart 4: Variância e Desvio Padrão dos valores de diária (Linha)
      const diarias = quartos.data?.map(q => Number(q.valor_diaria) || 0) || [];
      const mediaDiarias = diarias.reduce((a, b) => a + b, 0) / (diarias.length || 1);
      const variancia = diarias.reduce((acc, val) => acc + Math.pow(val - mediaDiarias, 2), 0) / (diarias.length || 1);
      const desvioPadrao = Math.sqrt(variancia);
      
      const estatisticasDiarias = [
        { metrica: "Média", valor: mediaDiarias },
        { metrica: "Variância", valor: variancia },
        { metrica: "Desvio Padrão", valor: desvioPadrao },
        { metrica: "Mínimo", valor: Math.min(...diarias) },
        { metrica: "Máximo", valor: Math.max(...diarias) },
      ];

      // Chart 5: Distribuição de serviços adicionais (Radar)
      const servicosDistribuicao = servicos.data?.reduce((acc: any, s) => {
        acc[s.tipo] = (acc[s.tipo] || 0) + 1;
        return acc;
      }, {});
      
      const servicosData = Object.entries(servicosDistribuicao || {}).map(([tipo, quantidade]) => ({
        tipo,
        quantidade,
      }));

      // Chart 6: Status de pagamentos (Pizza)
      const statusPagamentos = pagamentos.data?.reduce((acc: any, p) => {
        acc[p.status_atual] = (acc[p.status_atual] || 0) + 1;
        return acc;
      }, {});
      
      const pagamentosData = Object.entries(statusPagamentos || {}).map(([status, quantidade]) => ({
        name: status,
        value: quantidade,
      }));

      return {
        tipoQuartoData,
        receitaTipoData,
        distribuicaoData,
        estatisticasDiarias,
        servicosData,
        pagamentosData,
        estatisticas: { media, mediana, moda: Number(moda), variancia, desvioPadrao },
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Análises Estatísticas</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Análises Estatísticas</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Distribuição por Tipo de Quarto */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo de Quarto</CardTitle>
            <CardDescription>Frequência absoluta dos tipos de quartos disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.tipoQuartoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData?.tipoQuartoData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Receita por Tipo de Quarto */}
        <Card>
          <CardHeader>
            <CardTitle>Receita por Tipo de Quarto</CardTitle>
            <CardDescription>Comparativo de receita total gerada por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.receitaTipoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString("pt-BR")}`} />
                <Legend />
                <Bar dataKey="receita" fill="hsl(var(--chart-1))" name="Receita (R$)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Distribuição de Hóspedes */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Hóspedes por Reserva</CardTitle>
            <CardDescription>
              Média: {chartData?.estatisticas.media.toFixed(2)} | Mediana: {chartData?.estatisticas.mediana} | Moda: {chartData?.estatisticas.moda}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.distribuicaoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hospedes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="frequencia" fill="hsl(var(--chart-2))" name="Frequência" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Estatísticas de Diárias */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Valores de Diária</CardTitle>
            <CardDescription>
              Variância: R$ {chartData?.estatisticas.variancia.toFixed(2)} | Desvio Padrão: R$ {chartData?.estatisticas.desvioPadrao.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData?.estatisticasDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metrica" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="valor" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Valor (R$)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Serviços Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Serviços Adicionais</CardTitle>
            <CardDescription>Análise de frequência dos serviços mais solicitados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData?.servicosData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="tipo" />
                <PolarRadiusAxis />
                <Radar name="Quantidade" dataKey="quantidade" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 6: Status de Pagamentos */}
        <Card>
          <CardHeader>
            <CardTitle>Status de Pagamentos</CardTitle>
            <CardDescription>Proporção de pagamentos por status atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.pagamentosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData?.pagamentosData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
