import { useState, useEffect } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit, DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ---------------- API CONFIG ---------------- */
const API_BASE_URL = "http://localhost:3004/api";

/* ---------------- SCHEMA ---------------- */
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

  /* ---------------- LOAD ROOMS ---------------- */
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/quartos`);
      const data = await resp.json();

      const normalizados = (data || []).map((room: any) => {
        const bruto =
          room.valorDiaria ??
          room.valor_diaria ??
          room.valor ??
          room.preco ??
          0;

        const valorNum = Number(String(bruto).replace(",", "."));

        return {
          ...room,
          // para tabela
          valorDiaria: isNaN(valorNum) ? 0 : valorNum,
          // para o form funcionar
          valor_diaria: isNaN(valorNum) ? 0 : valorNum,
        };
      });

      console.log("Quartos normalizados:", normalizados);

      setRooms(normalizados);
    } catch (err: any) {
      toast({
        title: "Erro ao buscar quartos",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data: RoomFormData) => {
    const payload = {
      numero: data.numero,
      tipo: data.tipo,
      capacidade: data.capacidade,
      valorDiaria: data.valor_diaria, //
      statusAtual: data.status_atual, //
    };

    try {
      if (editingId) {
        const resp = await fetch(`${API_BASE_URL}/quartos/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json.erro || "Erro ao atualizar quarto");

        toast({ title: "Sucesso", description: "Quarto atualizado!" });
      } else {
        const resp = await fetch(`${API_BASE_URL}/quartos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(json.erro || "Erro ao criar quarto");

        toast({ title: "Sucesso", description: "Quarto cadastrado!" });
      }

      form.reset();
      setEditingId(null);
      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (room: any) => {
    setEditingId(room.numero);

    form.reset({
      numero: room.numero,
      tipo: room.tipo,
      capacidade: room.capacidade,
      valor_diaria: Number(room.valorDiaria), // <-- corrigido
      statusAtual: room.status_atual, // <-- corrigido
    });
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (numero: number) => {
    if (!confirm("Deseja realmente excluir este quarto?")) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/quartos/${numero}`, {
        method: "DELETE",
      });

      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json.erro || "Erro ao deletar quarto");

      toast({ title: "Sucesso", description: "Quarto removido!" });
      fetchRooms();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /* ---------------- STATUS BADGE COLOR ---------------- */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível":
        return "bg-green-500";
      case "Ocupado":
        return "bg-red-500";
      case "Manutenção":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  /* ---------------- RENDER ---------------- */
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
                {/* Número */}
                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                          disabled={!!editingId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo */}
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="Luxo">Luxo</SelectItem>
                          <SelectItem value="Suíte">Suíte</SelectItem>
                          <SelectItem value="Presidencial">
                            Presidencial
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Capacidade */}
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
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Valor Diária */}
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
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status */}
                <FormField
                  control={form.control}
                  name="status_atual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Disponível">Disponível</SelectItem>
                          <SelectItem value="Ocupado">Ocupado</SelectItem>
                          <SelectItem value="Manutenção">
                            Manutenção
                          </SelectItem>
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

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Quartos Cadastrados</CardTitle>
          <CardDescription>Lista de todos os quartos</CardDescription>
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

                  {/* AQUI FOI CORRIGIDO */}
                  <TableCell>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(room.valorDiaria)}
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Badge className={getStatusColor(room.statusAtual)}>
                      {room.statusAtual}
                    </Badge>
                  </TableCell>

                  {/* AÇÕES */}
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
