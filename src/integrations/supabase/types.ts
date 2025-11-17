export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      endereco: {
        Row: {
          bairro: string | null
          cep: string | null
          cidade: string | null
          cpf_pessoa: string
          rua: string | null
        }
        Insert: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_pessoa: string
          rua?: string | null
        }
        Update: {
          bairro?: string | null
          cep?: string | null
          cidade?: string | null
          cpf_pessoa?: string
          rua?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "endereco_cpf_pessoa_fkey"
            columns: ["cpf_pessoa"]
            isOneToOne: true
            referencedRelation: "pessoa"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "endereco_cpf_pessoa_fkey"
            columns: ["cpf_pessoa"]
            isOneToOne: true
            referencedRelation: "vw_relatorio_financeiro"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "endereco_cpf_pessoa_fkey"
            columns: ["cpf_pessoa"]
            isOneToOne: true
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["cpf"]
          },
        ]
      }
      funcionario: {
        Row: {
          cargo: string | null
          fk_pessoa_cpf: string
          matricula: string
          salario: number | null
          status_emprego: string | null
          turno: string | null
        }
        Insert: {
          cargo?: string | null
          fk_pessoa_cpf: string
          matricula: string
          salario?: number | null
          status_emprego?: string | null
          turno?: string | null
        }
        Update: {
          cargo?: string | null
          fk_pessoa_cpf?: string
          matricula?: string
          salario?: number | null
          status_emprego?: string | null
          turno?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funcionario_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: true
            referencedRelation: "pessoa"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "funcionario_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: true
            referencedRelation: "vw_relatorio_financeiro"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "funcionario_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: true
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["cpf"]
          },
        ]
      }
      hospede: {
        Row: {
          fk_pessoa_cpf: string
          id_hospede: number
        }
        Insert: {
          fk_pessoa_cpf: string
          id_hospede?: number
        }
        Update: {
          fk_pessoa_cpf?: string
          id_hospede?: number
        }
        Relationships: [
          {
            foreignKeyName: "hospede_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: true
            referencedRelation: "pessoa"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "hospede_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: true
            referencedRelation: "vw_relatorio_financeiro"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "hospede_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: true
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["cpf"]
          },
        ]
      }
      log_alteracoes_reserva: {
        Row: {
          data_alteracao: string | null
          id_log: number
          id_reserva: number
          observacao: string | null
          usuario: string | null
          valor_antigo: number | null
          valor_novo: number | null
        }
        Insert: {
          data_alteracao?: string | null
          id_log?: number
          id_reserva: number
          observacao?: string | null
          usuario?: string | null
          valor_antigo?: number | null
          valor_novo?: number | null
        }
        Update: {
          data_alteracao?: string | null
          id_log?: number
          id_reserva?: number
          observacao?: string | null
          usuario?: string | null
          valor_antigo?: number | null
          valor_novo?: number | null
        }
        Relationships: []
      }
      pagamento: {
        Row: {
          fk_reserva_id: number
          id_pagamento: number
          juros: number | null
          status_atual: string | null
          tipo: string
        }
        Insert: {
          fk_reserva_id: number
          id_pagamento?: number
          juros?: number | null
          status_atual?: string | null
          tipo: string
        }
        Update: {
          fk_reserva_id?: number
          id_pagamento?: number
          juros?: number | null
          status_atual?: string | null
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "pagamento_fk_reserva_id_fkey"
            columns: ["fk_reserva_id"]
            isOneToOne: false
            referencedRelation: "reserva"
            referencedColumns: ["id_reserva"]
          },
          {
            foreignKeyName: "pagamento_fk_reserva_id_fkey"
            columns: ["fk_reserva_id"]
            isOneToOne: false
            referencedRelation: "vw_relatorio_financeiro"
            referencedColumns: ["id_reserva"]
          },
          {
            foreignKeyName: "pagamento_fk_reserva_id_fkey"
            columns: ["fk_reserva_id"]
            isOneToOne: false
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["id_reserva"]
          },
        ]
      }
      pessoa: {
        Row: {
          cpf: string
          data_nascimento: string
          estado_civil: string | null
          genero: string | null
          nome_completo: string
        }
        Insert: {
          cpf: string
          data_nascimento: string
          estado_civil?: string | null
          genero?: string | null
          nome_completo: string
        }
        Update: {
          cpf?: string
          data_nascimento?: string
          estado_civil?: string | null
          genero?: string | null
          nome_completo?: string
        }
        Relationships: []
      }
      pet: {
        Row: {
          fk_id_hospede: number
          id_pet: number
          nome: string | null
          raca: string | null
        }
        Insert: {
          fk_id_hospede: number
          id_pet?: number
          nome?: string | null
          raca?: string | null
        }
        Update: {
          fk_id_hospede?: number
          id_pet?: number
          nome?: string | null
          raca?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pet_fk_id_hospede_fkey"
            columns: ["fk_id_hospede"]
            isOneToOne: false
            referencedRelation: "hospede"
            referencedColumns: ["id_hospede"]
          },
          {
            foreignKeyName: "pet_fk_id_hospede_fkey"
            columns: ["fk_id_hospede"]
            isOneToOne: false
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["id_hospede"]
          },
        ]
      }
      quarto: {
        Row: {
          capacidade: number | null
          numero: number
          status_atual: string | null
          tipo: string | null
          valor_diaria: number | null
        }
        Insert: {
          capacidade?: number | null
          numero: number
          status_atual?: string | null
          tipo?: string | null
          valor_diaria?: number | null
        }
        Update: {
          capacidade?: number | null
          numero?: number
          status_atual?: string | null
          tipo?: string | null
          valor_diaria?: number | null
        }
        Relationships: []
      }
      reserva: {
        Row: {
          data_entrada: string | null
          data_saida: string | null
          fk_id_hospede: number
          fk_quarto_numero: number | null
          id_reserva: number
          quantidade_hospedes: number | null
          valor_total: number | null
        }
        Insert: {
          data_entrada?: string | null
          data_saida?: string | null
          fk_id_hospede: number
          fk_quarto_numero?: number | null
          id_reserva?: number
          quantidade_hospedes?: number | null
          valor_total?: number | null
        }
        Update: {
          data_entrada?: string | null
          data_saida?: string | null
          fk_id_hospede?: number
          fk_quarto_numero?: number | null
          id_reserva?: number
          quantidade_hospedes?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reserva_fk_id_hospede_fkey"
            columns: ["fk_id_hospede"]
            isOneToOne: false
            referencedRelation: "hospede"
            referencedColumns: ["id_hospede"]
          },
          {
            foreignKeyName: "reserva_fk_id_hospede_fkey"
            columns: ["fk_id_hospede"]
            isOneToOne: false
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["id_hospede"]
          },
          {
            foreignKeyName: "reserva_fk_quarto_numero_fkey"
            columns: ["fk_quarto_numero"]
            isOneToOne: false
            referencedRelation: "quarto"
            referencedColumns: ["numero"]
          },
          {
            foreignKeyName: "reserva_fk_quarto_numero_fkey"
            columns: ["fk_quarto_numero"]
            isOneToOne: false
            referencedRelation: "vw_relatorio_financeiro"
            referencedColumns: ["numero_quarto"]
          },
          {
            foreignKeyName: "reserva_fk_quarto_numero_fkey"
            columns: ["fk_quarto_numero"]
            isOneToOne: false
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["numero_quarto"]
          },
        ]
      }
      servico_adicional: {
        Row: {
          data_realizada: string | null
          fk_reserva_id: number
          id_servico: number
          preco: number | null
          tipo: string | null
        }
        Insert: {
          data_realizada?: string | null
          fk_reserva_id: number
          id_servico?: number
          preco?: number | null
          tipo?: string | null
        }
        Update: {
          data_realizada?: string | null
          fk_reserva_id?: number
          id_servico?: number
          preco?: number | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servico_adicional_fk_reserva_id_fkey"
            columns: ["fk_reserva_id"]
            isOneToOne: false
            referencedRelation: "reserva"
            referencedColumns: ["id_reserva"]
          },
          {
            foreignKeyName: "servico_adicional_fk_reserva_id_fkey"
            columns: ["fk_reserva_id"]
            isOneToOne: false
            referencedRelation: "vw_relatorio_financeiro"
            referencedColumns: ["id_reserva"]
          },
          {
            foreignKeyName: "servico_adicional_fk_reserva_id_fkey"
            columns: ["fk_reserva_id"]
            isOneToOne: false
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["id_reserva"]
          },
        ]
      }
      supervisiona: {
        Row: {
          fk_supervisionado_matricula: string
          fk_supervisor_matricula: string
          id_supervisao: number
        }
        Insert: {
          fk_supervisionado_matricula: string
          fk_supervisor_matricula: string
          id_supervisao?: number
        }
        Update: {
          fk_supervisionado_matricula?: string
          fk_supervisor_matricula?: string
          id_supervisao?: number
        }
        Relationships: [
          {
            foreignKeyName: "supervisiona_fk_supervisionado_matricula_fkey"
            columns: ["fk_supervisionado_matricula"]
            isOneToOne: false
            referencedRelation: "funcionario"
            referencedColumns: ["matricula"]
          },
          {
            foreignKeyName: "supervisiona_fk_supervisor_matricula_fkey"
            columns: ["fk_supervisor_matricula"]
            isOneToOne: false
            referencedRelation: "funcionario"
            referencedColumns: ["matricula"]
          },
        ]
      }
      telefone: {
        Row: {
          fk_pessoa_cpf: string
          id_telefone: number
          numero: string
        }
        Insert: {
          fk_pessoa_cpf: string
          id_telefone?: number
          numero: string
        }
        Update: {
          fk_pessoa_cpf?: string
          id_telefone?: number
          numero?: string
        }
        Relationships: [
          {
            foreignKeyName: "telefone_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: false
            referencedRelation: "pessoa"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "telefone_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: false
            referencedRelation: "vw_relatorio_financeiro"
            referencedColumns: ["cpf"]
          },
          {
            foreignKeyName: "telefone_fk_pessoa_cpf_fkey"
            columns: ["fk_pessoa_cpf"]
            isOneToOne: false
            referencedRelation: "vw_reservas_completas"
            referencedColumns: ["cpf"]
          },
        ]
      }
    }
    Views: {
      vw_relatorio_financeiro: {
        Row: {
          cpf: string | null
          data_entrada: string | null
          data_saida: string | null
          id_reserva: number | null
          juros: number | null
          nome_hospede: string | null
          numero_quarto: number | null
          status_pagamento: string | null
          tipo_pagamento: string | null
          tipo_quarto: string | null
          total_servicos_adicionais: number | null
          valor_reserva: number | null
          valor_total_geral: number | null
        }
        Relationships: []
      }
      vw_reservas_completas: {
        Row: {
          capacidade: number | null
          cpf: string | null
          data_entrada: string | null
          data_nascimento: string | null
          data_saida: string | null
          dias_hospedagem: number | null
          id_hospede: number | null
          id_reserva: number | null
          nome_hospede: string | null
          numero_quarto: number | null
          quantidade_hospedes: number | null
          status_quarto: string | null
          tipo_quarto: string | null
          valor_diaria: number | null
          valor_total: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      fn_calcula_idade: { Args: { p_data_nasc: string }; Returns: number }
      fn_valor_total_com_servicos: {
        Args: { p_id_reserva: number }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
