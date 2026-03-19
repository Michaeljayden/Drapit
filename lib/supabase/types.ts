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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string | null
          last_used_at: string | null
          name: string | null
          shop_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix?: string | null
          last_used_at?: string | null
          name?: string | null
          shop_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string | null
          last_used_at?: string | null
          name?: string | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          buy_url: string | null
          created_at: string
          external_id: string | null
          id: string
          image_url: string | null
          name: string
          price: number | null
          shop_id: string
        }
        Insert: {
          buy_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          name: string
          price?: number | null
          shop_id: string
        }
        Update: {
          buy_url?: string | null
          created_at?: string
          external_id?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number | null
          shop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          created_at: string
          domain: string | null
          email: string
          id: string
          monthly_tryon_limit: number
          name: string
          owner_id: string | null
          plan: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          rollover_tryons: number
          tryons_this_month: number
          extra_tryons: number
          auto_topup_enabled: boolean
          auto_topup_threshold_pct: number
          auto_topup_pack_index: number
          auto_topup_monthly_cap: number
          auto_topup_spent_this_month: number
          studio_credits_used: number
          studio_credits_limit: number
          studio_extra_credits: number
        }
        Insert: {
          created_at?: string
          domain?: string | null
          email: string
          id?: string
          monthly_tryon_limit?: number
          name: string
          owner_id?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          rollover_tryons?: number
          tryons_this_month?: number
          extra_tryons?: number
          auto_topup_enabled?: boolean
          auto_topup_threshold_pct?: number
          auto_topup_pack_index?: number
          auto_topup_monthly_cap?: number
          auto_topup_spent_this_month?: number
          studio_credits_used?: number
          studio_credits_limit?: number
          studio_extra_credits?: number
        }
        Update: {
          created_at?: string
          domain?: string | null
          email?: string
          id?: string
          monthly_tryon_limit?: number
          name?: string
          owner_id?: string | null
          plan?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          rollover_tryons?: number
          tryons_this_month?: number
          extra_tryons?: number
          auto_topup_enabled?: boolean
          auto_topup_threshold_pct?: number
          auto_topup_pack_index?: number
          auto_topup_monthly_cap?: number
          auto_topup_spent_this_month?: number
          studio_credits_used?: number
          studio_credits_limit?: number
          studio_extra_credits?: number
        }
        Relationships: []
      }
      topup_transactions: {
        Row: {
          id: string
          shop_id: string
          created_at: string
          tryons_added: number
          amount_eur: number
          stripe_payment_intent_id: string | null
          status: string
          trigger_type: string
          failure_reason: string | null
          admin_reason: string | null
          admin_email: string | null
        }
        Insert: {
          id?: string
          shop_id: string
          created_at?: string
          tryons_added: number
          amount_eur: number
          stripe_payment_intent_id?: string | null
          status?: string
          trigger_type?: string
          failure_reason?: string | null
          admin_reason?: string | null
          admin_email?: string | null
        }
        Update: {
          id?: string
          shop_id?: string
          created_at?: string
          tryons_added?: number
          amount_eur?: number
          stripe_payment_intent_id?: string | null
          status?: string
          trigger_type?: string
          failure_reason?: string | null
          admin_reason?: string | null
          admin_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "topup_transactions_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_credit_adjustments: {
        Row: {
          id: string
          shop_id: string
          created_at: string
          credits_added: number
          admin_email: string
          reason: string | null
        }
        Insert: {
          id?: string
          shop_id: string
          created_at?: string
          credits_added: number
          admin_email: string
          reason?: string | null
        }
        Update: {
          id?: string
          shop_id?: string
          created_at?: string
          credits_added?: number
          admin_email?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "studio_credit_adjustments_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      tryons: {
        Row: {
          completed_at: string | null
          converted: boolean
          converted_at: string | null
          created_at: string
          id: string
          product_id: string | null
          product_image_url: string | null
          replicate_prediction_id: string | null
          result_image_url: string | null
          shop_id: string
          status: string
          user_photo_url: string | null
        }
        Insert: {
          completed_at?: string | null
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          product_image_url?: string | null
          replicate_prediction_id?: string | null
          result_image_url?: string | null
          shop_id: string
          status?: string
          user_photo_url?: string | null
        }
        Update: {
          completed_at?: string | null
          converted?: boolean
          converted_at?: string | null
          created_at?: string
          id?: string
          product_id?: string | null
          product_image_url?: string | null
          replicate_prediction_id?: string | null
          result_image_url?: string | null
          shop_id?: string
          status?: string
          user_photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryons_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_collections: {
        Row: {
          id: string
          shop_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_collections_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
      }
      studio_images: {
        Row: {
          id: string
          shop_id: string
          collection_id: string | null
          name: string
          storage_path: string
          url: string
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          collection_id?: string | null
          name: string
          storage_path: string
          url: string
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          collection_id?: string | null
          name?: string
          storage_path?: string
          url?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studio_images_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "studio_images_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "studio_collections"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_tryon_images: { Args: never; Returns: undefined }
      increment_tryons_count: {
        Args: { shop_row_id: string }
        Returns: undefined
      }
      increment_tryons_count_v2: {
        Args: { shop_row_id: string }
        Returns: undefined
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
export type Plan = 'trial' | 'starter' | 'growth' | 'scale' | 'enterprise';
export type TryOnStatus = 'pending' | 'processing' | 'succeeded' | 'failed';

export type StudioPlan = 'studio_trial' | 'studio_starter' | 'studio_pro' | 'studio_scale';
