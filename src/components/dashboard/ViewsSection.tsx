// src/components/dashboard/ViewsSection.tsx
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

const API_BASE_URL = "http://localhost:3004/api";

export const ViewsSection = () => {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["views-section"],
    queryFn: async () => {
      const [reservasRes, quartosRes, pessoasRes, pessoasHospRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/reservas`),
          fetch(`${API_BASE_URL}/quartos`),
          fetch(`${API_BASE_URL}/pessoas`),
          fetch(`${API_BASE_URL}/pessoas&hospedes`),
        ]);

      return {
        reservas: await reservasRes.json(),
        quartos: await quartosRes.json(),
        pessoas: await pessoasRes.json(),
        pessoasHospedes: await pessoasHospRes.json(),
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const searchNormalized = search.toLowerCase().trim();

  const pessoasFiltradas =
    data?.pessoas.filter((p: any) => {
      if (!searchNormalized) return true;
      return (
        p.nomeCompleto.toLowerCase().includes(searchNormalized) ||
        p.cpf.toLowerCase().includes(searchNormalized)
      );
    }) || [];

  const hospedesFiltrados =
    data?.pessoasHospedes
      .filter((p: any) => p.status === "É hóspede")
      .filter((p: any) => {
        if (!searchNormalized) return true;
        return (
          p.nome_completo.toLowerCase().includes(searchNormalized) ||
          p.cpf.toLowerCase().includes(searchNormalized)
        );
      }) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* RESERVAS */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Reservas</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 max-h-80 overflow-auto">
          {data?.reservas.map((r: any) => {
            // Formatando entrada e saída para dd/mm/aaaa
            const entrada = new Date(r.data_entrada.join("-")).toLocaleDateString("pt-BR");
            const saida = new Date(r.data_saida.join("-")).toLocaleDateString("pt-BR");

            return (
              <div
                key={r.id}
                className="border p-2 rounded-md flex justify-between"
              >
                <div>
                  <p className="text-sm font-bold">
                    Quarto {r.numero_quarto} — Hóspede #{r.id_hospede}
                  </p>

                  <p className="text-xs">Entrada: {entrada}</p>
                  <p className="text-xs">Saída: {saida}</p>
                </div>

                <p className="font-semibold">
                  R$ {Number(r.valor_total).toLocaleString("pt-BR")}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>


      {/* QUARTOS */}
      <Card>
        <CardHeader>
          <CardTitle>Quartos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-auto">
          {data?.quartos.map((q: any) => (
            <div
              key={q.numero}
              className="border p-2 rounded-md flex justify-between"
            >
              <div>
                <p className="text-sm font-bold">
                  Quarto {q.numero} — {q.tipo}
                </p>
                <p className="text-xs">Capacidade: {q.capacidade}</p>
              </div>
              <p className="font-semibold">
                {q.statusAtual === "Livre" ? "🟢 Livre" : "🔴 Ocupado"}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* BARRA DE PESQUISA (ocupa as 2 colunas) */}
      <div className="lg:col-span-2 flex flex-col gap-2 mt-2">
        <label className="text-sm font-medium text-muted-foreground">
          Buscar pessoa (nome ou CPF)
        </label>
        <Input
          placeholder="Digite o nome ou CPF..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* PESSOAS CADASTRADAS */}
      <Card>
        <CardHeader>
          <CardTitle>Pessoas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-auto">
          {pessoasFiltradas.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhuma pessoa encontrada.
            </p>
          )}

          {pessoasFiltradas.map((p: any) => (
            <div key={p.cpf} className="border p-2 rounded-md">
              <p className="font-bold text-sm">{p.nomeCompleto}</p>
              <p className="text-xs">
                {p.endereco.cidade} — {p.endereco.bairro}
              </p>
              <p className="text-xs text-muted-foreground">{p.cpf}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* HÓSPEDES */}
      <Card>
        <CardHeader>
          <CardTitle>Hóspedes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-80 overflow-auto">
          {hospedesFiltrados.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum hóspede encontrado.
            </p>
          )}

          {hospedesFiltrados.map((p: any) => (
            <div
              key={p.cpf}
              className="border p-2 rounded-md flex justify-between"
            >
              <div>
                <p className="font-bold text-sm">{p.nome_completo}</p>
                <p className="text-xs">{p.cpf}</p>
              </div>
              <p className="font-semibold text-green-600">É hóspede</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
