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
import { Trash2, Edit, DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const roomSchema = z.object({
  numero: z.number().min(1, "Número do quarto obrigatório"),
  tipo: z.string().min(1, "Tipo do quarto obrigatório"),
  capacidade: z.number().min(1, "Capacidade mínima é 1"),
  valor_diaria: z.number().min(0, "Valor da diária deve ser positivo"),
  status_atual: z.string().min(1, "Status obrigatório"),
});

type RoomFormData = z.infer<typeof roomSchema>;

export const RoomsManagement = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      numero: 0,
      tipo: "",
      capacidade: 1,
      valor_diaria: 0,
      status_atual: "Disponível",
    },
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from("quarto")
      .select("*")
      .order("numero");

    if (error) {
      toast({ title: "Erro ao carregar quartos", description: error.message, variant: "destructive" });
    } else {
      setRooms(data || []);
    }
  };

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (editingId) {
        const { error } = await supabase
          .from("quarto")
          .update({
            tipo: data.tipo,
            capacidade: data.capacidade,
            valor_diaria: data.valor_diaria,
            status_atual: data.status_atual,
          })
          .eq("numero", editingId);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Quarto atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("quarto")
          .insert([{
            numero: data.numero,
            tipo: data.tipo,
            capacidade: data.capacidade,
            valor_diaria: data.valor_diaria,
            status_atual: data.status_atual,
          }]);

        if (error) throw error;
        toast({ title: "Sucesso", description: "Quarto cadastrado com sucesso!" });
      }

      form.reset();
      setEditingId(null);
      fetchRooms();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (room: any) => {
    setEditingId(room.numero);
    form.reset({
      numero: room.numero,
      tipo: room.tipo,
      capacidade: room.capacidade,
      valor_diaria: room.valor_diaria,
      status_atual: room.status_atual,
    });
  };

  const handleDelete = async (numero: number) => {
    if (!confirm("Tem certeza que deseja excluir este quarto?")) return;

    const { error } = await supabase.from("quarto").delete().eq("numero", numero);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Quarto excluído com sucesso!" });
      fetchRooms();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível": return "bg-green-500";
      case "Ocupado": return "bg-red-500";
      case "Manutenção": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DoorOpen className="h-5 w-5" />
            {editingId ? "Editar Quarto" : "Cadastrar Novo Quarto"}
          </CardTitle>
          <CardDescription>
            Configure os detalhes do quarto do hotel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Quarto *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          disabled={!!editingId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Luxo">Luxo</SelectItem>
                          <SelectItem value="Suíte">Suíte</SelectItem>
                          <SelectItem value="Presidencial">Presidencial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacidade *</FormLabel>
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

                <FormField
                  control={form.control}
                  name="valor_diaria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Diária (R$) *</FormLabel>
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
                          <SelectItem value="Disponível">Disponível</SelectItem>
                          <SelectItem value="Ocupado">Ocupado</SelectItem>
                          <SelectItem value="Manutenção">Manutenção</SelectItem>
                        </SelectContent>
                      </Select>
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
          <CardTitle>Quartos Cadastrados</CardTitle>
          <CardDescription>Lista de todos os quartos do hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Valor Diária</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.numero}>
                  <TableCell className="font-bold">{room.numero}</TableCell>
                  <TableCell>{room.tipo}</TableCell>
                  <TableCell>{room.capacidade} pessoa(s)</TableCell>
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(room.valor_diaria)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(room.status_atual)}>
                      {room.status_atual}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(room)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(room.numero)}
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
