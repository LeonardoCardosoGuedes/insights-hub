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
import { Trash2, Edit, Calendar } from "lucide-react";

const API_BASE_URL = "http://localhost:3004/api"; // API JAVA

/* ----------------------- SCHEMA ----------------------- */
const reservationSchema = z.object({
  fk_id_hospede: z.number().min(1, "Selecione um hóspede"),
  fk_quarto_numero: z.number().min(1, "Selecione um quarto"),
  data_entrada: z.string().min(1, "Data de entrada obrigatória"),
  data_saida: z.string().min(1, "Data de saída obrigatória"),
  quantidade_hospedes: z.number().min(1, "Mínimo 1 hóspede"),
  valor_total: z.number().min(0, "Valor deve ser positivo"),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

export const ReservationsManagement = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [guests, setGuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      fk_id_hospede: 0,
      fk_quarto_numero: 0,
      data_entrada: "",
      data_saida: "",
      quantidade_hospedes: 1,
      valor_total: 0,
    },
  });

  /* ----------------------- USE EFFECT ----------------------- */
  useEffect(() => {
    fetchReservations();
    fetchGuests();
    fetchRooms(); // agora carrega da API Java
  }, []);

  /* ----------------------- BUSCA RESERVAS ----------------------- */
  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reserva")
      .select(`
        *,
        hospede(id_hospede, pessoa:fk_pessoa_cpf(nome_completo)),
        quarto:fk_quarto_numero(numero, tipo)
      `)
      .order("data_entrada", { ascending: false });

    if (error) {
      toast({ title: "Erro ao carregar reservas", description: error.message, variant: "destructive" });
    } else {
      setReservations(data || []);
    }
  };

  /* ----------------------- BUSCA HÓSPEDES ----------------------- */
  const fetchGuests = async () => {
    const { data, error } = await supabase
      .from("hospede")
      .select("id_hospede, pessoa:fk_pessoa_cpf(nome_completo, cpf)");

    if (error) {
      toast({ title: "Erro ao carregar hóspedes", description: error.message, variant: "destructive" });
    } else {
      setGuests(data || []);
    }
  };

  /* ----------------------- BUSCA QUARTOS DA API JAVA ----------------------- */
  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/quartos`);
      if (!res.ok) throw new Error("Erro ao carregar quartos");

      const data = await res.json();

      const normalizados = (data || []).map((room: any) => ({
        ...room,
        valorDiaria: Number(
          room.valorDiaria ?? room.valor_diaria ?? room.valor ?? 0
        ),
      }));

      setRooms(normalizados);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar quartos",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /* ----------------------- SUBMIT ----------------------- */
  const onSubmit = async (data: ReservationFormData) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from("reserva")
          .update({
            fk_quarto_numero: data.fk_quarto_numero,
            quantidade_hospedes: data.quantidade_hospedes,
            valor_total: data.valor_total,
            data_entrada: new Date(data.data_entrada).toISOString(),
            data_saida: new Date(data.data_saida).toISOString(),
          })
          .eq("id_reserva", editingId);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Reserva atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from("reserva")
          .insert([
            {
              fk_id_hospede: data.fk_id_hospede,
              fk_quarto_numero: data.fk_quarto_numero,
              quantidade_hospedes: data.quantidade_hospedes,
              valor_total: data.valor_total,
              data_entrada: new Date(data.data_entrada).toISOString(),
              data_saida: new Date(data.data_saida).toISOString(),
            },
          ]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Reserva cadastrada com sucesso!" });
      }

      form.reset();
      setEditingId(null);
      fetchReservations();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  /* ----------------------- EDIT ----------------------- */
  const handleEdit = (reservation: any) => {
    setEditingId(reservation.id_reserva);
    form.reset({
      fk_id_hospede: reservation.fk_id_hospede,
      fk_quarto_numero: reservation.fk_quarto_numero,
      data_entrada: reservation.data_entrada?.split("T")[0],
      data_saida: reservation.data_saida?.split("T")[0],
      quantidade_hospedes: reservation.quantidade_hospedes,
      valor_total: reservation.valor_total,
    });
  };

  /* ----------------------- DELETE ----------------------- */
  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;

    const { error } = await supabase.from("reserva").delete().eq("id_reserva", id);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Reserva excluída com sucesso!" });
      fetchReservations();
    }
  };

  /* ----------------------- RENDER ----------------------- */
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingId ? "Editar Reserva" : "Nova Reserva"}
          </CardTitle>
          <CardDescription>
            Registre uma nova reserva de quarto
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* HÓSPEDE */}
                <FormField
                  control={form.control}
                  name="fk_id_hospede"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hóspede *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o hóspede" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guests.map((guest) => (
                            <SelectItem
                              key={guest.id_hospede}
                              value={guest.id_hospede.toString()}
                            >
                              {guest.pessoa?.nome_completo} - CPF: {guest.pessoa?.cpf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* QUARTO */}
                <FormField
                  control={form.control}
                  name="fk_quarto_numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quarto *</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o quarto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem
                              key={room.numero}
                              value={room.numero.toString()}
                            >
                              Quarto {room.numero} - {room.tipo} (R$ {room.valorDiaria})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* QUANTIDADE */}
                <FormField
                  control={form.control}
                  name="quantidade_hospedes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade de Hóspedes *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DATA ENTRADA */}
                <FormField
                  control={form.control}
                  name="data_entrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Entrada *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* DATA SAÍDA */}
                <FormField
                  control={form.control}
                  name="data_saida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Saída *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* VALOR TOTAL */}
                <FormField
                  control={form.control}
                  name="valor_total"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total (R$) *</FormLabel>
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

      {/* LISTA DE RESERVAS */}
      <Card>
        <CardHeader>
          <CardTitle>Reservas Cadastradas</CardTitle>
          <CardDescription>Lista de todas as reservas</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Hóspede</TableHead>
                <TableHead>Quarto</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Hóspedes</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id_reserva}>
                  <TableCell>{reservation.id_reserva}</TableCell>
                  <TableCell>{reservation.hospede?.pessoa?.nome_completo}</TableCell>
                  <TableCell>
                    {reservation.quarto?.numero} - {reservation.quarto?.tipo}
                  </TableCell>
                  <TableCell>
                    {new Date(reservation.data_entrada).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {new Date(reservation.data_saida).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>{reservation.quantidade_hospedes}</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(reservation.valor_total)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(reservation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reservation.id_reserva)}
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
