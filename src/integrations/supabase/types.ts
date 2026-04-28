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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
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
      contacts: {
        Row: {
          assigned_to: string | null
          budget: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          service_type: string | null
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
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          service_type?: string | null
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
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          service_type?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
          updated_at?: string
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
          featured_level: Database["public"]["Enums"]["featured_level"]
          gallery: Json
          github_url: string | null
          id: string
          is_featured: boolean
          is_published_on_site: boolean
          live_url: string | null
          long_description: string | null
          pipeline_stage: Database["public"]["Enums"]["project_pipeline_stage"]
          published_at: string | null
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
          views_count: number
        }
        Insert: {
          case_study_url?: string | null
          category?: string | null
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
          featured_level?: Database["public"]["Enums"]["featured_level"]
          gallery?: Json
          github_url?: string | null
          id?: string
          is_featured?: boolean
          is_published_on_site?: boolean
          live_url?: string | null
          long_description?: string | null
          pipeline_stage?: Database["public"]["Enums"]["project_pipeline_stage"]
          published_at?: string | null
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
          views_count?: number
        }
        Update: {
          case_study_url?: string | null
          category?: string | null
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
          featured_level?: Database["public"]["Enums"]["featured_level"]
          gallery?: Json
          github_url?: string | null
          id?: string
          is_featured?: boolean
          is_published_on_site?: boolean
          live_url?: string | null
          long_description?: string | null
          pipeline_stage?: Database["public"]["Enums"]["project_pipeline_stage"]
          published_at?: string | null
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
          slug?: string
          subtitle?: string | null
          technologies?: Json
          title?: string
          updated_at?: string
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
      tech_registry: {
        Row: {
          category: string | null
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
          category?: string | null
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
          category?: string | null
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      project_status: "draft" | "published" | "archived"
      stage_status: "pending" | "in_progress" | "completed" | "blocked"
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
      app_role: ["admin", "moderator", "user"],
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
      ],
      project_status: ["draft", "published", "archived"],
      stage_status: ["pending", "in_progress", "completed", "blocked"],
    },
  },
} as const
