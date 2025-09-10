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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      blockchain_signatures: {
        Row: {
          blockchain_tx_hash: string | null
          created_at: string
          envelope_id: string
          id: string
          is_verified: boolean | null
          public_key: string | null
          signature_data: Json | null
          signature_hash: string
          signature_type: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          blockchain_tx_hash?: string | null
          created_at?: string
          envelope_id: string
          id?: string
          is_verified?: boolean | null
          public_key?: string | null
          signature_data?: Json | null
          signature_hash: string
          signature_type?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          blockchain_tx_hash?: string | null
          created_at?: string
          envelope_id?: string
          id?: string
          is_verified?: boolean | null
          public_key?: string | null
          signature_data?: Json | null
          signature_hash?: string
          signature_type?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_blockchain_signatures_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1_id: string
          participant_2_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_1_id?: string
          participant_2_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      envelope_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          created_at: string
          envelope_id: string
          id: string
          legal_entity_id: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          envelope_id: string
          id?: string
          legal_entity_id: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          envelope_id?: string
          id?: string
          legal_entity_id?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "envelope_assignments_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envelope_assignments_legal_entity_id_fkey"
            columns: ["legal_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      envelope_goods: {
        Row: {
          created_at: string
          envelope_id: string
          goods_id: string
          id: string
        }
        Insert: {
          created_at?: string
          envelope_id: string
          goods_id: string
          id?: string
        }
        Update: {
          created_at?: string
          envelope_id?: string
          goods_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "envelope_goods_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envelope_goods_goods_id_fkey"
            columns: ["goods_id"]
            isOneToOne: false
            referencedRelation: "goods"
            referencedColumns: ["id"]
          },
        ]
      }
      envelope_signatures: {
        Row: {
          created_at: string
          envelope_id: string
          id: string
          legal_entity_id: string
          signature_data: Json | null
          signed_at: string
        }
        Insert: {
          created_at?: string
          envelope_id: string
          id?: string
          legal_entity_id: string
          signature_data?: Json | null
          signed_at?: string
        }
        Update: {
          created_at?: string
          envelope_id?: string
          id?: string
          legal_entity_id?: string
          signature_data?: Json | null
          signed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "envelope_signatures_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envelope_signatures_legal_entity_id_fkey"
            columns: ["legal_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      envelopes: {
        Row: {
          acid_number: string
          assigned_legal_entity_id: string | null
          created_at: string
          current_stage: number | null
          files: Json | null
          id: string
          is_draft: boolean | null
          legal_entity_id: string
          next_legal_entity_id: string | null
          payment_method: string | null
          payment_status: string | null
          procedure_id: string | null
          signed_at: string | null
          signed_by_legal_entity_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          total_amount: number | null
          updated_at: string
          user_id: string | null
          workflow_history: Json | null
          workflow_stages: Json | null
          workflow_status: string | null
        }
        Insert: {
          acid_number: string
          assigned_legal_entity_id?: string | null
          created_at?: string
          current_stage?: number | null
          files?: Json | null
          id?: string
          is_draft?: boolean | null
          legal_entity_id: string
          next_legal_entity_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          procedure_id?: string | null
          signed_at?: string | null
          signed_by_legal_entity_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          workflow_history?: Json | null
          workflow_stages?: Json | null
          workflow_status?: string | null
        }
        Update: {
          acid_number?: string
          assigned_legal_entity_id?: string | null
          created_at?: string
          current_stage?: number | null
          files?: Json | null
          id?: string
          is_draft?: boolean | null
          legal_entity_id?: string
          next_legal_entity_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          procedure_id?: string | null
          signed_at?: string | null
          signed_by_legal_entity_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string | null
          workflow_history?: Json | null
          workflow_stages?: Json | null
          workflow_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "envelopes_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "envelopes_signed_by_legal_entity_id_fkey"
            columns: ["signed_by_legal_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      goods: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          procedure_type: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          procedure_type: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          procedure_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      legal_entities: {
        Row: {
          contact_info: Json | null
          created_at: string | null
          entity_type: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          contact_info?: Json | null
          created_at?: string | null
          entity_type: string
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          contact_info?: Json | null
          created_at?: string | null
          entity_type?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_entity_emails: {
        Row: {
          attachments: Json | null
          cc_legal_entities: string[] | null
          content: string
          created_at: string
          id: string
          recipient_legal_entity_id: string
          sender_id: string
          sent_at: string
          status: string
          subject: string
        }
        Insert: {
          attachments?: Json | null
          cc_legal_entities?: string[] | null
          content: string
          created_at?: string
          id?: string
          recipient_legal_entity_id: string
          sender_id: string
          sent_at?: string
          status?: string
          subject: string
        }
        Update: {
          attachments?: Json | null
          cc_legal_entities?: string[] | null
          content?: string
          created_at?: string
          id?: string
          recipient_legal_entity_id?: string
          sender_id?: string
          sent_at?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      legal_entity_interactions: {
        Row: {
          attachments: Json | null
          created_at: string
          created_by: string
          envelope_assignment_id: string
          id: string
          interaction_type: string
          message: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          created_by: string
          envelope_assignment_id: string
          id?: string
          interaction_type: string
          message?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          created_by?: string
          envelope_assignment_id?: string
          id?: string
          interaction_type?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_entity_interactions_envelope_assignment_id_fkey"
            columns: ["envelope_assignment_id"]
            isOneToOne: false
            referencedRelation: "envelope_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachments?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachments?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          envelope_id: string | null
          id: string
          metadata: Json | null
          payment_method: string
          paypal_order_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          envelope_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method: string
          paypal_order_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          envelope_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string
          paypal_order_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_envelope_id_fkey"
            columns: ["envelope_id"]
            isOneToOne: false
            referencedRelation: "envelopes"
            referencedColumns: ["id"]
          },
        ]
      }
      procedures: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          required_documents: string[]
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          required_documents?: string[]
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          required_documents?: string[]
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blockchain_address: string | null
          blockchain_public_key: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          legal_entity_id: string | null
          role: string
          updated_at: string
        }
        Insert: {
          blockchain_address?: string | null
          blockchain_public_key?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          legal_entity_id?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          blockchain_address?: string | null
          blockchain_public_key?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          legal_entity_id?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_legal_entity_id_fkey"
            columns: ["legal_entity_id"]
            isOneToOne: false
            referencedRelation: "legal_entities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_legal_entity_workload: {
        Args: { entity_id: string }
        Returns: {
          total_completed: number
          total_in_review: number
          total_overdue: number
          total_pending: number
        }[]
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
