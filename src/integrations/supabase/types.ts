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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      admin_sessions: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          geo_checked_at: string | null
          id: string
          ip: string | null
          is_suspicious: boolean | null
          isp: string | null
          last_seen_at: string
          lat: number | null
          lng: number | null
          location: string | null
          os: string | null
          region: string | null
          revoked_at: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          geo_checked_at?: string | null
          id?: string
          ip?: string | null
          is_suspicious?: boolean | null
          isp?: string | null
          last_seen_at?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          os?: string | null
          region?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          geo_checked_at?: string | null
          id?: string
          ip?: string | null
          is_suspicious?: boolean | null
          isp?: string | null
          last_seen_at?: string
          lat?: number | null
          lng?: number | null
          location?: string | null
          os?: string | null
          region?: string | null
          revoked_at?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ai_citations: {
        Row: {
          context: string | null
          created_at: string
          created_by: string | null
          detected_at: string
          id: string
          query_text: string | null
          sentiment: string | null
          source: string
          source_type: string
          updated_at: string
          url: string | null
          verified: boolean
        }
        Insert: {
          context?: string | null
          created_at?: string
          created_by?: string | null
          detected_at?: string
          id?: string
          query_text?: string | null
          sentiment?: string | null
          source: string
          source_type?: string
          updated_at?: string
          url?: string | null
          verified?: boolean
        }
        Update: {
          context?: string | null
          created_at?: string
          created_by?: string | null
          detected_at?: string
          id?: string
          query_text?: string | null
          sentiment?: string | null
          source?: string
          source_type?: string
          updated_at?: string
          url?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      ai_ops_actions: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          confidence: number | null
          created_at: string
          id: string
          input: Json
          kind: string
          notes: string | null
          output: Json
          source_entity: string | null
          source_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          input?: Json
          kind: string
          notes?: string | null
          output?: Json
          source_entity?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          confidence?: number | null
          created_at?: string
          id?: string
          input?: Json
          kind?: string
          notes?: string | null
          output?: Json
          source_entity?: string | null
          source_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_referrals: {
        Row: {
          ai_source: string
          created_at: string
          id: string
          landing_path: string
          query_hint: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          ai_source: string
          created_at?: string
          id?: string
          landing_path: string
          query_hint?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          ai_source?: string
          created_at?: string
          id?: string
          landing_path?: string
          query_hint?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          created_at: string
          error: string | null
          estimated_cost_usd: number | null
          function_name: string
          id: string
          metadata: Json
          model: string | null
          output_chars: number | null
          prompt_chars: number | null
          success: boolean
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          estimated_cost_usd?: number | null
          function_name: string
          id?: string
          metadata?: Json
          model?: string | null
          output_chars?: number | null
          prompt_chars?: number | null
          success?: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          estimated_cost_usd?: number | null
          function_name?: string
          id?: string
          metadata?: Json
          model?: string | null
          output_chars?: number | null
          prompt_chars?: number | null
          success?: boolean
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      attachments: {
        Row: {
          client_id: string | null
          created_at: string
          file_url: string
          id: string
          metadata: Json
          mime_type: string | null
          name: string
          project_id: string | null
          size_bytes: number | null
          stage_id: string | null
          type: Database["public"]["Enums"]["attachment_type"]
          uploaded_by: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          file_url: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          name: string
          project_id?: string | null
          size_bytes?: number | null
          stage_id?: string | null
          type?: Database["public"]["Enums"]["attachment_type"]
          uploaded_by?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          file_url?: string
          id?: string
          metadata?: Json
          mime_type?: string | null
          name?: string
          project_id?: string | null
          size_bytes?: number | null
          stage_id?: string | null
          type?: Database["public"]["Enums"]["attachment_type"]
          uploaded_by?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          diff: Json
          id: string
          occurred_at: string
          record_id: string | null
          summary: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          diff?: Json
          id?: string
          occurred_at?: string
          record_id?: string | null
          summary?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          diff?: Json
          id?: string
          occurred_at?: string
          record_id?: string | null
          summary?: string | null
          table_name?: string
        }
        Relationships: []
      }
      automation_runs: {
        Row: {
          automation_id: string
          created_at: string
          duration_ms: number | null
          error: string | null
          event_id: string | null
          id: string
          replay_of: string | null
          result: Json | null
          status: string
          trigger_event: string | null
          trigger_payload: Json | null
        }
        Insert: {
          automation_id: string
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          event_id?: string | null
          id?: string
          replay_of?: string | null
          result?: Json | null
          status?: string
          trigger_event?: string | null
          trigger_payload?: Json | null
        }
        Update: {
          automation_id?: string
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          event_id?: string | null
          id?: string
          replay_of?: string | null
          result?: Json | null
          status?: string
          trigger_event?: string | null
          trigger_payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_runs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_runs_replay_of_fkey"
            columns: ["replay_of"]
            isOneToOne: false
            referencedRelation: "automation_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      automations: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string | null
          cron_expression: string | null
          description: string | null
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          next_run_at: string | null
          run_count: number
          trigger_event: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          run_count?: number
          trigger_event: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          cron_expression?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          run_count?: number
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      bank_import_batches: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          raw_summary: Json | null
          rows_imported: number
          rows_skipped: number
          rows_total: number
          source: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          raw_summary?: Json | null
          rows_imported?: number
          rows_skipped?: number
          rows_total?: number
          source?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          raw_summary?: Json | null
          rows_imported?: number
          rows_skipped?: number
          rows_total?: number
          source?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          category_id: string | null
          content: string
          cover_image: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          read_time: number | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id: string
          category_id?: string | null
          content: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time?: number | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          read_time?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      branding_assets: {
        Row: {
          color: string | null
          custom_svg: string | null
          custom_url: string | null
          palette: string[] | null
          slug: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          color?: string | null
          custom_svg?: string | null
          custom_url?: string | null
          palette?: string[] | null
          slug: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          color?: string | null
          custom_svg?: string | null
          custom_url?: string | null
          palette?: string[] | null
          slug?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          visitor_email: string | null
          visitor_id: string
          visitor_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          visitor_email?: string | null
          visitor_id: string
          visitor_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          visitor_email?: string | null
          visitor_id?: string
          visitor_name?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      citation_monitor_settings: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          last_run_at: string | null
          last_run_mentions: number | null
          last_run_total: number | null
          models: Json
          only_save_mentions: boolean
          queries: Json
          singleton: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          last_run_mentions?: number | null
          last_run_total?: number | null
          models?: Json
          only_save_mentions?: boolean
          queries?: Json
          singleton?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          last_run_mentions?: number | null
          last_run_total?: number | null
          models?: Json
          only_save_mentions?: boolean
          queries?: Json
          singleton?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      client_interactions: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json
          occurred_at: string
          title: string
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          occurred_at?: string
          title: string
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json
          occurred_at?: string
          title?: string
          type?: Database["public"]["Enums"]["interaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "client_interactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          ai_summary: string | null
          ai_summary_updated_at: string | null
          avatar_url: string | null
          company: string | null
          contact_id: string | null
          contract_status: Database["public"]["Enums"]["contract_status"]
          contract_text: string | null
          contract_updated_at: string | null
          contract_url: string | null
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          revenue_range: string | null
          segment: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          ai_summary?: string | null
          ai_summary_updated_at?: string | null
          avatar_url?: string | null
          company?: string | null
          contact_id?: string | null
          contract_status?: Database["public"]["Enums"]["contract_status"]
          contract_text?: string | null
          contract_updated_at?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          revenue_range?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          ai_summary?: string | null
          ai_summary_updated_at?: string | null
          avatar_url?: string | null
          company?: string | null
          contact_id?: string | null
          contract_status?: Database["public"]["Enums"]["contract_status"]
          contract_text?: string | null
          contract_updated_at?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          revenue_range?: string | null
          segment?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          internal_notes: string | null
          message: string
          metadata: Json
          name: string
          phone: string | null
          priority: string
          source: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          internal_notes?: string | null
          message: string
          metadata?: Json
          name: string
          phone?: string | null
          priority?: string
          source?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          internal_notes?: string | null
          message?: string
          metadata?: Json
          name?: string
          phone?: string | null
          priority?: string
          source?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          assigned_to: string | null
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          last_contacted_at: string | null
          lead_score: number | null
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          score_reasons: Json | null
          service_type: string | null
          sla_due_at: string | null
          source: string | null
          status: Database["public"]["Enums"]["contact_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          last_contacted_at?: string | null
          lead_score?: number | null
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          score_reasons?: Json | null
          service_type?: string | null
          sla_due_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          last_contacted_at?: string | null
          lead_score?: number | null
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          score_reasons?: Json | null
          service_type?: string | null
          sla_due_at?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
        }
        Relationships: []
      }
      contract_versions: {
        Row: {
          content_hash: string | null
          contract_status: string | null
          contract_text: string | null
          contract_url: string | null
          created_at: string
          created_by: string | null
          created_by_email: string | null
          entity_id: string
          entity_type: string
          id: string
          label: string | null
          version: number
        }
        Insert: {
          content_hash?: string | null
          contract_status?: string | null
          contract_text?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          entity_id: string
          entity_type: string
          id?: string
          label?: string | null
          version: number
        }
        Update: {
          content_hash?: string | null
          contract_status?: string | null
          contract_text?: string | null
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          label?: string | null
          version?: number
        }
        Relationships: []
      }
      events: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          correlation_id: string | null
          created_at: string
          id: string
          payload: Json
          severity: string
          source: string
          type: string
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          severity?: string
          source?: string
          type: string
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          correlation_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
          severity?: string
          source?: string
          type?: string
        }
        Relationships: []
      }
      faq_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string
          display_order: number
          helpful_count: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
          views_count: number
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string
          display_order?: number
          helpful_count?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string
          display_order?: number
          helpful_count?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "faq_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "faq_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      fx_rates: {
        Row: {
          currency: Database["public"]["Enums"]["currency_code"]
          fetched_at: string
          id: string
          rate_to_brl: number
          source: string | null
        }
        Insert: {
          currency: Database["public"]["Enums"]["currency_code"]
          fetched_at?: string
          id?: string
          rate_to_brl: number
          source?: string | null
        }
        Update: {
          currency?: Database["public"]["Enums"]["currency_code"]
          fetched_at?: string
          id?: string
          rate_to_brl?: number
          source?: string | null
        }
        Relationships: []
      }
      incident_timeline: {
        Row: {
          author_email: string | null
          author_id: string | null
          created_at: string
          id: string
          incident_id: string
          message: string
          status: string | null
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          created_at?: string
          id?: string
          incident_id: string
          message: string
          status?: string | null
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string
          message?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_timeline_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          affected_systems: string[] | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          impact: string | null
          postmortem: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_systems?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          postmortem?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_systems?: string[] | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          impact?: string | null
          postmortem?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          level: string
          provider_id: string | null
          request: Json | null
          response: Json | null
          status_code: number | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          level?: string
          provider_id?: string | null
          request?: Json | null
          response?: Json | null
          status_code?: number | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          level?: string
          provider_id?: string | null
          request?: Json | null
          response?: Json | null
          status_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "integration_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_providers: {
        Row: {
          category: string
          color: string | null
          config: Json
          created_at: string
          description: string | null
          health_status: string
          icon: string | null
          id: string
          is_active: boolean
          is_connected: boolean
          last_error: string | null
          last_sync_at: string | null
          last_test_at: string | null
          name: string
          request_count: number
          secret_refs: string[]
          updated_at: string
        }
        Insert: {
          category: string
          color?: string | null
          config?: Json
          created_at?: string
          description?: string | null
          health_status?: string
          icon?: string | null
          id: string
          is_active?: boolean
          is_connected?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          last_test_at?: string | null
          name: string
          request_count?: number
          secret_refs?: string[]
          updated_at?: string
        }
        Update: {
          category?: string
          color?: string | null
          config?: Json
          created_at?: string
          description?: string | null
          health_status?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          is_connected?: boolean
          last_error?: string | null
          last_sync_at?: string | null
          last_test_at?: string | null
          name?: string
          request_count?: number
          secret_refs?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      logo_variations: {
        Row: {
          ai_model: string | null
          created_at: string
          generated_by: string | null
          id: string
          image_url: string
          name: string
          prompt: string | null
          slug: string
          variant_kind: string
        }
        Insert: {
          ai_model?: string | null
          created_at?: string
          generated_by?: string | null
          id?: string
          image_url: string
          name: string
          prompt?: string | null
          slug: string
          variant_kind: string
        }
        Update: {
          ai_model?: string | null
          created_at?: string
          generated_by?: string | null
          id?: string
          image_url?: string
          name?: string
          prompt?: string | null
          slug?: string
          variant_kind?: string
        }
        Relationships: []
      }
      marketplace_installs: {
        Row: {
          created_at: string
          id: string
          installed_by: string | null
          notes: string | null
          provider_name: string
          provider_slug: string
          requested_secrets: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          installed_by?: string | null
          notes?: string | null
          provider_name: string
          provider_slug: string
          requested_secrets?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          installed_by?: string | null
          notes?: string | null
          provider_name?: string
          provider_slug?: string
          requested_secrets?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          channel: string
          created_at: string
          enabled: boolean
          event_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string
          enabled?: boolean
          event_type: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string
          enabled?: boolean
          event_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          payload: Json
          read_at: string | null
          severity: string
          title: string
          type: string
          url: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          severity?: string
          title: string
          type: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          payload?: Json
          read_at?: string | null
          severity?: string
          title?: string
          type?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      oauth_connections: {
        Row: {
          access_token: string | null
          account_avatar: string | null
          account_email: string | null
          account_name: string | null
          created_at: string
          expires_at: string | null
          id: string
          last_refreshed_at: string | null
          provider: string
          raw_profile: Json | null
          refresh_token: string | null
          scopes: string[] | null
          status: string
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_avatar?: string | null
          account_email?: string | null
          account_name?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          provider: string
          raw_profile?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_avatar?: string | null
          account_email?: string | null
          account_name?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          last_refreshed_at?: string | null
          provider?: string
          raw_profile?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          status?: string
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_steps: string[]
          created_at: string
          dismissed_at: string | null
          id: string
          tour_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: string[]
          created_at?: string
          dismissed_at?: string | null
          id?: string
          tour_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: string[]
          created_at?: string
          dismissed_at?: string | null
          id?: string
          tour_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          id: string
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          visitor_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      pipeline_stage_log: {
        Row: {
          changed_by: string | null
          created_at: string
          from_stage:
            | Database["public"]["Enums"]["project_pipeline_stage"]
            | null
          id: string
          note: string | null
          project_id: string
          to_stage: Database["public"]["Enums"]["project_pipeline_stage"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_stage?:
            | Database["public"]["Enums"]["project_pipeline_stage"]
            | null
          id?: string
          note?: string | null
          project_id: string
          to_stage: Database["public"]["Enums"]["project_pipeline_stage"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_stage?:
            | Database["public"]["Enums"]["project_pipeline_stage"]
            | null
          id?: string
          note?: string | null
          project_id?: string
          to_stage?: Database["public"]["Enums"]["project_pipeline_stage"]
        }
        Relationships: []
      }
      portfolio_settings: {
        Row: {
          about: Json
          contact: Json
          content_version: number
          created_at: string
          cv: Json
          faqs: Json
          flags: Json
          footer: Json
          hero: Json
          highlights: Json
          id: string
          is_published: boolean
          links: Json
          navigation: Json
          profile: Json
          pwa: Json
          seo: Json
          services: Json
          site_key: string
          skills: Json
          stats: Json
          updated_at: string
        }
        Insert: {
          about?: Json
          contact?: Json
          content_version?: number
          created_at?: string
          cv?: Json
          faqs?: Json
          flags?: Json
          footer?: Json
          hero?: Json
          highlights?: Json
          id?: string
          is_published?: boolean
          links?: Json
          navigation?: Json
          profile?: Json
          pwa?: Json
          seo?: Json
          services?: Json
          site_key?: string
          skills?: Json
          stats?: Json
          updated_at?: string
        }
        Update: {
          about?: Json
          contact?: Json
          content_version?: number
          created_at?: string
          cv?: Json
          faqs?: Json
          flags?: Json
          footer?: Json
          hero?: Json
          highlights?: Json
          id?: string
          is_published?: boolean
          links?: Json
          navigation?: Json
          profile?: Json
          pwa?: Json
          seo?: Json
          services?: Json
          site_key?: string
          skills?: Json
          stats?: Json
          updated_at?: string
        }
        Relationships: []
      }
      process_template_stages: {
        Row: {
          ai_prompt: string | null
          color: string | null
          created_at: string
          default_checklist: Json
          default_deliverables: Json
          description: string | null
          display_order: number
          icon: string | null
          id: string
          is_visible_on_site: boolean
          name: string
          slug: string
          template_id: string
          updated_at: string
        }
        Insert: {
          ai_prompt?: string | null
          color?: string | null
          created_at?: string
          default_checklist?: Json
          default_deliverables?: Json
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_visible_on_site?: boolean
          name: string
          slug: string
          template_id: string
          updated_at?: string
        }
        Update: {
          ai_prompt?: string | null
          color?: string | null
          created_at?: string
          default_checklist?: Json
          default_deliverables?: Json
          description?: string | null
          display_order?: number
          icon?: string | null
          id?: string
          is_visible_on_site?: boolean
          name?: string
          slug?: string
          template_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_template_stages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "process_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      process_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      project_budgets: {
        Row: {
          amount_total: number
          amount_total_brl: number
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          default_hourly_rate_brl: number
          estimated_hours: number
          id: string
          notes: string | null
          project_id: string
          tax_percent: number
          updated_at: string
        }
        Insert: {
          amount_total?: number
          amount_total_brl?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          default_hourly_rate_brl?: number
          estimated_hours?: number
          id?: string
          notes?: string | null
          project_id: string
          tax_percent?: number
          updated_at?: string
        }
        Update: {
          amount_total?: number
          amount_total_brl?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          default_hourly_rate_brl?: number
          estimated_hours?: number
          id?: string
          notes?: string | null
          project_id?: string
          tax_percent?: number
          updated_at?: string
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          ai_output: string | null
          ai_output_updated_at: string | null
          completed_at: string | null
          created_at: string
          display_order: number
          due_at: string | null
          files: Json
          id: string
          name: string
          notes: string | null
          project_id: string
          responsible_user_id: string | null
          slug: string
          started_at: string | null
          status: Database["public"]["Enums"]["stage_status"]
          template_stage_id: string | null
          updated_at: string
        }
        Insert: {
          ai_output?: string | null
          ai_output_updated_at?: string | null
          completed_at?: string | null
          created_at?: string
          display_order?: number
          due_at?: string | null
          files?: Json
          id?: string
          name: string
          notes?: string | null
          project_id: string
          responsible_user_id?: string | null
          slug: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          template_stage_id?: string | null
          updated_at?: string
        }
        Update: {
          ai_output?: string | null
          ai_output_updated_at?: string | null
          completed_at?: string | null
          created_at?: string
          display_order?: number
          due_at?: string | null
          files?: Json
          id?: string
          name?: string
          notes?: string | null
          project_id?: string
          responsible_user_id?: string | null
          slug?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          template_stage_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_stages_template_stage_id_fkey"
            columns: ["template_stage_id"]
            isOneToOne: false
            referencedRelation: "process_template_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          case_study_url: string | null
          category: string | null
          category_key: string | null
          challenges: string[]
          client_id: string | null
          client_name: string | null
          client_segment: string | null
          contract_status: Database["public"]["Enums"]["contract_status"]
          contract_text: string | null
          contract_updated_at: string | null
          contract_url: string | null
          cover_image: string | null
          created_at: string
          created_by: string | null
          description: string
          display_order: number
          expected_close_date: string | null
          featured_level: Database["public"]["Enums"]["featured_level"]
          figma_url: string | null
          forecast_value: number | null
          gallery: Json
          github_repo: string | null
          github_url: string | null
          id: string
          is_featured: boolean
          is_published_on_site: boolean
          live_url: string | null
          long_description: string | null
          metrics: Json
          pipeline_stage: Database["public"]["Enums"]["project_pipeline_stage"]
          portfolio_enabled: boolean
          portfolio_highlight: boolean
          portfolio_order: number
          probability: number | null
          problem: string | null
          published_at: string | null
          results: string[]
          seo_description: string | null
          seo_keywords: string[] | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["project_status"]
          subtitle: string | null
          tags: string[]
          technologies: Json
          title: string
          updated_at: string
          vercel_project_id: string | null
          views_count: number
        }
        Insert: {
          case_study_url?: string | null
          category?: string | null
          category_key?: string | null
          challenges?: string[]
          client_id?: string | null
          client_name?: string | null
          client_segment?: string | null
          contract_status?: Database["public"]["Enums"]["contract_status"]
          contract_text?: string | null
          contract_updated_at?: string | null
          contract_url?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          display_order?: number
          expected_close_date?: string | null
          featured_level?: Database["public"]["Enums"]["featured_level"]
          figma_url?: string | null
          forecast_value?: number | null
          gallery?: Json
          github_repo?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean
          is_published_on_site?: boolean
          live_url?: string | null
          long_description?: string | null
          metrics?: Json
          pipeline_stage?: Database["public"]["Enums"]["project_pipeline_stage"]
          portfolio_enabled?: boolean
          portfolio_highlight?: boolean
          portfolio_order?: number
          probability?: number | null
          problem?: string | null
          published_at?: string | null
          results?: string[]
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["project_status"]
          subtitle?: string | null
          tags?: string[]
          technologies?: Json
          title: string
          updated_at?: string
          vercel_project_id?: string | null
          views_count?: number
        }
        Update: {
          case_study_url?: string | null
          category?: string | null
          category_key?: string | null
          challenges?: string[]
          client_id?: string | null
          client_name?: string | null
          client_segment?: string | null
          contract_status?: Database["public"]["Enums"]["contract_status"]
          contract_text?: string | null
          contract_updated_at?: string | null
          contract_url?: string | null
          cover_image?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          display_order?: number
          expected_close_date?: string | null
          featured_level?: Database["public"]["Enums"]["featured_level"]
          figma_url?: string | null
          forecast_value?: number | null
          gallery?: Json
          github_repo?: string | null
          github_url?: string | null
          id?: string
          is_featured?: boolean
          is_published_on_site?: boolean
          live_url?: string | null
          long_description?: string | null
          metrics?: Json
          pipeline_stage?: Database["public"]["Enums"]["project_pipeline_stage"]
          portfolio_enabled?: boolean
          portfolio_highlight?: boolean
          portfolio_order?: number
          probability?: number | null
          problem?: string | null
          published_at?: string | null
          results?: string[]
          seo_description?: string | null
          seo_keywords?: string[] | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["project_status"]
          subtitle?: string | null
          tags?: string[]
          technologies?: Json
          title?: string
          updated_at?: string
          vercel_project_id?: string | null
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      response_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          subject: string | null
          updated_at: string
          usage_count: number | null
          variables: string[] | null
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          subject?: string | null
          updated_at?: string
          usage_count?: number | null
          variables?: string[] | null
        }
        Relationships: []
      }
      restore_jobs: {
        Row: {
          backup_id: string | null
          created_at: string
          error: string | null
          executed_by: string | null
          id: string
          inserted_rows: number
          log: Json
          mode: string
          progress: number
          selected_tables: string[]
          source_url: string | null
          status: string
          total_rows: number
          updated_at: string
        }
        Insert: {
          backup_id?: string | null
          created_at?: string
          error?: string | null
          executed_by?: string | null
          id?: string
          inserted_rows?: number
          log?: Json
          mode?: string
          progress?: number
          selected_tables?: string[]
          source_url?: string | null
          status?: string
          total_rows?: number
          updated_at?: string
        }
        Update: {
          backup_id?: string | null
          created_at?: string
          error?: string | null
          executed_by?: string | null
          id?: string
          inserted_rows?: number
          log?: Json
          mode?: string
          progress?: number
          selected_tables?: string[]
          source_url?: string | null
          status?: string
          total_rows?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restore_jobs_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "tenant_backups"
            referencedColumns: ["id"]
          },
        ]
      }
      service_health_snapshots: {
        Row: {
          checked_at: string
          error: string | null
          id: string
          latency_ms: number | null
          metadata: Json | null
          service_name: string
          status: string
        }
        Insert: {
          checked_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          service_name: string
          status: string
        }
        Update: {
          checked_at?: string
          error?: string | null
          id?: string
          latency_ms?: number | null
          metadata?: Json | null
          service_name?: string
          status?: string
        }
        Relationships: []
      }
      services_cms: {
        Row: {
          color: string | null
          cover_image: string | null
          created_at: string
          deliverables: Json
          description: string
          display_order: number
          features: Json
          icon: string | null
          id: string
          is_featured: boolean
          is_published: boolean
          long_description: string | null
          price_from: number | null
          price_label: string | null
          seo_description: string | null
          seo_title: string | null
          show_on_home: boolean
          show_on_services_page: boolean
          slug: string
          subtitle: string | null
          technologies: Json
          title: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          cover_image?: string | null
          created_at?: string
          deliverables?: Json
          description: string
          display_order?: number
          features?: Json
          icon?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          long_description?: string | null
          price_from?: number | null
          price_label?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_on_home?: boolean
          show_on_services_page?: boolean
          slug: string
          subtitle?: string | null
          technologies?: Json
          title: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          cover_image?: string | null
          created_at?: string
          deliverables?: Json
          description?: string
          display_order?: number
          features?: Json
          icon?: string | null
          id?: string
          is_featured?: boolean
          is_published?: boolean
          long_description?: string | null
          price_from?: number | null
          price_label?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_on_home?: boolean
          show_on_services_page?: boolean
          slug?: string
          subtitle?: string | null
          technologies?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_page_comparison_rows: {
        Row: {
          created_at: string
          criterion: string
          icon_a: string | null
          icon_b: string | null
          id: string
          is_active: boolean
          is_highlighted: boolean
          sort_order: number
          updated_at: string
          value_a: string
          value_b: string
        }
        Insert: {
          created_at?: string
          criterion: string
          icon_a?: string | null
          icon_b?: string | null
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          sort_order?: number
          updated_at?: string
          value_a: string
          value_b: string
        }
        Update: {
          created_at?: string
          criterion?: string
          icon_a?: string | null
          icon_b?: string | null
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          sort_order?: number
          updated_at?: string
          value_a?: string
          value_b?: string
        }
        Relationships: []
      }
      site_page_config: {
        Row: {
          comparison_config: Json
          created_at: string
          cta_config: Json
          diagnostico: Json
          faq_config: Json
          geo: Json
          hero_config: Json
          id: string
          last_published_at: string | null
          last_published_by: string | null
          local: Json
          page_slug: string
          page_status: string
          roi_config: Json
          seo: Json
          singleton: boolean
          tech_config: Json
          updated_at: string
        }
        Insert: {
          comparison_config?: Json
          created_at?: string
          cta_config?: Json
          diagnostico?: Json
          faq_config?: Json
          geo?: Json
          hero_config?: Json
          id?: string
          last_published_at?: string | null
          last_published_by?: string | null
          local?: Json
          page_slug?: string
          page_status?: string
          roi_config?: Json
          seo?: Json
          singleton?: boolean
          tech_config?: Json
          updated_at?: string
        }
        Update: {
          comparison_config?: Json
          created_at?: string
          cta_config?: Json
          diagnostico?: Json
          faq_config?: Json
          geo?: Json
          hero_config?: Json
          id?: string
          last_published_at?: string | null
          last_published_by?: string | null
          local?: Json
          page_slug?: string
          page_status?: string
          roi_config?: Json
          seo?: Json
          singleton?: boolean
          tech_config?: Json
          updated_at?: string
        }
        Relationships: []
      }
      site_page_diagnostics: {
        Row: {
          answers: Json
          consent_at: string | null
          consent_lgpd: boolean
          contact_id: string | null
          created_at: string
          id: string
          source_url: string | null
          utm: Json | null
        }
        Insert: {
          answers?: Json
          consent_at?: string | null
          consent_lgpd?: boolean
          contact_id?: string | null
          created_at?: string
          id?: string
          source_url?: string | null
          utm?: Json | null
        }
        Update: {
          answers?: Json
          consent_at?: string | null
          consent_lgpd?: boolean
          contact_id?: string | null
          created_at?: string
          id?: string
          source_url?: string | null
          utm?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "site_page_diagnostics_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      site_page_differentials: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          is_highlighted: boolean
          link_url: string | null
          sort_order: number
          title: string
          updated_at: string
          variant: string | null
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          link_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          variant?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          link_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          variant?: string | null
        }
        Relationships: []
      }
      site_page_faqs: {
        Row: {
          created_at: string
          faq_id: string
          id: string
          is_active: boolean
          override_answer: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          faq_id: string
          id?: string
          is_active?: boolean
          override_answer?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          faq_id?: string
          id?: string
          is_active?: boolean
          override_answer?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_page_faqs_faq_id_fkey"
            columns: ["faq_id"]
            isOneToOne: true
            referencedRelation: "faq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      site_page_metrics: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          prefix: string | null
          sort_order: number
          source_kind: string
          suffix: string | null
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          prefix?: string | null
          sort_order?: number
          source_kind?: string
          suffix?: string | null
          updated_at?: string
          value?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          prefix?: string | null
          sort_order?: number
          source_kind?: string
          suffix?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      site_page_process_steps: {
        Row: {
          created_at: string
          deliverables: string[] | null
          description: string
          estimated_time: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_highlighted: boolean
          sort_order: number
          step_number: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deliverables?: string[] | null
          description: string
          estimated_time?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          sort_order?: number
          step_number: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deliverables?: string[] | null
          description?: string
          estimated_time?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_highlighted?: boolean
          sort_order?: number
          step_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_page_projects: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_featured: boolean
          is_hero: boolean
          open_new_tab: boolean
          override_cta_label: string | null
          override_cta_url: string | null
          override_description: string | null
          override_image_url: string | null
          override_title: string | null
          project_id: string
          sort_order: number
          updated_at: string
          visible_tech_ids: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_hero?: boolean
          open_new_tab?: boolean
          override_cta_label?: string | null
          override_cta_url?: string | null
          override_description?: string | null
          override_image_url?: string | null
          override_title?: string | null
          project_id: string
          sort_order?: number
          updated_at?: string
          visible_tech_ids?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          is_hero?: boolean
          open_new_tab?: boolean
          override_cta_label?: string | null
          override_cta_url?: string | null
          override_description?: string | null
          override_image_url?: string | null
          override_title?: string | null
          project_id?: string
          sort_order?: number
          updated_at?: string
          visible_tech_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "site_page_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_page_roi_metrics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          prefix: string | null
          sort_order: number
          source_label: string | null
          source_url: string | null
          suffix: string | null
          title: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          prefix?: string | null
          sort_order?: number
          source_label?: string | null
          source_url?: string | null
          suffix?: string | null
          title: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          prefix?: string | null
          sort_order?: number
          source_label?: string | null
          source_url?: string | null
          suffix?: string | null
          title?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      site_page_tech: {
        Row: {
          created_at: string
          custom_label: string | null
          id: string
          is_active: boolean
          link_url: string | null
          sort_order: number
          tech_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_label?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          tech_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_label?: string | null
          id?: string
          is_active?: boolean
          link_url?: string | null
          sort_order?: number
          tech_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_page_tech_tech_id_fkey"
            columns: ["tech_id"]
            isOneToOne: false
            referencedRelation: "tech_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      site_page_versions: {
        Row: {
          created_at: string
          created_by: string | null
          created_by_email: string | null
          id: string
          label: string | null
          snapshot: Json
          version_number: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          id?: string
          label?: string | null
          snapshot: Json
          version_number: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          created_by_email?: string | null
          id?: string
          label?: string | null
          snapshot?: Json
          version_number?: number
        }
        Relationships: []
      }
      stage_checklist_items: {
        Row: {
          created_at: string
          display_order: number
          done_at: string | null
          id: string
          is_done: boolean
          stage_id: string
          title: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          done_at?: string | null
          id?: string
          is_done?: boolean
          stage_id: string
          title: string
        }
        Update: {
          created_at?: string
          display_order?: number
          done_at?: string | null
          id?: string
          is_done?: boolean
          stage_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_checklist_items_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_documents: {
        Row: {
          ai_model: string | null
          content: string
          created_at: string
          created_by: string | null
          generated_by_ai: boolean
          id: string
          metadata: Json
          project_id: string
          stage_id: string
          title: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          version: number
        }
        Insert: {
          ai_model?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          generated_by_ai?: boolean
          id?: string
          metadata?: Json
          project_id: string
          stage_id: string
          title: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number
        }
        Update: {
          ai_model?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          generated_by_ai?: boolean
          id?: string
          metadata?: Json
          project_id?: string
          stage_id?: string
          title?: string
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      tag_registry: {
        Row: {
          color: string
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          hourly_cost_brl: number
          hourly_rate_brl: number
          id: string
          is_active: boolean
          name: string
          notes: string | null
          role: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hourly_cost_brl?: number
          hourly_rate_brl?: number
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          hourly_cost_brl?: number
          hourly_rate_brl?: number
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tech_categories: {
        Row: {
          color: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tech_registry: {
        Row: {
          aliases: string[]
          category: string | null
          category_key: string | null
          color: string
          created_at: string
          description: string | null
          icon_dark_url: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          level: number | null
          name: string
          show_in_cv: boolean
          show_in_projects: boolean
          show_in_stack: boolean
          slug: string
          sort_order: number
          tags: string[]
          updated_at: string
          usage_count: number
        }
        Insert: {
          aliases?: string[]
          category?: string | null
          category_key?: string | null
          color?: string
          created_at?: string
          description?: string | null
          icon_dark_url?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          level?: number | null
          name: string
          show_in_cv?: boolean
          show_in_projects?: boolean
          show_in_stack?: boolean
          slug: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
          usage_count?: number
        }
        Update: {
          aliases?: string[]
          category?: string | null
          category_key?: string | null
          color?: string
          created_at?: string
          description?: string | null
          icon_dark_url?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          level?: number | null
          name?: string
          show_in_cv?: boolean
          show_in_projects?: boolean
          show_in_stack?: boolean
          slug?: string
          sort_order?: number
          tags?: string[]
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      tenant_backups: {
        Row: {
          created_at: string
          error: string | null
          id: string
          metadata: Json | null
          size_bytes: number | null
          status: string | null
          storage_path: string
          tables_included: string[] | null
          triggered_by: string | null
          triggered_kind: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          size_bytes?: number | null
          status?: string | null
          storage_path: string
          tables_included?: string[] | null
          triggered_by?: string | null
          triggered_kind?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          metadata?: Json | null
          size_bytes?: number | null
          status?: string | null
          storage_path?: string
          tables_included?: string[] | null
          triggered_by?: string | null
          triggered_kind?: string | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          ended_at: string | null
          hourly_cost_brl_snapshot: number
          hourly_rate_brl_snapshot: number
          id: string
          is_billable: boolean
          member_id: string
          project_id: string
          stage_id: string | null
          started_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          hourly_cost_brl_snapshot?: number
          hourly_rate_brl_snapshot?: number
          id?: string
          is_billable?: boolean
          member_id: string
          project_id: string
          stage_id?: string | null
          started_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          hourly_cost_brl_snapshot?: number
          hourly_rate_brl_snapshot?: number
          id?: string
          is_billable?: boolean
          member_id?: string
          project_id?: string
          stage_id?: string | null
          started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          amount_brl: number
          bank_ref: string | null
          category: Database["public"]["Enums"]["transaction_category"]
          client_id: string | null
          created_at: string
          created_by: string | null
          currency: Database["public"]["Enums"]["currency_code"]
          description: string
          due_at: string | null
          fx_rate_used: number | null
          id: string
          imported_from: string | null
          is_recurring: boolean
          kind: Database["public"]["Enums"]["transaction_kind"]
          metadata: Json
          occurred_at: string
          paid_at: string | null
          project_id: string | null
          reconciled: boolean
          reconciled_at: string | null
          recurring_period: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          amount_brl: number
          bank_ref?: string | null
          category: Database["public"]["Enums"]["transaction_category"]
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description: string
          due_at?: string | null
          fx_rate_used?: number | null
          id?: string
          imported_from?: string | null
          is_recurring?: boolean
          kind: Database["public"]["Enums"]["transaction_kind"]
          metadata?: Json
          occurred_at?: string
          paid_at?: string | null
          project_id?: string | null
          reconciled?: boolean
          reconciled_at?: string | null
          recurring_period?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_brl?: number
          bank_ref?: string | null
          category?: Database["public"]["Enums"]["transaction_category"]
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: Database["public"]["Enums"]["currency_code"]
          description?: string
          due_at?: string | null
          fx_rate_used?: number | null
          id?: string
          imported_from?: string | null
          is_recurring?: boolean
          kind?: Database["public"]["Enums"]["transaction_kind"]
          metadata?: Json
          occurred_at?: string
          paid_at?: string | null
          project_id?: string | null
          reconciled?: boolean
          reconciled_at?: string | null
          recurring_period?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_integration_favorites: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_mfa: {
        Row: {
          backup_codes: string[] | null
          created_at: string
          enabled_at: string | null
          last_used_at: string | null
          secret_encrypted: string
          updated_at: string
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string
          enabled_at?: string | null
          last_used_at?: string | null
          secret_encrypted: string
          updated_at?: string
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string
          enabled_at?: string | null
          last_used_at?: string | null
          secret_encrypted?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vercel_deploy_alerts: {
        Row: {
          deployment_uid: string
          id: string
          notified_at: string
          project_id: string
          state: string
        }
        Insert: {
          deployment_uid: string
          id?: string
          notified_at?: string
          project_id: string
          state: string
        }
        Update: {
          deployment_uid?: string
          id?: string
          notified_at?: string
          project_id?: string
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "vercel_deploy_alerts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempt: number
          delivered_at: string
          duration_ms: number | null
          error: string | null
          event: string
          id: string
          is_dead_letter: boolean | null
          next_retry_at: string | null
          payload: Json
          replay_of: string | null
          response_body: string | null
          response_status: number | null
          signature_verified: boolean | null
          webhook_id: string
        }
        Insert: {
          attempt?: number
          delivered_at?: string
          duration_ms?: number | null
          error?: string | null
          event: string
          id?: string
          is_dead_letter?: boolean | null
          next_retry_at?: string | null
          payload?: Json
          replay_of?: string | null
          response_body?: string | null
          response_status?: number | null
          signature_verified?: boolean | null
          webhook_id: string
        }
        Update: {
          attempt?: number
          delivered_at?: string
          duration_ms?: number | null
          error?: string | null
          event?: string
          id?: string
          is_dead_letter?: boolean | null
          next_retry_at?: string | null
          payload?: Json
          replay_of?: string | null
          response_body?: string | null
          response_status?: number | null
          signature_verified?: boolean | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_dlq: {
        Row: {
          attempts: number | null
          delivery_id: string | null
          event: string | null
          id: string
          last_error: string | null
          moved_at: string
          payload: Json | null
          replayed_at: string | null
          webhook_id: string | null
        }
        Insert: {
          attempts?: number | null
          delivery_id?: string | null
          event?: string | null
          id?: string
          last_error?: string | null
          moved_at?: string
          payload?: Json | null
          replayed_at?: string | null
          webhook_id?: string | null
        }
        Update: {
          attempts?: number | null
          delivery_id?: string | null
          event?: string | null
          id?: string
          last_error?: string | null
          moved_at?: string
          payload?: Json | null
          replayed_at?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_dlq_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "webhook_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_dlq_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          dead_letter_after: number | null
          delivery_count: number
          description: string | null
          events: string[]
          failure_count: number
          headers: Json
          id: string
          is_active: boolean
          last_delivery_at: string | null
          name: string
          retry_policy: Json | null
          secret: string
          success_count: number
          updated_at: string
          url: string
          verify_signature: boolean | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          dead_letter_after?: number | null
          delivery_count?: number
          description?: string | null
          events?: string[]
          failure_count?: number
          headers?: Json
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          name: string
          retry_policy?: Json | null
          secret?: string
          success_count?: number
          updated_at?: string
          url: string
          verify_signature?: boolean | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          dead_letter_after?: number | null
          delivery_count?: number
          description?: string | null
          events?: string[]
          failure_count?: number
          headers?: Json
          id?: string
          is_active?: boolean
          last_delivery_at?: string | null
          name?: string
          retry_policy?: Json | null
          secret?: string
          success_count?: number
          updated_at?: string
          url?: string
          verify_signature?: boolean | null
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          body: string | null
          created_at: string
          direction: string
          error: string | null
          id: string
          media_type: string | null
          media_url: string | null
          sent_by: string | null
          status: string
          thread_id: string
          wa_message_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          direction: string
          error?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          sent_by?: string | null
          status?: string
          thread_id: string
          wa_message_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          direction?: string
          error?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          sent_by?: string | null
          status?: string
          thread_id?: string
          wa_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_threads: {
        Row: {
          assigned_to: string | null
          contact_id: string | null
          contact_name: string | null
          contact_phone: string
          created_at: string
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          status: string
          unread_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          contact_id?: string | null
          contact_name?: string | null
          contact_phone: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          contact_id?: string | null
          contact_name?: string | null
          contact_phone?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          status?: string
          unread_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_threads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_list_mfa_status: {
        Args: never
        Returns: {
          enabled_at: string
          has_backup_codes: boolean
          last_used_at: string
          user_id: string
        }[]
      }
      admin_list_users: {
        Args: never
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          full_name: string
          last_sign_in_at: string
          roles: string[]
          user_id: string
        }[]
      }
      admin_remove_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      admin_revoke_session: {
        Args: { _session_id: string }
        Returns: undefined
      }
      admin_set_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
      contact_id_by_email: { Args: { _email: string }; Returns: string }
      emit_event: {
        Args: {
          _correlation_id?: string
          _payload?: Json
          _severity?: string
          _source?: string
          _type: string
        }
        Returns: string
      }
      fn_ai_usage_check_quota: {
        Args: { _user_id: string }
        Returns: {
          allowed: boolean
          limit: number
          used: number
        }[]
      }
      fn_audit_cleanup: { Args: never; Returns: undefined }
      fn_audit_export: {
        Args: { _days?: number; _table?: string }
        Returns: {
          action: string
          actor_email: string | null
          actor_id: string | null
          diff: Json
          id: string
          occurred_at: string
          record_id: string | null
          summary: string | null
          table_name: string
        }[]
        SetofOptions: {
          from: "*"
          to: "audit_log"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fn_cashflow_forecast: {
        Args: { _days?: number }
        Returns: {
          day_label: string
          net: number
          projected_expense: number
          projected_income: number
          running_balance: number
        }[]
      }
      fn_client_finance_summary: {
        Args: never
        Returns: {
          client_id: string
          client_name: string
          expense_brl: number
          income_brl: number
          last_tx_at: string
          margin_percent: number
          net_margin_brl: number
          paid_brl: number
          pending_brl: number
          projects_count: number
        }[]
      }
      fn_cron_status: {
        Args: never
        Returns: {
          active: boolean
          command: string
          jobid: number
          jobname: string
          last_duration_ms: number
          last_run: string
          last_status: string
          schedule: string
        }[]
      }
      fn_emit_notification: {
        Args: {
          _body: string
          _payload?: Json
          _severity?: string
          _title: string
          _type: string
          _url: string
        }
        Returns: undefined
      }
      fn_pipeline_forecast: {
        Args: never
        Returns: {
          pipeline_stage: string
          project_count: number
          raw_revenue: number
          weighted_revenue: number
        }[]
      }
      fn_pipeline_forecast_v2: {
        Args: never
        Returns: {
          month_label: string
          project_count: number
          raw_revenue: number
          weighted_revenue: number
        }[]
      }
      fn_project_margin: {
        Args: { _project_id: string }
        Returns: {
          budget_brl: number
          expense_brl: number
          hours_cost_brl: number
          hours_estimated: number
          hours_worked: number
          income_brl: number
          margin_percent: number
          net_margin_brl: number
        }[]
      }
      fn_service_slo: {
        Args: { _days?: number; _service: string }
        Returns: {
          avg_latency_ms: number
          incidents: number
          total_checks: number
          up_checks: number
          uptime_percent: number
        }[]
      }
      fn_stale_leads: {
        Args: { _days?: number }
        Returns: {
          client_name: string
          days_idle: number
          id: string
          kind: string
          pipeline_stage: string
          title: string
          url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      search_global: {
        Args: { _limit?: number; _q: string }
        Returns: {
          entity: string
          id: string
          rank: number
          subtitle: string
          title: string
          url: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_session_geo: {
        Args: {
          _city: string
          _country: string
          _is_suspicious: boolean
          _isp: string
          _lat: number
          _lng: number
          _region: string
          _session_id: string
        }
        Returns: undefined
      }
      upsert_admin_session: {
        Args: {
          _browser: string
          _device: string
          _ip?: string
          _os: string
          _user_agent: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "manager"
        | "editor"
        | "viewer"
      attachment_type: "logo" | "file" | "idea" | "document" | "contract"
      blog_status: "draft" | "published" | "archived"
      client_status: "lead" | "qualified" | "active" | "finished" | "lost"
      contact_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "closed"
        | "lost"
      contract_status: "pending" | "sent" | "approved" | "rejected"
      currency_code: "BRL" | "USD" | "EUR"
      document_type:
        | "briefing"
        | "competitor_analysis"
        | "kpis"
        | "user_journey"
        | "scope_macro"
        | "roadmap"
        | "technical_scope"
        | "timeline"
        | "investment"
        | "wireframes"
        | "prototype"
        | "design_system"
        | "setup"
        | "sprints"
        | "qa"
        | "deploy"
        | "monitoring"
        | "training"
        | "evolution_plan"
        | "custom"
      featured_level: "none" | "secondary" | "primary"
      interaction_type:
        | "meeting"
        | "proposal"
        | "message"
        | "call"
        | "note"
        | "email"
        | "file"
      project_pipeline_stage:
        | "lead"
        | "discovery"
        | "proposal"
        | "execution"
        | "launch"
        | "done"
        | "diagnostico"
        | "contrato"
        | "entrega"
        | "proposta"
        | "execucao"
      project_status: "draft" | "published" | "archived"
      stage_status: "pending" | "in_progress" | "completed" | "blocked"
      transaction_category:
        | "contract"
        | "maintenance"
        | "consulting"
        | "recurring"
        | "other_income"
        | "tool"
        | "infra"
        | "freelancer"
        | "tax"
        | "marketing"
        | "salary"
        | "other_expense"
      transaction_kind: "income" | "expense"
      transaction_status: "pending" | "paid" | "overdue" | "cancelled"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "manager",
        "editor",
        "viewer",
      ],
      attachment_type: ["logo", "file", "idea", "document", "contract"],
      blog_status: ["draft", "published", "archived"],
      client_status: ["lead", "qualified", "active", "finished", "lost"],
      contact_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "closed",
        "lost",
      ],
      contract_status: ["pending", "sent", "approved", "rejected"],
      currency_code: ["BRL", "USD", "EUR"],
      document_type: [
        "briefing",
        "competitor_analysis",
        "kpis",
        "user_journey",
        "scope_macro",
        "roadmap",
        "technical_scope",
        "timeline",
        "investment",
        "wireframes",
        "prototype",
        "design_system",
        "setup",
        "sprints",
        "qa",
        "deploy",
        "monitoring",
        "training",
        "evolution_plan",
        "custom",
      ],
      featured_level: ["none", "secondary", "primary"],
      interaction_type: [
        "meeting",
        "proposal",
        "message",
        "call",
        "note",
        "email",
        "file",
      ],
      project_pipeline_stage: [
        "lead",
        "discovery",
        "proposal",
        "execution",
        "launch",
        "done",
        "diagnostico",
        "contrato",
        "entrega",
        "proposta",
        "execucao",
      ],
      project_status: ["draft", "published", "archived"],
      stage_status: ["pending", "in_progress", "completed", "blocked"],
      transaction_category: [
        "contract",
        "maintenance",
        "consulting",
        "recurring",
        "other_income",
        "tool",
        "infra",
        "freelancer",
        "tax",
        "marketing",
        "salary",
        "other_expense",
      ],
      transaction_kind: ["income", "expense"],
      transaction_status: ["pending", "paid", "overdue", "cancelled"],
    },
  },
} as const
