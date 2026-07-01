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
      accommodations: {
        Row: {
          category: string
          created_at: string
          id: string
          items: string[]
          sort_order: number
          title: string
          wedding_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          items?: string[]
          sort_order?: number
          title: string
          wedding_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          items?: string[]
          sort_order?: number
          title?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          checkin_time: string
          created_at: string
          guest_name: string
          id: string
          wedding_id: string
        }
        Insert: {
          checkin_time?: string
          created_at?: string
          guest_name: string
          id?: string
          wedding_id: string
        }
        Update: {
          checkin_time?: string
          created_at?: string
          guest_name?: string
          id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string | null
          event_time: string | null
          id: string
          location: string | null
          sort_order: number
          title: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          sort_order?: number
          title: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string | null
          event_time?: string | null
          id?: string
          location?: string | null
          sort_order?: number
          title?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          created_at: string
          id: string
          image_url: string
          uploaded_by: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          uploaded_by?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          uploaded_by?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_photos: {
        Row: {
          approved: boolean
          created_at: string
          guest_name: string | null
          id: string
          image_url: string
          wedding_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          guest_name?: string | null
          id?: string
          image_url: string
          wedding_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          guest_name?: string | null
          id?: string
          image_url?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_photos_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guestbook: {
        Row: {
          approved: boolean
          created_at: string
          guest_name: string
          id: string
          message: string
          photo_url: string | null
          wedding_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          guest_name: string
          id?: string
          message: string
          photo_url?: string | null
          wedding_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          guest_name?: string
          id?: string
          message?: string
          photo_url?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guestbook_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invited_guests: number
          name: string
          phone: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          invited_guests?: number
          name: string
          phone?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invited_guests?: number
          name?: string
          phone?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guests_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      live_updates: {
        Row: {
          created_at: string
          id: string
          message: string
          update_type: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          update_type?: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          update_type?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_updates_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_reactions: {
        Row: {
          created_at: string
          id: string
          moment_id: string
          reaction_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          moment_id: string
          reaction_type: string
        }
        Update: {
          created_at?: string
          id?: string
          moment_id?: string
          reaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "moment_reactions_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "wedding_moments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      registries: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          url: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          url?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          url?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registries_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvps: {
        Row: {
          attending: boolean | null
          dietary_note: string | null
          dietary_preference: string | null
          email: string | null
          guest_count: number
          guest_name: string
          id: string
          message: string | null
          phone: string | null
          submitted_at: string
          wedding_id: string
        }
        Insert: {
          attending?: boolean | null
          dietary_note?: string | null
          dietary_preference?: string | null
          email?: string | null
          guest_count?: number
          guest_name: string
          id?: string
          message?: string | null
          phone?: string | null
          submitted_at?: string
          wedding_id: string
        }
        Update: {
          attending?: boolean | null
          dietary_note?: string | null
          dietary_preference?: string | null
          email?: string | null
          guest_count?: number
          guest_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          submitted_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvps_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      seating_assignments: {
        Row: {
          created_at: string
          guest_name: string
          id: string
          rsvp_id: string | null
          table_id: string
        }
        Insert: {
          created_at?: string
          guest_name: string
          id?: string
          rsvp_id?: string | null
          table_id: string
        }
        Update: {
          created_at?: string
          guest_name?: string
          id?: string
          rsvp_id?: string | null
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_assignments_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seating_assignments_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "seating_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      seating_tables: {
        Row: {
          capacity: number
          created_at: string
          id: string
          sort_order: number
          table_name: string
          wedding_id: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          id?: string
          sort_order?: number
          table_name: string
          wedding_id: string
        }
        Update: {
          capacity?: number
          created_at?: string
          id?: string
          sort_order?: number
          table_name?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_tables_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      themes: {
        Row: {
          accent_color: string
          background_color: string
          created_at: string
          font_body: string
          font_display: string
          foreground_color: string
          generated_by_ai: boolean
          id: string
          name: string
          primary_color: string
          secondary_color: string
        }
        Insert: {
          accent_color: string
          background_color?: string
          created_at?: string
          font_body?: string
          font_display?: string
          foreground_color?: string
          generated_by_ai?: boolean
          id?: string
          name: string
          primary_color: string
          secondary_color: string
        }
        Update: {
          accent_color?: string
          background_color?: string
          created_at?: string
          font_body?: string
          font_display?: string
          foreground_color?: string
          generated_by_ai?: boolean
          id?: string
          name?: string
          primary_color?: string
          secondary_color?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          category: string
          created_at: string
          id: string
          logo: string | null
          vendor_name: string
          website: string | null
          wedding_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          logo?: string | null
          vendor_name: string
          website?: string | null
          wedding_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          logo?: string | null
          vendor_name?: string
          website?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_analytics: {
        Row: {
          created_at: string
          id: string
          page_views: number
          qr_scans: number
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_views?: number
          qr_scans?: number
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_views?: number
          qr_scans?: number
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_analytics_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_moments: {
        Row: {
          approved: boolean
          created_at: string
          guest_name: string
          highlighted: boolean
          id: string
          message: string | null
          photo_url: string | null
          wedding_id: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          guest_name: string
          highlighted?: boolean
          id?: string
          message?: string | null
          photo_url?: string | null
          wedding_id: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          guest_name?: string
          highlighted?: boolean
          id?: string
          message?: string | null
          photo_url?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_moments_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_reports: {
        Row: {
          action_items: Json | null
          created_at: string
          highlights: Json | null
          id: string
          report_date: string
          report_text: string
          stats: Json | null
          wedding_id: string
        }
        Insert: {
          action_items?: Json | null
          created_at?: string
          highlights?: Json | null
          id?: string
          report_date: string
          report_text: string
          stats?: Json | null
          wedding_id: string
        }
        Update: {
          action_items?: Json | null
          created_at?: string
          highlights?: Json | null
          id?: string
          report_date?: string
          report_text?: string
          stats?: Json | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_reports_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_updates: {
        Row: {
          created_at: string
          id: string
          message: string
          wedding_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          wedding_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_updates_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      weddings: {
        Row: {
          access_code: string
          admin_user_id: string
          ceremony_time: string | null
          ceremony_venue: string | null
          contact_email: string | null
          couple_names: string
          cover_focal_point: string | null
          cover_image: string | null
          created_at: string
          dashboard_tour_completed: boolean
          dress_code: string | null
          id: string
          live_mode: boolean
          max_guests: number | null
          published: boolean
          reception_time: string | null
          reception_venue: string | null
          rsvp_deadline: string | null
          rsvp_focal_point: string | null
          rsvp_image: string | null
          slug: string
          story: string | null
          story_focal_point: string | null
          story_image: string | null
          theme: Json | null
          theme_id: string | null
          updated_at: string
          wedding_date: string | null
          wedding_style: string | null
          whatsapp_group_url: string | null
        }
        Insert: {
          access_code?: string
          admin_user_id: string
          ceremony_time?: string | null
          ceremony_venue?: string | null
          contact_email?: string | null
          couple_names: string
          cover_focal_point?: string | null
          cover_image?: string | null
          created_at?: string
          dashboard_tour_completed?: boolean
          dress_code?: string | null
          id?: string
          live_mode?: boolean
          max_guests?: number | null
          published?: boolean
          reception_time?: string | null
          reception_venue?: string | null
          rsvp_deadline?: string | null
          rsvp_focal_point?: string | null
          rsvp_image?: string | null
          slug: string
          story?: string | null
          story_focal_point?: string | null
          story_image?: string | null
          theme?: Json | null
          theme_id?: string | null
          updated_at?: string
          wedding_date?: string | null
          wedding_style?: string | null
          whatsapp_group_url?: string | null
        }
        Update: {
          access_code?: string
          admin_user_id?: string
          ceremony_time?: string | null
          ceremony_venue?: string | null
          contact_email?: string | null
          couple_names?: string
          cover_focal_point?: string | null
          cover_image?: string | null
          created_at?: string
          dashboard_tour_completed?: boolean
          dress_code?: string | null
          id?: string
          live_mode?: boolean
          max_guests?: number | null
          published?: boolean
          reception_time?: string | null
          reception_venue?: string | null
          rsvp_deadline?: string | null
          rsvp_focal_point?: string | null
          rsvp_image?: string | null
          slug?: string
          story?: string | null
          story_focal_point?: string | null
          story_image?: string | null
          theme?: Json | null
          theme_id?: string | null
          updated_at?: string
          wedding_date?: string | null
          wedding_style?: string | null
          whatsapp_group_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weddings_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_page_view: {
        Args: { p_wedding_id: string }
        Returns: undefined
      }
      increment_qr_scan: { Args: { p_wedding_id: string }; Returns: undefined }
      regenerate_access_code: { Args: { wedding_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "vendor"
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
    Enums: {
      app_role: ["admin", "moderator", "user", "vendor"],
    },
  },
} as const
