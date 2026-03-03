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
      device_rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          device_id: string
          id: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          device_id: string
          id?: string
          window_start: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          device_id?: string
          id?: string
          window_start?: string
        }
        Relationships: []
      }
      entity_findings: {
        Row: {
          confidence: string | null
          created_at: string
          description: string | null
          entity_type: string
          height_percent: number | null
          id: string
          intent: string | null
          is_attached: boolean | null
          location: string | null
          message: string | null
          power_level: string | null
          scan_id: string
          width_percent: number | null
          x_percent: number | null
          y_percent: number | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          description?: string | null
          entity_type: string
          height_percent?: number | null
          id?: string
          intent?: string | null
          is_attached?: boolean | null
          location?: string | null
          message?: string | null
          power_level?: string | null
          scan_id: string
          width_percent?: number | null
          x_percent?: number | null
          y_percent?: number | null
        }
        Update: {
          confidence?: string | null
          created_at?: string
          description?: string | null
          entity_type?: string
          height_percent?: number | null
          id?: string
          intent?: string | null
          is_attached?: boolean | null
          location?: string | null
          message?: string | null
          power_level?: string | null
          scan_id?: string
          width_percent?: number | null
          x_percent?: number | null
          y_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "entity_findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "spirit_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_sketches: {
        Row: {
          created_at: string
          device_id: string
          entity_description: string | null
          entity_type: string
          finding_index: number
          id: string
          scan_id: string | null
          sketch_path: string | null
          sketch_url: string
        }
        Insert: {
          created_at?: string
          device_id: string
          entity_description?: string | null
          entity_type: string
          finding_index: number
          id?: string
          scan_id?: string | null
          sketch_path?: string | null
          sketch_url: string
        }
        Update: {
          created_at?: string
          device_id?: string
          entity_description?: string | null
          entity_type?: string
          finding_index?: number
          id?: string
          scan_id?: string | null
          sketch_path?: string | null
          sketch_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_sketches_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "spirit_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      spirit_box_sessions: {
        Row: {
          created_at: string
          device_id: string
          duration_seconds: number | null
          ended_at: string | null
          id: string
          started_at: string
          word_count: number
          words: Json
        }
        Insert: {
          created_at?: string
          device_id: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          word_count?: number
          words?: Json
        }
        Update: {
          created_at?: string
          device_id?: string
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          started_at?: string
          word_count?: number
          words?: Json
        }
        Relationships: []
      }
      spirit_scans: {
        Row: {
          created_at: string
          device_id: string
          dimensional_thinning: string | null
          dominant_energy: string | null
          id: string
          image_path: string | null
          image_url: string
          interpretation: string | null
          overall_energy: string | null
          primary_message: string | null
          protection_level: string | null
          protection_needed: boolean | null
          spiritual_activity: string | null
          synthesis: string | null
        }
        Insert: {
          created_at?: string
          device_id: string
          dimensional_thinning?: string | null
          dominant_energy?: string | null
          id?: string
          image_path?: string | null
          image_url: string
          interpretation?: string | null
          overall_energy?: string | null
          primary_message?: string | null
          protection_level?: string | null
          protection_needed?: boolean | null
          spiritual_activity?: string | null
          synthesis?: string | null
        }
        Update: {
          created_at?: string
          device_id?: string
          dimensional_thinning?: string | null
          dominant_energy?: string | null
          id?: string
          image_path?: string | null
          image_url?: string
          interpretation?: string | null
          overall_energy?: string | null
          primary_message?: string | null
          protection_level?: string | null
          protection_needed?: boolean | null
          spiritual_activity?: string | null
          synthesis?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          device_id: string
          id: string
          is_active: boolean
          product_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string
          id?: string
          is_active?: boolean
          product_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      rate_limit_allow: {
        Args: {
          _action: string
          _device_id: string
          _max_count: number
          _window_seconds: number
        }
        Returns: {
          allowed: boolean
          remaining: number
          reset_at: string
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
