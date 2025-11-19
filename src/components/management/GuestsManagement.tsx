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
import { Trash2, Edit, UserPlus } from "lucide-react";

/* ------------------------ CONFIG DA API ------------------------ */
const API_BASE_URL = "http://localhost:3004/api";

/* ------------------------ TIPAGENS DA API ------------------------ */
type EnderecoAPI = {
  rua: string;
  bairro: string;
  cidade: string;
  cep: string;
};

type PessoaAPI = {
  cpf: string;
  nomeCompleto: string;
  dataNascimento: [number, number, number]; // [ano, mes, dia] vindo do LocalDate
  genero?: string | null;
  estadoCivil?: string | null;
  endereco?: EnderecoAPI | null;
};

/* ------------------------ SCHEMA DO FORM ------------------------ */
const guestSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  data_nascimento: z.string().min(1, "Data de nascimento obrigatória"), // yyyy-mm-dd
  genero: z.string().optional(),
  estado_civil: z.string().optional(),
  rua: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

export const GuestsManagement = () => {
  const [guests, setGuests] = useState<PessoaAPI[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      cpf: "",
      nome_completo: "",
      data_nascimento: "",
      genero: "",
      estado_civil: "",
      rua: "",
      bairro: "",
      cidade: "",
      cep: "",
    },
  });

  /* ------------------------ CARREGAR HÓSPEDES ------------------------ */
  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/pessoas`);
      if (!resp.ok) {
        throw new Error("Erro ao buscar hóspedes");
      }
      const data: PessoaAPI[] = await resp.json();
      setGuests(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar hóspedes",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /* ------------------------ SUBMIT ------------------------ */
  const onSubmit = async (data: GuestFormData) => {
    try {
      if (editingId) {
        await updateGuest(data);
      } else {
        await createGuest(data);
      }
      form.reset();
      setEditingId(null);
      await fetchGuests();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /* ------------------------ CREATE → POST /hospedes/cadastro-completo ------------------------ */
  const createGuest = async (data: GuestFormData) => {
    const payload = {
      cpf: data.cpf,
      nomeCompleto: data.nome_completo,
      dataNascimento: data.data_nascimento, // "yyyy-mm-dd" (LocalDate.parse no back)
      genero: data.genero || null,
      estadoCivil: data.estado_civil || null,
      rua: data.rua || "",
      bairro: data.bairro || "",
      cidade: data.cidade || "",
      cep: data.cep || "",
    };

    const resp = await fetch(`${API_BASE_URL}/hospedes/cadastro-completo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(json.erro || json.message || "Erro ao cadastrar hóspede");
    }

    toast({
      title: "Sucesso",
      description: "Hóspede cadastrado com sucesso!",
    });
  };

  /* ------------------------ UPDATE → PUT /pessoas/{cpf} ------------------------ */
  const updateGuest = async (data: GuestFormData) => {
    if (!editingId) return;

    const payload = {
      cpf: editingId,
      nomeCompleto: data.nome_completo,
      dataNascimento: data.data_nascimento,
      genero: data.genero || null,
      estadoCivil: data.estado_civil || null,
      // Se quiser também atualizar endereço, é só criar/usar um endpoint específico no back
    };

    const resp = await fetch(`${API_BASE_URL}/pessoas/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(json.erro || json.message || "Erro ao atualizar hóspede");
    }

    toast({
      title: "Sucesso",
      description: "Hóspede atualizado com sucesso!",
    });
  };

  /* ------------------------ EDITAR → preenche formulário ------------------------ */
  const handleEdit = (guest: PessoaAPI) => {
    setEditingId(guest.cpf);

    // converte [ano, mes, dia] em "yyyy-mm-dd" para o input type="date"
    let dataNascStr = "";
    if (guest.dataNascimento && guest.dataNascimento.length === 3) {
      const [ano, mes, dia] = guest.dataNascimento;
      const mm = String(mes).padStart(2, "0");
      const dd = String(dia).padStart(2, "0");
      dataNascStr = `${ano}-${mm}-${dd}`;
    }

    form.reset({
      cpf: guest.cpf,
      nome_completo: guest.nomeCompleto,
      data_nascimento: dataNascStr,
      genero: guest.genero || "",
      estado_civil: guest.estadoCivil || "",
      rua: guest.endereco?.rua || "",
      bairro: guest.endereco?.bairro || "",
      cidade: guest.endereco?.cidade || "",
      cep: guest.endereco?.cep || "",
    });
  };

  /* ------------------------ DELETE → DELETE /pessoas/{cpf} ------------------------ */
  const handleDelete = async (cpf: string) => {
    if (!confirm("Tem certeza que deseja excluir este hóspede?")) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/pessoas/${cpf}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        const json = await resp.json().catch(() => ({}));
        throw new Error(json.erro || json.message || "Erro ao excluir hóspede");
      }

      toast({
        title: "Sucesso",
        description: "Hóspede excluído com sucesso!",
      });
      fetchGuests();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  /* ------------------------ JSX ------------------------ */
  return (
    <div className="space-y-6">
      {/* FORMULÁRIO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {editingId ? "Editar Hóspede" : "Cadastrar Novo Hóspede"}
          </CardTitle>
          <CardDescription>
            Preencha os dados pessoais do hóspede
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* CPF */}
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000.000.000-00"
                          disabled={!!editingId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nome completo */}
                <FormField
                  control={form.control}
                  name="nome_completo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome completo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data de nascimento */}
                <FormField
                  control={form.control}
                  name="data_nascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento *</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gênero */}
                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Masculino">Masculino</SelectItem>
                          <SelectItem value="Feminino">Feminino</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado civil */}
                <FormField
                  control={form.control}
                  name="estado_civil"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado Civil</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                          <SelectItem value="Casado">Casado(a)</SelectItem>
                          <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                          <SelectItem value="Viúvo">Viúvo(a)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Rua */}
                <FormField
                  control={form.control}
                  name="rua"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome da rua" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bairro */}
                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Bairro" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Cidade */}
                <FormField
                  control={form.control}
                  name="cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Cidade" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CEP */}
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="00000-000" />
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

      {/* TABELA DE HÓSPEDES */}
      <Card>
        <CardHeader>
          <CardTitle>Hóspedes Cadastrados</CardTitle>
          <CardDescription>
            Lista de todos os hóspedes do hotel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CPF</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Data Nascimento</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.cpf}>
                  <TableCell className="font-mono">{guest.cpf}</TableCell>
                  <TableCell>{guest.nomeCompleto}</TableCell>
                  <TableCell>
                    {guest.dataNascimento &&
                    guest.dataNascimento.length === 3
                      ? new Date(
                          guest.dataNascimento[0],
                          guest.dataNascimento[1] - 1,
                          guest.dataNascimento[2]
                        ).toLocaleDateString("pt-BR")
                      : "-"}
                  </TableCell>
                  <TableCell>{guest.endereco?.cidade || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(guest)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(guest.cpf)}
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
