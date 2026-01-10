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
      character_locations: {
        Row: {
          character_id: string
          character_name: string
          created_at: string
          last_seen_at: string
          map_id: string
        }
        Insert: {
          character_id: string
          character_name: string
          created_at?: string
          last_seen_at?: string
          map_id: string
        }
        Update: {
          character_id?: string
          character_name?: string
          created_at?: string
          last_seen_at?: string
          map_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "character_locations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: true
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          appearance: Json | null
          avatar_url: string | null
          buffs: Json | null
          character: Json | null
          created_at: string | null
          crystal_tier: string | null
          current_hp: number | null
          current_map_id: string | null
          current_mp: number | null
          email: string | null
          equipment: Json | null
          experience: number | null
          fatigue: number | null
          fatigue_updated_at: string | null
          gems: number | null
          gold: number | null
          id: string
          injuries: Json | null
          inventories: string[] | null
          is_premium: boolean | null
          karma: number | null
          last_login_at: string | null
          level: number | null
          max_fatigue: number | null
          premium_until: string | null
          religion: Json | null
          traits: Json | null
          updated_at: string | null
          user_id: string
          whisper_charges: number | null
        }
        Insert: {
          appearance?: Json | null
          avatar_url?: Json | null
          buffs?: Json | null
          character?: Json | null
          created_at?: string | null
          crystal_tier?: string | null
          current_hp?: number | null
          current_map_id?: string | null
          current_mp?: number | null
          email?: string | null
          equipment?: Json | null
          experience?: number | null
          fatigue?: number | null
          fatigue_updated_at?: string | null
          gems?: number | null
          gold?: number | null
          id: string
          injuries?: Json | null
          inventories?: string[] | null
          is_premium?: boolean | null
          karma?: number | null
          last_login_at?: string | null
          level?: number | null
          max_fatigue?: number | null
          premium_until?: string | null
          religion?: Json | null
          traits?: Json | null
          updated_at?: string | null
          user_id: string
          whisper_charges?: number | null
        }
        Update: {
          appearance?: Json | null
          avatar_url?: Json | null
          buffs?: Json | null
          character?: Json | null
          created_at?: string | null
          crystal_tier?: string | null
          current_hp?: number | null
          current_map_id?: string | null
          current_mp?: number | null
          email?: string | null
          equipment?: Json | null
          experience?: number | null
          fatigue?: number | null
          fatigue_updated_at?: string | null
          gems?: number | null
          gold?: number | null
          id?: string
          injuries?: Json | null
          inventories?: string[] | null
          is_premium?: boolean | null
          karma?: number | null
          last_login_at?: string | null
          level?: number | null
          max_fatigue?: number | null
          premium_until?: string | null
          religion?: Json | null
          traits?: Json | null
          updated_at?: string | null
          user_id?: string
          whisper_charges?: number | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: number
          map_id: string
          message_type: string
          recipient_character_id: string | null
          recipient_name: string | null
          sender_character_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          map_id: string
          message_type?: string
          recipient_character_id?: string | null
          recipient_name?: string | null
          sender_character_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          map_id?: string
          message_type?: string
          recipient_character_id?: string | null
          recipient_name?: string | null
          sender_character_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_recipient_character_id_fkey"
            columns: ["recipient_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_character_id_fkey"
            columns: ["sender_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      game_settings: {
        Row: {
          created_at: string | null
          current_game_hour: number | null
          current_period: string | null
          current_weather: string | null
          day_cycle_hours: number
          game_epoch: string
          id: string
          updated_at: string | null
          weather_cycle_hours: number
          weather_epoch: string
        }
        Insert: {
          created_at?: string | null
          current_game_hour?: number | null
          current_period?: string | null
          current_weather?: string | null
          day_cycle_hours?: number
          game_epoch?: string
          id?: string
          updated_at?: string | null
          weather_cycle_hours?: number
          weather_epoch?: string
        }
        Update: {
          created_at?: string | null
          current_game_hour?: number | null
          current_period?: string | null
          current_weather?: string | null
          day_cycle_hours?: number
          game_epoch?: string
          id?: string
          updated_at?: string | null
          weather_cycle_hours?: number
          weather_epoch?: string
        }
        Relationships: []
      }
      inventories: {
        Row: {
          character_id: string
          created_at: string | null
          id: string
          inventory_type: string
          items: Json
          max_slots: number
          updated_at: string | null
        }
        Insert: {
          character_id: string
          created_at?: string | null
          id?: string
          inventory_type: string
          items?: Json
          max_slots?: number
          updated_at?: string | null
        }
        Update: {
          character_id?: string
          created_at?: string | null
          id?: string
          inventory_type?: string
          items?: Json
          max_slots?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventories_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      offerings_log: {
        Row: {
          character_id: string | null
          created_at: string | null
          id: string
          item_id: string
          piety_gained: number
          quantity: number | null
          religion_id: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          piety_gained: number
          quantity?: number | null
          religion_id: string
        }
        Update: {
          character_id?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          piety_gained?: number
          quantity?: number | null
          religion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offerings_log_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          price_krw: number
          product_id: string
          product_type: string
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          price_krw: number
          product_id: string
          product_type: string
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          price_krw?: number
          product_id?: string
          product_type?: string
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shop_products: {
        Row: {
          created_at: string | null
          description_en: string | null
          description_ko: string | null
          gems_amount: number | null
          gold_amount: number | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          items: Json | null
          name_en: string
          name_ko: string
          premium_days: number | null
          price_krw: number
          price_usd: number | null
          product_type: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description_en?: string | null
          description_ko?: string | null
          gems_amount?: number | null
          gold_amount?: number | null
          id: string
          is_active?: boolean | null
          is_featured?: boolean | null
          items?: Json | null
          name_en: string
          name_ko: string
          premium_days?: number | null
          price_krw: number
          price_usd?: number | null
          product_type: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description_en?: string | null
          description_ko?: string | null
          gems_amount?: number | null
          gold_amount?: number | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          items?: Json | null
          name_en?: string
          name_ko?: string
          premium_days?: number | null
          price_krw?: number
          price_usd?: number | null
          product_type?: string
          sort_order?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_injury: {
        Args: { p_injury: Json; p_user_id: string }
        Returns: undefined
      }
      calculate_max_fatigue_from_con: {
        Args: { con_value: number }
        Returns: number
      }
      calculate_fatigue: {
        Args: {
          p_current_fatigue: number
          p_last_updated: string
          p_max_fatigue: number
          p_recovery_rate?: number
        }
        Returns: number
      }
      cleanup_inactive_users: { Args: never; Returns: number }
      cleanup_old_chat_messages: { Args: never; Returns: number }
      consume_fatigue: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      consume_whisper_charge: {
        Args: { p_user_id: string }
        Returns: {
          crystal_tier: string
          remaining_charges: number
          success: boolean
        }[]
      }
      get_current_fatigue: { Args: { p_user_id: string }; Returns: number }
      get_main_character_con: { Args: { p_character: Json }; Returns: number }
      get_online_users_in_map: {
        Args: { p_map_id: string; p_timeout_minutes?: number }
        Returns: {
          character_name: string
          last_seen_at: string
          user_id: string
        }[]
      }
      get_recent_messages: {
        Args: { p_limit?: number; p_map_id: string }
        Returns: {
          content: string
          created_at: string
          id: number
          map_id: string
          message_type: string
          recipient_id: string
          recipient_name: string
          sender_id: string
          sender_name: string
        }[]
      }
      get_spell_proficiencies: {
        Args: { p_user_id: string }
        Returns: {
          cast_count: number
          experience: number
          last_cast_at: string
          spell_id: string
        }[]
      }
      get_user_max_fatigue: { Args: { p_user_id: string }; Returns: number }
      heal_injury_with_gold: {
        Args: { p_gold_cost: number; p_injury_index: number; p_user_id: string }
        Returns: Json
      }
      increase_proficiency: {
        Args: {
          p_amount?: number
          p_category: string
          p_type: string
          p_user_id: string
        }
        Returns: number
      }
      inventory_add_item: {
        Args: {
          p_inventory_type: string
          p_item_id: string
          p_item_type: string
          p_quantity?: number
          p_user_id: string
        }
        Returns: Json
      }
      inventory_get: {
        Args: { p_inventory_type: string; p_user_id: string }
        Returns: Json
      }
      inventory_move_item: {
        Args: {
          p_from_slot: number
          p_from_type: string
          p_to_slot: number
          p_to_type: string
          p_user_id: string
        }
        Returns: Json
      }
      inventory_remove_item: {
        Args: {
          p_inventory_type: string
          p_quantity?: number
          p_slot: number
          p_user_id: string
        }
        Returns: Json
      }
      inventory_update_quantity: {
        Args: {
          p_inventory_type: string
          p_quantity: number
          p_slot: number
          p_user_id: string
        }
        Returns: Json
      }
      join_religion: {
        Args: { p_religion_id: string; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      leave_religion: {
        Args: { p_user_id: string }
        Returns: {
          message: string
          old_religion: string
          success: boolean
        }[]
      }
      remove_user_location: { Args: { p_user_id: string }; Returns: undefined }
      restore_fatigue: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      save_character: {
        Args: { p_character: Json; p_user_id: string }
        Returns: Json
      }
      update_karma: {
        Args: { p_change: number; p_reason?: string; p_user_id: string }
        Returns: {
          karma_rank: string
          new_karma: number
        }[]
      }
      update_piety: {
        Args: { p_change: number; p_user_id: string }
        Returns: {
          new_piety: number
          piety_level: number
        }[]
      }
      upsert_user_location: {
        Args: { p_character_name: string; p_map_id: string; p_user_id: string }
        Returns: undefined
      }
      use_crystal: {
        Args: { p_charges: number; p_crystal_tier: string; p_user_id: string }
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
