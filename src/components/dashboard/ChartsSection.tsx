// src/components/dashboard/ChartsSection.tsx
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE_URL = "http://localhost:3004/api";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

// Tipagens básicas de acordo com as respostas das APIs
type Reserva = {
  id: number;
  data_entrada: [number, number, number];
  data_saida: [number, number, number];
  quantidade_hospedes: number;
  valor_total: number;
  id_hospede: number;
  numero_quarto: number;
};

type Quarto = {
  numero: number;
  capacidade: number;
  tipo: string;
  valor_diaria: number;
  statusAtual: string;
};

type Endereco = {
  rua: string;
  bairro: string;
  cidade: string;
  cep: string;
};

type Pessoa = {
  cpf: string;
  nomeCompleto: string;
  dataNascimento: [number, number, number];
  estadoCivil: string;
  genero: string;
  endereco: Endereco;
};

type PessoaHospedeStatus = {
  data_nascimento: number; // timestamp
  cpf: string;
  id_hospede: number | null;
  nome_completo: string;
  status: "É hóspede" | "Não é hóspede";
};

export const ChartsSection = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["chart-data"],
    queryFn: async () => {
      const [reservasRes, quartosRes, pessoasHospRes, servicosRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/reservas`),
          fetch(`${API_BASE_URL}/quartos`),
          fetch(`${API_BASE_URL}/pessoas&hospedes`),
          fetch(`${API_BASE_URL}/servicos/distribuicao`), // <- procedure de serviços
        ]);

      const reservas: Reserva[] = await reservasRes.json();
      const quartos: Quarto[] = await quartosRes.json();
      const pessoasHospedes: PessoaHospedeStatus[] =
        await pessoasHospRes.json();
      const servicosDistribuicao: ServicoDistribuicao[] =
        await servicosRes.json();


      // --------------------------------------------------
      // Chart 1: Distribuição por tipo de quarto (Pizza)
      // --------------------------------------------------
      const tipoQuartoDistribution = quartos.reduce<Record<string, number>>(
        (acc, q) => {
          acc[q.tipo] = (acc[q.tipo] || 0) + 1;
          return acc;
        },
        {}
      );

      const tipoQuartoData = Object.entries(tipoQuartoDistribution).map(
        ([name, value]) => ({
          name,
          value,
        })
      );

      // --------------------------------------------------
      // Chart 2: Receita por tipo de quarto (Barras)
      // precisa juntar reservas + quartos pelo numero_quarto
      // --------------------------------------------------
      const receitaPorTipo = reservas.reduce<Record<string, number>>(
        (acc, r) => {
          const quarto = quartos.find((q) => q.numero === r.numero_quarto);
          const tipo = quarto?.tipo || "Outros";
          acc[tipo] = (acc[tipo] || 0) + (Number(r.valor_total) || 0);
          return acc;
        },
        {}
      );

      const receitaTipoData = Object.entries(receitaPorTipo).map(
        ([tipo, receita]) => ({
          tipo,
          receita,
        })
      );

      // --------------------------------------------------
      // Chart 3: Distribuição de hóspedes por reserva (Barras)
      // + média, mediana e moda
      // --------------------------------------------------
      const mediaHospedesArray =
        reservas.map((r) => r.quantidade_hospedes || 0) || [];
      const soma = mediaHospedesArray.reduce((a, b) => a + b, 0);
      const media = mediaHospedesArray.length
        ? soma / mediaHospedesArray.length
        : 0;
      const ordenado = [...mediaHospedesArray].sort((a, b) => a - b);
      const mediana = ordenado.length
        ? ordenado[Math.floor(ordenado.length / 2)]
        : 0;

      const distribuicaoHospedes = mediaHospedesArray.reduce<
        Record<number, number>
      >((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      const moda =
        Number(
          Object.entries(distribuicaoHospedes).sort(
            (a, b) => (b[1] as number) - (a[1] as number)
          )[0]?.[0]
        ) || 0;

      const distribuicaoData = Object.entries(distribuicaoHospedes).map(
        ([hospedes, freq]) => ({
          hospedes: `${hospedes} hóspedes`,
          frequencia: freq,
        })
      );

      // --------------------------------------------------
      // Chart 4: Estatísticas de valores de diária (Linha)
      // --------------------------------------------------
      const diarias = quartos.map((q) => Number(q.valor_diaria) || 0) || [];
      const mediaDiarias =
        diarias.reduce((a, b) => a + b, 0) / (diarias.length || 1);
      const variancia =
        diarias.reduce(
          (acc, val) => acc + Math.pow(val - mediaDiarias, 2),
          0
        ) / (diarias.length || 1);
      const desvioPadrao = Math.sqrt(variancia);
      const minDiaria = diarias.length ? Math.min(...diarias) : 0;
      const maxDiaria = diarias.length ? Math.max(...diarias) : 0;

      const estatisticasDiarias = [
        { metrica: "Média", valor: mediaDiarias },
        { metrica: "Variância", valor: variancia },
        { metrica: "Desvio Padrão", valor: desvioPadrao },
        { metrica: "Mínimo", valor: minDiaria },
        { metrica: "Máximo", valor: maxDiaria },
      ];

      // --------------------------------------------------
      // Chart 5: Distribuição de serviços adicionais (Radar)
      // usando /api/servicos/distribuicao
      // --------------------------------------------------
      const servicosAdicionaisData = servicosDistribuicao.map(
        ({ tipo, quantidade }) => ({
          tipo,
          quantidade,
        })
      );


      // --------------------------------------------------
      // Chart 6: Hóspedes x Não hóspedes (Pizza)
      // usando /api/pessoas&hospedes
      // --------------------------------------------------
      const hospedeVsNao = pessoasHospedes.reduce<Record<string, number>>(
        (acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1;
          return acc;
        },
        {}
      );

      const hospedeStatusData = Object.entries(hospedeVsNao).map(
        ([name, value]) => ({
          name,
          value,
        })
      );

      return {
        tipoQuartoData,
        receitaTipoData,
        distribuicaoData,
        estatisticasDiarias,
        servicosAdicionaisData,
        hospedeStatusData,
        estatisticas: { media, mediana, moda, variancia, desvioPadrao },
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
            <CardDescription>
              Frequência absoluta dos tipos de quartos disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.tipoQuartoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData?.tipoQuartoData?.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
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
            <CardDescription>
              Comparativo de receita total gerada por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData?.receitaTipoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tipo" />
                <YAxis />
                <Tooltip
                  formatter={(value) =>
                    `R$ ${Number(value).toLocaleString("pt-BR")}`
                  }
                />
                <Legend />
                <Bar
                  dataKey="receita"
                  fill="hsl(var(--chart-1))"
                  name="Receita (R$)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 3: Distribuição de Hóspedes */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Hóspedes por Reserva</CardTitle>
            <CardDescription>
              Média: {chartData?.estatisticas.media.toFixed(2)} | Mediana:{" "}
              {chartData?.estatisticas.mediana} | Moda:{" "}
              {chartData?.estatisticas.moda}
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
                <Bar
                  dataKey="frequencia"
                  fill="hsl(var(--chart-2))"
                  name="Frequência"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Estatísticas de Diárias */}
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas de Valores de Diária</CardTitle>
            <CardDescription>
              Variância: R${" "}
              {chartData?.estatisticas.variancia.toFixed(2)} | Desvio Padrão:
              R$ {chartData?.estatisticas.desvioPadrao.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData?.estatisticasDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metrica" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toFixed(2)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  name="Valor (R$)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chart 5: Serviços Adicionais (Radar) */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Serviços Adicionais</CardTitle>
            <CardDescription>
              Análise de frequência dos serviços mais solicitados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={chartData?.servicosAdicionaisData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="tipo" />
                <PolarRadiusAxis />
                <Radar
                  name="Quantidade"
                  dataKey="quantidade"
                  stroke="hsl(var(--chart-4))"
                  fill="hsl(var(--chart-4))"
                  fillOpacity={0.6}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>


        {/* Chart 6: Hóspedes x Não Hóspedes */}
        <Card>
          <CardHeader>
            <CardTitle>Hóspedes x Não Hóspedes</CardTitle>
            <CardDescription>
              Proporção de pessoas que são hóspedes no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData?.hospedeStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData?.hospedeStatusData?.map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-status-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
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
