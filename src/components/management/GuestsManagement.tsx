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
import { Trash2, Edit, UserPlus } from "lucide-react";

const guestSchema = z.object({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  nome_completo: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  data_nascimento: z.string().min(1, "Data de nascimento obrigatória"),
  genero: z.string().optional(),
  estado_civil: z.string().optional(),
  rua: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
});

type GuestFormData = z.infer<typeof guestSchema>;

export const GuestsManagement = () => {
  const [guests, setGuests] = useState<any[]>([]);
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
      telefone: "",
    },
  });

  useEffect(() => {
    fetchGuests();
  }, []);

  const fetchGuests = async () => {
    const { data: pessoaData, error } = await supabase
      .from("pessoa")
      .select(`
        *,
        endereco(*),
        telefone(*),
        hospede(*)
      `);

    if (error) {
      toast({ title: "Erro ao carregar hóspedes", description: error.message, variant: "destructive" });
    } else {
      setGuests(pessoaData || []);
    }
  };

  const onSubmit = async (data: GuestFormData) => {
    try {
      if (editingId) {
        await updateGuest(data);
      } else {
        await createGuest(data);
      }
      form.reset();
      setEditingId(null);
      fetchGuests();
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  };

  const createGuest = async (data: GuestFormData) => {
    // Insert pessoa
    const { data: pessoa, error: pessoaError } = await supabase
      .from("pessoa")
      .insert({
        cpf: data.cpf,
        nome_completo: data.nome_completo,
        data_nascimento: data.data_nascimento,
        genero: data.genero || null,
        estado_civil: data.estado_civil || null,
      })
      .select()
      .single();

    if (pessoaError) throw pessoaError;

    // Insert endereco
    if (data.rua || data.bairro || data.cidade || data.cep) {
      await supabase.from("endereco").insert({
        cpf_pessoa: pessoa.cpf,
        rua: data.rua || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        cep: data.cep || null,
      });
    }

    // Insert telefone
    if (data.telefone) {
      await supabase.from("telefone").insert({
        fk_pessoa_cpf: pessoa.cpf,
        numero: data.telefone,
      });
    }

    // Insert hospede
    await supabase.from("hospede").insert({
      fk_pessoa_cpf: pessoa.cpf,
    });

    toast({ title: "Sucesso", description: "Hóspede cadastrado com sucesso!" });
  };

  const updateGuest = async (data: GuestFormData) => {
    const { error: pessoaError } = await supabase
      .from("pessoa")
      .update({
        nome_completo: data.nome_completo,
        data_nascimento: data.data_nascimento,
        genero: data.genero || null,
        estado_civil: data.estado_civil || null,
      })
      .eq("cpf", editingId);

    if (pessoaError) throw pessoaError;

    // Update or insert endereco
    const { data: existingEndereco } = await supabase
      .from("endereco")
      .select("*")
      .eq("cpf_pessoa", editingId)
      .single();

    if (existingEndereco) {
      await supabase
        .from("endereco")
        .update({
          rua: data.rua || null,
          bairro: data.bairro || null,
          cidade: data.cidade || null,
          cep: data.cep || null,
        })
        .eq("cpf_pessoa", editingId);
    } else if (data.rua || data.bairro || data.cidade || data.cep) {
      await supabase.from("endereco").insert({
        cpf_pessoa: editingId,
        rua: data.rua || null,
        bairro: data.bairro || null,
        cidade: data.cidade || null,
        cep: data.cep || null,
      });
    }

    toast({ title: "Sucesso", description: "Hóspede atualizado com sucesso!" });
  };

  const handleEdit = (guest: any) => {
    setEditingId(guest.cpf);
    form.reset({
      cpf: guest.cpf,
      nome_completo: guest.nome_completo,
      data_nascimento: guest.data_nascimento,
      genero: guest.genero || "",
      estado_civil: guest.estado_civil || "",
      rua: guest.endereco?.rua || "",
      bairro: guest.endereco?.bairro || "",
      cidade: guest.endereco?.cidade || "",
      cep: guest.endereco?.cep || "",
      telefone: guest.telefone?.[0]?.numero || "",
    });
  };

  const handleDelete = async (cpf: string) => {
    if (!confirm("Tem certeza que deseja excluir este hóspede?")) return;

    const { error } = await supabase.from("pessoa").delete().eq("cpf", cpf);

    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso", description: "Hóspede excluído com sucesso!" });
      fetchGuests();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {editingId ? "Editar Hóspede" : "Cadastrar Novo Hóspede"}
          </CardTitle>
          <CardDescription>
            Preencha os dados pessoais e de contato do hóspede
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="000.000.000-00" disabled={!!editingId} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(00) 00000-0000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

      <Card>
        <CardHeader>
          <CardTitle>Hóspedes Cadastrados</CardTitle>
          <CardDescription>Lista de todos os hóspedes do hotel</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CPF</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Data Nascimento</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map((guest) => (
                <TableRow key={guest.cpf}>
                  <TableCell className="font-mono">{guest.cpf}</TableCell>
                  <TableCell>{guest.nome_completo}</TableCell>
                  <TableCell>{new Date(guest.data_nascimento).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{guest.endereco?.cidade || "-"}</TableCell>
                  <TableCell>{guest.telefone?.[0]?.numero || "-"}</TableCell>
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
