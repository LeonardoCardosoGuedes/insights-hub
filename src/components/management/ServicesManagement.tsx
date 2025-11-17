import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, Utensils } from "lucide-react";

const serviceSchema = z.object({
  fk_reserva_id: z.number().min(1, "Selecione uma reserva"),
  tipo: z.string().min(1, "Tipo do serviço obrigatório"),
  preco: z.number().min(0, "Preço deve ser positivo"),
  data_realizada: z.string().optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export const ServicesManagement = () => {
  const [services, setServices] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      fk_reserva_id: 0,
      tipo: "",
      preco: 0,
      data_realizada: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    fetchServices();
    fetchReservations();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("servico_adicional")
      .select(`
        *,
        reserva:fk_reserva_id(
          id_reserva,
          hospede:fk_id_hospede(pessoa:fk_pessoa_cpf(nome_completo))
        )
      `)
      .order("data_realizada", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar serviços", description: error.message, variant: "destructive" });
    } else {
      setServices(data || []);
    }
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reserva")
      .select(`
        id_reserva,
        hospede:fk_id_hospede(pessoa:fk_pessoa_cpf(nome_completo)),
        quarto:fk_quarto_numero(numero)
      `);

    if (error) {
      toast({ title: "Erro ao carregar reservas", description: error.message, variant: "destructive" });
    } else {
      setReservations(data || []);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    try {
      const dataRealizada = data.data_realizada
        ? new Date(data.data_realizada).toISOString()
        : new Date().toISOString();

      if (editingId) {
        const { error } = await supabase
          .from("servico_adicional")
          .update({
            tipo: data.tipo,
            preco: data.preco,
            data_realizada: dataRealizada,
          })
          .eq("id_servico", editingId);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Serviço atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("servico_adicional")
          .insert([{
            fk_reserva_id: data.fk_reserva_id,
            tipo: data.tipo,
            preco: data.preco,
            data_realizada: dataRealizada,
          }]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Serviço cadastrado com sucesso!" });
      }

      form.reset();
      setEditingId(null);
      fetchServices();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id_servico);
    form.reset({
      fk_reserva_id: service.fk_reserva_id,
      tipo: service.tipo,
      preco: service.preco,
      data_realizada: service.data_realizada?.split("T")[0] || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;

    const { error } = await supabase.from("servico_adicional").delete().eq("id_servico", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Serviço excluído com sucesso!" });
      fetchServices();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            {editingId ? "Editar Serviço" : "Novo Serviço Adicional"}
          </CardTitle>
          <CardDescription>
            Adicione serviços extras para as reservas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fk_reserva_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reserva *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a reserva" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reservations.map((res) => (
                            <SelectItem
                              key={res.id_reserva}
                              value={res.id_reserva.toString()}
                            >
                              Reserva #{res.id_reserva} - {res.hospede?.pessoa?.nome_completo} (Quarto {res.quarto?.numero})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Serviço *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Café da Manhã">Café da Manhã</SelectItem>
                          <SelectItem value="Almoço">Almoço</SelectItem>
                          <SelectItem value="Jantar">Jantar</SelectItem>
                          <SelectItem value="Lavanderia">Lavanderia</SelectItem>
                          <SelectItem value="Spa">Spa</SelectItem>
                          <SelectItem value="Transfer">Transfer</SelectItem>
                          <SelectItem value="Internet Premium">Internet Premium</SelectItem>
                          <SelectItem value="Frigobar">Frigobar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_realizada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Realização</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? "Atualizar" : "Cadastrar"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      form.reset();
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços Adicionais</CardTitle>
          <CardDescription>Lista de todos os serviços prestados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reserva</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id_servico}>
                  <TableCell>{service.id_servico}</TableCell>
                  <TableCell>#{service.fk_reserva_id}</TableCell>
                  <TableCell>{service.reserva?.hospede?.pessoa?.nome_completo}</TableCell>
                  <TableCell>{service.tipo}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(service.preco)}
                  </TableCell>
                  <TableCell>
                    {new Date(service.data_realizada).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(service.id_servico)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
