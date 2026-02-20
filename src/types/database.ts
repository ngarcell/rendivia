export interface Database {
  public: {
    Tables: {
      caption_jobs: {
        Row: {
          id: string;
          user_id: string;
          video_url: string;
          output_url: string | null;
          status: "pending" | "transcribing" | "rendering" | "completed" | "failed";
          segments: unknown;
          options: unknown;
          plan_id: string | null;
          team_id: string | null;
          edits: unknown | null;
          aspect_ratio: "9:16" | "1:1" | "16:9" | null;
          render_id: string | null;
          render_status: "queued" | "rendering" | "completed" | "failed" | null;
          render_error: string | null;
          rendered_at: string | null;
          suggested_cuts: unknown | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_url: string;
          output_url?: string | null;
          status?: "pending" | "transcribing" | "rendering" | "completed" | "failed";
          segments?: unknown;
          options?: unknown;
          plan_id?: string | null;
          team_id?: string | null;
          edits?: unknown | null;
          aspect_ratio?: "9:16" | "1:1" | "16:9" | null;
          render_id?: string | null;
          render_status?: "queued" | "rendering" | "completed" | "failed" | null;
          render_error?: string | null;
          rendered_at?: string | null;
          suggested_cuts?: unknown | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["caption_jobs"]["Insert"]>;
      };
      brand_presets: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          name: string;
          style_json: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          team_id?: string | null;
          name: string;
          style_json?: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brand_presets"]["Insert"]>;
      };
      api_keys: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          key_prefix: string;
          key_hash: string;
          name: string | null;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          team_id?: string | null;
          key_prefix: string;
          key_hash: string;
          name?: string | null;
          last_used_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["api_keys"]["Insert"]>;
      };
      usage: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          period_start: string;
          period_end: string;
          videos_count: number;
          renders_count: number;
          api_calls_count: number;
          render_seconds: number;
          render_pixels: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          team_id?: string | null;
          period_start: string;
          period_end: string;
          videos_count?: number;
          renders_count?: number;
          api_calls_count?: number;
          render_seconds?: number;
          render_pixels?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["usage"]["Insert"]>;
      };
      render_jobs: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          template_id: string;
          template_version: string;
          input_data: unknown;
          input_props: unknown;
          brand_id: string | null;
          status: "queued" | "rendering" | "completed" | "failed";
          output_url: string | null;
          render_id: string | null;
          render_error: string | null;
          webhook_url: string | null;
          webhook_secret: string | null;
          webhook_status: string | null;
          webhook_error: string | null;
          duration_seconds: number | null;
          resolution: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id?: string | null;
          template_id: string;
          template_version: string;
          input_data?: unknown;
          input_props?: unknown;
          brand_id?: string | null;
          status?: "queued" | "rendering" | "completed" | "failed";
          output_url?: string | null;
          render_id?: string | null;
          render_error?: string | null;
          webhook_url?: string | null;
          webhook_secret?: string | null;
          webhook_status?: string | null;
          webhook_error?: string | null;
          duration_seconds?: number | null;
          resolution?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["render_jobs"]["Insert"]>;
      };
      brand_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          name: string;
          logo_url: string | null;
          colors: unknown;
          font_family: string | null;
          intro_text: string | null;
          outro_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          team_id?: string | null;
          name: string;
          logo_url?: string | null;
          colors?: unknown;
          font_family?: string | null;
          intro_text?: string | null;
          outro_text?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["brand_profiles"]["Insert"]>;
      };
      early_access_requests: {
        Row: {
          id: string;
          name: string | null;
          email: string;
          company: string | null;
          role: string | null;
          company_size: string | null;
          use_case: string | null;
          data_source: string | null;
          timeline: string | null;
          monthly_renders: number | null;
          cohort: string | null;
          source: string | null;
          landing_path: string | null;
          cluster: string | null;
          intent_slug: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          utm_term: string | null;
          utm_content: string | null;
          gclid: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email: string;
          company?: string | null;
          role?: string | null;
          company_size?: string | null;
          use_case?: string | null;
          data_source?: string | null;
          timeline?: string | null;
          monthly_renders?: number | null;
          cohort?: string | null;
          source?: string | null;
          landing_path?: string | null;
          cluster?: string | null;
          intent_slug?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          utm_term?: string | null;
          utm_content?: string | null;
          gclid?: string | null;
          referrer?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["early_access_requests"]["Insert"]>;
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          team_id: string | null;
          plan_id: string;
          status: string;
          current_period_start: string;
          current_period_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          team_id?: string | null;
          plan_id: string;
          status?: string;
          current_period_start: string;
          current_period_end: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
      };
    };
  };
}
