import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:3004/api";

// ------------------------- TIPAGENS -------------------------
type Servico = {
  id_servico: number;
  tipo: string;
  preco: number;
  data_realizada: string; // vem como string ISO
  fk_reserva_id: number;
};

// Schema do form (tipo, preco, fk_reserva_id)
const serviceSchema = z.object({
  tipo: z
    .string()
    .min(3, "Tipo deve ter pelo menos 3 caracteres")
    .max(150, "Tipo muito longo"),
  preco: z
    .string()
    .min(1, "Preço é obrigatório")
    .refine((val) => !isNaN(Number(val.replace(",", "."))), {
      message: "Preço deve ser um número válido",
    }),
  fk_reserva_id: z
    .string()
    .min(1, "ID da reserva é obrigatório")
    .refine((val) => !isNaN(Number(val)), {
      message: "ID da reserva deve ser numérico",
    }),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

// ------------------------- COMPONENTE -------------------------
export const ServicesManagement = () => {
  const [services, setServices] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      tipo: "",
      preco: "",
      fk_reserva_id: "",
    },
  });

  // ------------------------- CARREGAR SERVIÇOS -------------------------
  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/servicos`);
      if (!res.ok) {
        throw new Error("Erro ao buscar serviços adicionais");
      }

      const data = await res.json();

      // Normaliza o campo "preco" para garantir que seja número
      const normalizados: Servico[] = (data || []).map((service: any) => ({
        ...service,
        // se vier como string, converte; se vier como número, mantém
        preco: Number(
          String(service.preco ?? service.valor ?? service.valor_servico).replace(
            ",",
            "."
          )
        ),
      }));

      console.log("Serviços recebidos da API:", normalizados);

      setServices(normalizados);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro ao carregar serviços",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // ------------------------- SUBMIT -------------------------
  const onSubmit = async (data: ServiceFormData) => {
    try {
      const precoNumber = Number(data.preco.replace(",", "."));
      const reservaIdNumber = Number(data.fk_reserva_id);

      if (isNaN(precoNumber) || isNaN(reservaIdNumber)) {
        toast({
          title: "Dados inválidos",
          description: "Verifique o preço e o ID da reserva.",
          variant: "destructive",
        });
        return;
      }

      await createService({
        tipo: data.tipo,
        preco: precoNumber,
        fk_reserva_id: reservaIdNumber,
      });

      form.reset({
        tipo: "",
        preco: "",
        fk_reserva_id: "",
      });

      await fetchServices();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o serviço.",
        variant: "destructive",
      });
    }
  };

  // ------------------------- CRIAR SERVIÇO -------------------------
  const createService = async (payload: {
    tipo: string;
    preco: number;
    fk_reserva_id: number;
  }) => {
    const res = await fetch(`${API_BASE_URL}/servicos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || err.erro || "Erro ao cadastrar serviço");
    }

    toast({
      title: "Sucesso",
      description: "Serviço adicional cadastrado com sucesso!",
    });
  };

  // ------------------------- JSX -------------------------
  return (
    <div className="space-y-6">
      {/* FORMULÁRIO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Registrar Serviço Adicional
          </CardTitle>
          <CardDescription>
            Registre serviços consumidos vinculados a uma reserva (ex.: café da
            manhã, lavanderia, spa).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Tipo */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo do Serviço *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex.: Lavanderia, Café da manhã, SPA..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preço */}
                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex.: 25,00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ID da Reserva */}
                <FormField
                  control={form.control}
                  name="fk_reserva_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID da Reserva *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex.: 1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  Cadastrar Serviço
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* LISTA / TABELA */}
      <Card>
        <CardHeader>
          <CardTitle>Serviços Adicionais Registrados</CardTitle>
          <CardDescription>
            Histórico de serviços consumidos por reserva.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando serviços...</p>
          ) : services.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum serviço registrado até o momento.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço (R$)</TableHead>
                  <TableHead>Reserva</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id_servico}>
                    <TableCell>{service.id_servico}</TableCell>
                    <TableCell>{service.tipo}</TableCell>
                    <TableCell>
                      {Number(service.preco).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{service.fk_reserva_id}</TableCell>
                    <TableCell>
                      {service.data_realizada
                        ? new Date(service.data_realizada).toLocaleString(
                            "pt-BR"
                          )
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
