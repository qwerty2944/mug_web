export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: number
          map_id: string
          message_type: string
          recipient_id: string | null
          recipient_name: string | null
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          map_id: string
          message_type?: string
          recipient_id?: string | null
          recipient_name?: string | null
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          map_id?: string
          message_type?: string
          recipient_id?: string | null
          recipient_name?: string | null
          sender_id?: string
          sender_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          acquired_at: string | null
          id: string
          item_id: string
          item_type: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          id?: string
          item_id: string
          item_type: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          id?: string
          item_id?: string
          item_type?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maps: {
        Row: {
          connected_maps: string[] | null
          created_at: string
          description_en: string | null
          description_ko: string | null
          icon: string | null
          id: string
          is_pvp: boolean | null
          is_safe_zone: boolean | null
          max_players: number | null
          min_level: number | null
          name_en: string
          name_ko: string
        }
        Insert: {
          connected_maps?: string[] | null
          created_at?: string
          description_en?: string | null
          description_ko?: string | null
          icon?: string | null
          id: string
          is_pvp?: boolean | null
          is_safe_zone?: boolean | null
          max_players?: number | null
          min_level?: number | null
          name_en: string
          name_ko: string
        }
        Update: {
          connected_maps?: string[] | null
          created_at?: string
          description_en?: string | null
          description_ko?: string | null
          icon?: string | null
          id?: string
          is_pvp?: boolean | null
          is_safe_zone?: boolean | null
          max_players?: number | null
          min_level?: number | null
          name_en?: string
          name_ko?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          buffs: Json | null
          characters: Json | null
          created_at: string | null
          experience: number | null
          gems: number | null
          gold: number | null
          id: string
          is_premium: boolean | null
          last_login_at: string | null
          level: number | null
          max_stamina: number | null
          nickname: string | null
          premium_until: string | null
          stamina: number | null
          stamina_updated_at: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          buffs?: Json | null
          characters?: Json | null
          created_at?: string | null
          experience?: number | null
          gems?: number | null
          gold?: number | null
          id: string
          is_premium?: boolean | null
          last_login_at?: string | null
          level?: number | null
          max_stamina?: number | null
          nickname?: string | null
          premium_until?: string | null
          stamina?: number | null
          stamina_updated_at?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          buffs?: Json | null
          characters?: Json | null
          created_at?: string | null
          experience?: number | null
          gems?: number | null
          gold?: number | null
          id?: string
          is_premium?: boolean | null
          last_login_at?: string | null
          level?: number | null
          max_stamina?: number | null
          nickname?: string | null
          premium_until?: string | null
          stamina?: number | null
          stamina_updated_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_locations: {
        Row: {
          character_name: string
          created_at: string
          last_seen_at: string
          map_id: string
          user_id: string
        }
        Insert: {
          character_name: string
          created_at?: string
          last_seen_at?: string
          map_id: string
          user_id: string
        }
        Update: {
          character_name?: string
          created_at?: string
          last_seen_at?: string
          map_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proficiencies: {
        Row: {
          id: string
          user_id: string | null
          // 무기 숙련
          sword: number | null
          axe: number | null
          mace: number | null
          dagger: number | null
          spear: number | null
          bow: number | null
          crossbow: number | null
          staff: number | null
          // 마법 숙련
          fire: number | null
          ice: number | null
          lightning: number | null
          earth: number | null
          holy: number | null
          dark: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          sword?: number | null
          axe?: number | null
          mace?: number | null
          dagger?: number | null
          spear?: number | null
          bow?: number | null
          crossbow?: number | null
          staff?: number | null
          fire?: number | null
          ice?: number | null
          lightning?: number | null
          earth?: number | null
          holy?: number | null
          dark?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          sword?: number | null
          axe?: number | null
          mace?: number | null
          dagger?: number | null
          spear?: number | null
          bow?: number | null
          crossbow?: number | null
          staff?: number | null
          fire?: number | null
          ice?: number | null
          lightning?: number | null
          earth?: number | null
          holy?: number | null
          dark?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proficiencies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_stamina: {
        Args: {
          p_current_stamina: number
          p_last_updated: string
          p_max_stamina: number
          p_recovery_rate?: number
        }
        Returns: number
      }
      cleanup_inactive_users: { Args: Record<PropertyKey, never>; Returns: number }
      cleanup_old_chat_messages: { Args: Record<PropertyKey, never>; Returns: number }
      consume_stamina: {
        Args: { p_amount: number; p_user_id: string }
        Returns: {
          current_stamina: number
          message: string
          success: boolean
        }[]
      }
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
      remove_user_location: { Args: { p_user_id: string }; Returns: undefined }
      restore_stamina: {
        Args: { p_amount: number; p_user_id: string }
        Returns: number
      }
      save_character: {
        Args: { p_character: Json; p_user_id: string }
        Returns: Json
      }
      upsert_user_location: {
        Args: { p_character_name: string; p_map_id: string; p_user_id: string }
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

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type Updatable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
