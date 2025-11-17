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
import { Trash2, Edit, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const paymentSchema = z.object({
  fk_reserva_id: z.number().min(1, "Selecione uma reserva"),
  tipo: z.string().min(1, "Tipo de pagamento obrigatório"),
  status_atual: z.string().min(1, "Status obrigatório"),
  juros: z.number().min(0, "Juros deve ser positivo").optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const PaymentsManagement = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      fk_reserva_id: 0,
      tipo: "",
      status_atual: "Pendente",
      juros: 0,
    },
  });

  useEffect(() => {
    fetchPayments();
    fetchReservations();
  }, []);

  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from("pagamento")
      .select(`
        *,
        reserva:fk_reserva_id(
          id_reserva,
          valor_total,
          hospede:fk_id_hospede(pessoa:fk_pessoa_cpf(nome_completo))
        )
      `)
      .order("id_pagamento", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar pagamentos", description: error.message, variant: "destructive" });
    } else {
      setPayments(data || []);
    }
  };

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reserva")
      .select(`
        id_reserva,
        valor_total,
        hospede:fk_id_hospede(pessoa:fk_pessoa_cpf(nome_completo)),
        quarto:fk_quarto_numero(numero)
      `);

    if (error) {
      toast({ title: "Erro ao carregar reservas", description: error.message, variant: "destructive" });
    } else {
      setReservations(data || []);
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from("pagamento")
          .update({
            tipo: data.tipo,
            status_atual: data.status_atual,
            juros: data.juros || null,
          })
          .eq("id_pagamento", editingId);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Pagamento atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("pagamento")
          .insert([{
            fk_reserva_id: data.fk_reserva_id,
            tipo: data.tipo,
            status_atual: data.status_atual,
            juros: data.juros || null,
          }]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Pagamento cadastrado com sucesso!" });
      }

      form.reset();
      setEditingId(null);
      fetchPayments();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (payment: any) => {
    setEditingId(payment.id_pagamento);
    form.reset({
      fk_reserva_id: payment.fk_reserva_id,
      tipo: payment.tipo,
      status_atual: payment.status_atual,
      juros: payment.juros || 0,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este pagamento?")) return;

    const { error } = await supabase.from("pagamento").delete().eq("id_pagamento", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Pagamento excluído com sucesso!" });
      fetchPayments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago": return "bg-green-500";
      case "Pendente": return "bg-yellow-500";
      case "Atrasado": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {editingId ? "Editar Pagamento" : "Novo Pagamento"}
          </CardTitle>
          <CardDescription>
            Registre informações de pagamento para reservas
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
                              Reserva #{res.id_reserva} - {res.hospede?.pessoa?.nome_completo} - R$ {res.valor_total}
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
                      <FormLabel>Tipo de Pagamento *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                          <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                          <SelectItem value="PIX">PIX</SelectItem>
                          <SelectItem value="Transferência">Transferência Bancária</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status_atual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Pago">Pago</SelectItem>
                          <SelectItem value="Atrasado">Atrasado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="juros"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Juros (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
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
          <CardTitle>Pagamentos Registrados</CardTitle>
          <CardDescription>Lista de todos os pagamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reserva</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor Reserva</TableHead>
                <TableHead>Juros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id_pagamento}>
                  <TableCell>{payment.id_pagamento}</TableCell>
                  <TableCell>#{payment.fk_reserva_id}</TableCell>
                  <TableCell>{payment.reserva?.hospede?.pessoa?.nome_completo}</TableCell>
                  <TableCell>{payment.tipo}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(payment.reserva?.valor_total || 0)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(payment.juros || 0)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status_atual)}>
                      {payment.status_atual}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(payment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(payment.id_pagamento)}
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
