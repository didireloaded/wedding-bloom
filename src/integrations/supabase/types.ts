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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
          checkin_method: string
          checkin_time: string
          created_at: string
          guest_name: string
          id: string
          latitude: number | null
          location_accuracy: number | null
          longitude: number | null
          party_size: number
          rsvp_id: string | null
          verified: boolean
          wedding_id: string
        }
        Insert: {
          checkin_method?: string
          checkin_time?: string
          created_at?: string
          guest_name: string
          id?: string
          latitude?: number | null
          location_accuracy?: number | null
          longitude?: number | null
          party_size?: number
          rsvp_id?: string | null
          verified?: boolean
          wedding_id: string
        }
        Update: {
          checkin_method?: string
          checkin_time?: string
          created_at?: string
          guest_name?: string
          id?: string
          latitude?: number | null
          location_accuracy?: number | null
          longitude?: number | null
          party_size?: number
          rsvp_id?: string | null
          verified?: boolean
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_device_sessions: {
        Row: {
          created_at: string
          device_name: string | null
          device_token_hash: string
          expires_at: string | null
          id: string
          last_seen_at: string
          revoked_at: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          device_name?: string | null
          device_token_hash: string
          expires_at?: string | null
          id?: string
          last_seen_at?: string
          revoked_at?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          device_name?: string | null
          device_token_hash?: string
          expires_at?: string | null
          id?: string
          last_seen_at?: string
          revoked_at?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_device_sessions_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string | null
          email: string
          expires_at: string
          id: string
          status: string
          token_hash: string
          wedding_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string
          id?: string
          status?: string
          token_hash: string
          wedding_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string
          id?: string
          status?: string
          token_hash?: string
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "couple_invites_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_updates: {
        Row: {
          ai_result: Json | null
          author_user_id: string
          content: string
          created_at: string
          id: string
          processed_at: string | null
          processing_status: string
          wedding_id: string
        }
        Insert: {
          ai_result?: Json | null
          author_user_id: string
          content: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processing_status?: string
          wedding_id: string
        }
        Update: {
          ai_result?: Json | null
          author_user_id?: string
          content?: string
          created_at?: string
          id?: string
          processed_at?: string | null
          processing_status?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_updates_wedding_id_fkey"
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
      guest_notification_preferences: {
        Row: {
          id: string
          important_alerts: boolean
          push_subscription_id: string
          social_alerts: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          important_alerts?: boolean
          push_subscription_id: string
          social_alerts?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          important_alerts?: boolean
          push_subscription_id?: string
          social_alerts?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_notification_preferences_push_subscription_id_fkey"
            columns: ["push_subscription_id"]
            isOneToOne: true
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_photos: {
        Row: {
          approved: boolean
          caption: string | null
          created_at: string
          display_storage_path: string | null
          guest_name: string | null
          guest_session_id: string | null
          id: string
          image_url: string
          status: string
          storage_path: string | null
          wedding_id: string
        }
        Insert: {
          approved?: boolean
          caption?: string | null
          created_at?: string
          display_storage_path?: string | null
          guest_name?: string | null
          guest_session_id?: string | null
          id?: string
          image_url: string
          status?: string
          storage_path?: string | null
          wedding_id: string
        }
        Update: {
          approved?: boolean
          caption?: string | null
          created_at?: string
          display_storage_path?: string | null
          guest_name?: string | null
          guest_session_id?: string | null
          id?: string
          image_url?: string
          status?: string
          storage_path?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_photos_guest_session_id_fkey"
            columns: ["guest_session_id"]
            isOneToOne: false
            referencedRelation: "guest_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_photos_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          last_seen_at: string
          revoked_at: string | null
          rsvp_id: string | null
          session_token_hash: string
          verification_expires_at: string | null
          verification_token: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          last_seen_at?: string
          revoked_at?: string | null
          rsvp_id?: string | null
          session_token_hash: string
          verification_expires_at?: string | null
          verification_token?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          last_seen_at?: string
          revoked_at?: string | null
          rsvp_id?: string | null
          session_token_hash?: string
          verification_expires_at?: string | null
          verification_token?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_sessions_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_sessions_wedding_id_fkey"
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
      in_app_notifications: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          notification_event_id: string | null
          read_at: string | null
          recipient_device_id: string | null
          recipient_rsvp_id: string | null
          recipient_type: string
          target_url: string
          title: string
          wedding_id: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          id?: string
          notification_event_id?: string | null
          read_at?: string | null
          recipient_device_id?: string | null
          recipient_rsvp_id?: string | null
          recipient_type: string
          target_url: string
          title: string
          wedding_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          notification_event_id?: string | null
          read_at?: string | null
          recipient_device_id?: string | null
          recipient_rsvp_id?: string | null
          recipient_type?: string
          target_url?: string
          title?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "in_app_notifications_notification_event_id_fkey"
            columns: ["notification_event_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "in_app_notifications_recipient_rsvp_id_fkey"
            columns: ["recipient_rsvp_id"]
            isOneToOne: false
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "in_app_notifications_wedding_id_fkey"
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
      notification_deliveries: {
        Row: {
          body: string
          category: string
          created_at: string
          delivery_status: string
          error_code: string | null
          id: string
          notification_event_id: string | null
          opened_at: string | null
          push_subscription_id: string | null
          read_at: string | null
          recipient_type: string
          sent_at: string | null
          target_url: string
          title: string
          wedding_id: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          delivery_status?: string
          error_code?: string | null
          id?: string
          notification_event_id?: string | null
          opened_at?: string | null
          push_subscription_id?: string | null
          read_at?: string | null
          recipient_type: string
          sent_at?: string | null
          target_url: string
          title: string
          wedding_id: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          delivery_status?: string
          error_code?: string | null
          id?: string
          notification_event_id?: string | null
          opened_at?: string | null
          push_subscription_id?: string | null
          read_at?: string | null
          recipient_type?: string
          sent_at?: string | null
          target_url?: string
          title?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_notification_event_id_fkey"
            columns: ["notification_event_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_deliveries_push_subscription_id_fkey"
            columns: ["push_subscription_id"]
            isOneToOne: false
            referencedRelation: "push_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_deliveries_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_events: {
        Row: {
          actor_id: string | null
          actor_type: string | null
          claimed_at: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          priority: string
          processed_at: string | null
          status: string
          subject_id: string | null
          wedding_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string | null
          claimed_at?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          priority?: string
          processed_at?: string | null
          status?: string
          subject_id?: string | null
          wedding_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string | null
          claimed_at?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          priority?: string
          processed_at?: string | null
          status?: string
          subject_id?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_events_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_jobs: {
        Row: {
          attempts: number
          audience: string
          category: string
          created_at: string
          event_id: string | null
          id: string
          last_error: string | null
          processed_at: string | null
          scheduled_for: string
          status: string
          wedding_id: string
        }
        Insert: {
          attempts?: number
          audience: string
          category: string
          created_at?: string
          event_id?: string | null
          id?: string
          last_error?: string | null
          processed_at?: string | null
          scheduled_for?: string
          status?: string
          wedding_id: string
        }
        Update: {
          attempts?: number
          audience?: string
          category?: string
          created_at?: string
          event_id?: string | null
          id?: string
          last_error?: string | null
          processed_at?: string | null
          scheduled_for?: string
          status?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_jobs_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "notification_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_jobs_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          couple_device_session_id: string
          delivery_mode: string
          enabled: boolean
          id: string
          updated_at: string
        }
        Insert: {
          category: string
          couple_device_session_id: string
          delivery_mode?: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Update: {
          category?: string
          couple_device_session_id?: string
          delivery_mode?: string
          enabled?: boolean
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_couple_device_session_id_fkey"
            columns: ["couple_device_session_id"]
            isOneToOne: false
            referencedRelation: "couple_device_sessions"
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
      push_subscriptions: {
        Row: {
          audience_type: string
          auth_key: string
          couple_device_id: string | null
          created_at: string
          enabled: boolean
          endpoint: string
          guest_id: string | null
          id: string
          last_seen_at: string
          p256dh_key: string
          platform: string | null
          updated_at: string
          user_agent: string | null
          wedding_id: string
        }
        Insert: {
          audience_type: string
          auth_key: string
          couple_device_id?: string | null
          created_at?: string
          enabled?: boolean
          endpoint: string
          guest_id?: string | null
          id?: string
          last_seen_at?: string
          p256dh_key: string
          platform?: string | null
          updated_at?: string
          user_agent?: string | null
          wedding_id: string
        }
        Update: {
          audience_type?: string
          auth_key?: string
          couple_device_id?: string | null
          created_at?: string
          enabled?: boolean
          endpoint?: string
          guest_id?: string | null
          id?: string
          last_seen_at?: string
          p256dh_key?: string
          platform?: string | null
          updated_at?: string
          user_agent?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
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
      resend_webhook_events: {
        Row: {
          audience: string
          email_id: string | null
          event_created_at: string | null
          event_type: string
          id: string
          payload: Json
          received_at: string
          svix_id: string
        }
        Insert: {
          audience: string
          email_id?: string | null
          event_created_at?: string | null
          event_type: string
          id?: string
          payload: Json
          received_at?: string
          svix_id: string
        }
        Update: {
          audience?: string
          email_id?: string | null
          event_created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          received_at?: string
          svix_id?: string
        }
        Relationships: []
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
      wedding_action_items: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          dismissed_at: string | null
          due_date: string | null
          id: string
          priority: string
          source: string
          source_id: string | null
          status: string
          title: string
          updated_at: string
          wedding_id: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          dismissed_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          source?: string
          source_id?: string | null
          status?: string
          title: string
          updated_at?: string
          wedding_id: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          dismissed_at?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          source?: string
          source_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_action_items_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_budget_entries: {
        Row: {
          amount: number
          category: string
          created_at: string
          id: string
          notes: string
          receipt_url: string | null
          spent_on: string
          title: string
          wedding_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          id?: string
          notes?: string
          receipt_url?: string | null
          spent_on?: string
          title: string
          wedding_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          id?: string
          notes?: string
          receipt_url?: string | null
          spent_on?: string
          title?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_budget_entries_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_budgets: {
        Row: {
          currency: string
          planned_amount: number
          updated_at: string
          wedding_id: string
        }
        Insert: {
          currency?: string
          planned_amount?: number
          updated_at?: string
          wedding_id: string
        }
        Update: {
          currency?: string
          planned_amount?: number
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_budgets_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_checkin_settings: {
        Row: {
          checkin_closes_at: string | null
          checkin_enabled: boolean
          checkin_opens_at: string | null
          created_at: string
          geolocation_enabled: boolean
          id: string
          latitude: number | null
          longitude: number | null
          qr_checkin_enabled: boolean
          radius_meters: number
          updated_at: string
          wedding_id: string
        }
        Insert: {
          checkin_closes_at?: string | null
          checkin_enabled?: boolean
          checkin_opens_at?: string | null
          created_at?: string
          geolocation_enabled?: boolean
          id?: string
          latitude?: number | null
          longitude?: number | null
          qr_checkin_enabled?: boolean
          radius_meters?: number
          updated_at?: string
          wedding_id: string
        }
        Update: {
          checkin_closes_at?: string | null
          checkin_enabled?: boolean
          checkin_opens_at?: string | null
          created_at?: string
          geolocation_enabled?: boolean
          id?: string
          latitude?: number | null
          longitude?: number | null
          qr_checkin_enabled?: boolean
          radius_meters?: number
          updated_at?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_checkin_settings_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          event_date: string | null
          event_type: string
          guest_visible: boolean
          id: string
          reminder_enabled: boolean
          sort_order: number
          start_time: string | null
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
          wedding_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          event_type?: string
          guest_visible?: boolean
          id?: string
          reminder_enabled?: boolean
          sort_order?: number
          start_time?: string | null
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          wedding_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          event_date?: string | null
          event_type?: string
          guest_visible?: boolean
          id?: string
          reminder_enabled?: boolean
          sort_order?: number
          start_time?: string | null
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_events_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_guest_details: {
        Row: {
          accessibility: string
          children: string
          contact_email: string
          contact_name: string
          contact_phone: string
          other_details: string
          parking: string
          transport: string
          wedding_id: string
        }
        Insert: {
          accessibility?: string
          children?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          other_details?: string
          parking?: string
          transport?: string
          wedding_id: string
        }
        Update: {
          accessibility?: string
          children?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          other_details?: string
          parking?: string
          transport?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_guest_details_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_members: {
        Row: {
          id: string
          invited_at: string
          joined_at: string | null
          role: string
          user_id: string
          wedding_id: string
        }
        Insert: {
          id?: string
          invited_at?: string
          joined_at?: string | null
          role?: string
          user_id: string
          wedding_id: string
        }
        Update: {
          id?: string
          invited_at?: string
          joined_at?: string | null
          role?: string
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
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
      wedding_public_profiles: {
        Row: {
          ceremony_address: string | null
          ceremony_time: string | null
          ceremony_venue: string | null
          couple_names: string
          cover_image_path: string | null
          created_at: string
          dress_code: string | null
          partner_one_name: string | null
          partner_two_name: string | null
          published: boolean
          reception_address: string | null
          reception_time: string | null
          reception_venue: string | null
          rsvp_deadline: string | null
          rsvp_image_path: string | null
          story: string | null
          story_image_path: string | null
          theme: Json
          updated_at: string
          wedding_date: string | null
          wedding_id: string
        }
        Insert: {
          ceremony_address?: string | null
          ceremony_time?: string | null
          ceremony_venue?: string | null
          couple_names: string
          cover_image_path?: string | null
          created_at?: string
          dress_code?: string | null
          partner_one_name?: string | null
          partner_two_name?: string | null
          published?: boolean
          reception_address?: string | null
          reception_time?: string | null
          reception_venue?: string | null
          rsvp_deadline?: string | null
          rsvp_image_path?: string | null
          story?: string | null
          story_image_path?: string | null
          theme?: Json
          updated_at?: string
          wedding_date?: string | null
          wedding_id: string
        }
        Update: {
          ceremony_address?: string | null
          ceremony_time?: string | null
          ceremony_venue?: string | null
          couple_names?: string
          cover_image_path?: string | null
          created_at?: string
          dress_code?: string | null
          partner_one_name?: string | null
          partner_two_name?: string | null
          published?: boolean
          reception_address?: string | null
          reception_time?: string | null
          reception_venue?: string | null
          rsvp_deadline?: string | null
          rsvp_image_path?: string | null
          story?: string | null
          story_image_path?: string | null
          theme?: Json
          updated_at?: string
          wedding_date?: string | null
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_public_profiles_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
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
      wedding_setup: {
        Row: {
          celebration_completed: boolean
          completed_at: string | null
          couple_completed: boolean
          current_step: number
          guest_settings_completed: boolean
          photos_completed: boolean
          story_completed: boolean
          updated_at: string
          wedding_completed: boolean
          wedding_id: string
        }
        Insert: {
          celebration_completed?: boolean
          completed_at?: string | null
          couple_completed?: boolean
          current_step?: number
          guest_settings_completed?: boolean
          photos_completed?: boolean
          story_completed?: boolean
          updated_at?: string
          wedding_completed?: boolean
          wedding_id: string
        }
        Update: {
          celebration_completed?: boolean
          completed_at?: string | null
          couple_completed?: boolean
          current_step?: number
          guest_settings_completed?: boolean
          photos_completed?: boolean
          story_completed?: boolean
          updated_at?: string
          wedding_completed?: boolean
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_setup_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_story_details: {
        Row: {
          additional_story: string | null
          created_at: string
          first_date: string | null
          generated_story: string | null
          how_we_met: string | null
          proposal_story: string | null
          updated_at: string
          wedding_id: string
          when_we_knew: string | null
        }
        Insert: {
          additional_story?: string | null
          created_at?: string
          first_date?: string | null
          generated_story?: string | null
          how_we_met?: string | null
          proposal_story?: string | null
          updated_at?: string
          wedding_id: string
          when_we_knew?: string | null
        }
        Update: {
          additional_story?: string | null
          created_at?: string
          first_date?: string | null
          generated_story?: string | null
          how_we_met?: string | null
          proposal_story?: string | null
          updated_at?: string
          wedding_id?: string
          when_we_knew?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_story_details_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: true
            referencedRelation: "weddings"
            referencedColumns: ["id"]
          },
        ]
      }
      wedding_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          target_tab: string
          title: string
          wedding_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          target_tab?: string
          title: string
          wedding_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          target_tab?: string
          title?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_tasks_wedding_id_fkey"
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
          rsvp_image: string | null
          slug: string
          story: string | null
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
          rsvp_image?: string | null
          slug: string
          story?: string | null
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
          rsvp_image?: string | null
          slug?: string
          story?: string | null
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
      claim_first_admin: { Args: never; Returns: boolean }
      claim_notification_events: {
        Args: never
        Returns: {
          actor_id: string | null
          actor_type: string | null
          claimed_at: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          priority: string
          processed_at: string | null
          status: string
          subject_id: string | null
          wedding_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "notification_events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      create_couple_wedding: {
        Args: {
          requested_date?: string
          requested_dress_code?: string
          requested_names: string
          requested_reception_venue?: string
          requested_slug: string
          requested_story?: string
          requested_venue?: string
        }
        Returns: {
          access_code: string
          admin_user_id: string
          ceremony_time: string | null
          ceremony_venue: string | null
          contact_email: string | null
          couple_names: string
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
          rsvp_image: string | null
          slug: string
          story: string | null
          story_image: string | null
          theme: Json | null
          theme_id: string | null
          updated_at: string
          wedding_date: string | null
          wedding_style: string | null
          whatsapp_group_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "weddings"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_wedding_member: {
        Args: { target_wedding_id: string }
        Returns: boolean
      }
      queue_rsvp_reminder: {
        Args: { p_rsvp_id?: string; p_wedding_id: string }
        Returns: Json
      }
      regenerate_access_code: { Args: { wedding_id: string }; Returns: string }
      submit_guest_response: {
        Args: {
          p_response: Json
          p_session_token?: string
          p_wedding_id: string
        }
        Returns: Json
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "vendor"],
    },
  },
} as const
