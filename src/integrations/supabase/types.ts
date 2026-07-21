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
  public: {
    Tables: {
      admin_notes: {
        Row: {
          created_at: string
          created_by_admin_id: string | null
          follow_up_date: string | null
          follow_up_needed: boolean | null
          id: string
          note: string
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          created_at?: string
          created_by_admin_id?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          note: string
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          created_at?: string
          created_by_admin_id?: string | null
          follow_up_date?: string | null
          follow_up_needed?: boolean | null
          id?: string
          note?: string
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string
          id: string
          new_value: Json | null
          old_value: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      communication_preferences: {
        Row: {
          created_at: string
          do_not_contact: boolean | null
          donation_reminders: boolean | null
          event_reminders: boolean | null
          general_announcements: boolean | null
          id: string
          newsletter_frequency: string | null
          preferred_language: string | null
          updated_at: string
          user_id: string
          volunteer_requests: boolean | null
          whatsapp_group_interest: boolean | null
        }
        Insert: {
          created_at?: string
          do_not_contact?: boolean | null
          donation_reminders?: boolean | null
          event_reminders?: boolean | null
          general_announcements?: boolean | null
          id?: string
          newsletter_frequency?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id: string
          volunteer_requests?: boolean | null
          whatsapp_group_interest?: boolean | null
        }
        Update: {
          created_at?: string
          do_not_contact?: boolean | null
          donation_reminders?: boolean | null
          event_reminders?: boolean | null
          general_announcements?: boolean | null
          id?: string
          newsletter_frequency?: string | null
          preferred_language?: string | null
          updated_at?: string
          user_id?: string
          volunteer_requests?: boolean | null
          whatsapp_group_interest?: boolean | null
        }
        Relationships: []
      }
      consents: {
        Row: {
          consent_ip_address: string | null
          consent_source: string | null
          created_at: string
          data_accuracy_confirmation: boolean | null
          email_consent: boolean | null
          id: string
          parent_guardian_consent: boolean | null
          photo_video_consent: boolean | null
          privacy_accepted_at: string | null
          sms_consent: boolean | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_ip_address?: string | null
          consent_source?: string | null
          created_at?: string
          data_accuracy_confirmation?: boolean | null
          email_consent?: boolean | null
          id?: string
          parent_guardian_consent?: boolean | null
          photo_video_consent?: boolean | null
          privacy_accepted_at?: string | null
          sms_consent?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_ip_address?: string | null
          consent_source?: string | null
          created_at?: string
          data_accuracy_confirmation?: boolean | null
          email_consent?: boolean | null
          id?: string
          parent_guardian_consent?: boolean | null
          photo_video_consent?: boolean | null
          privacy_accepted_at?: string | null
          sms_consent?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_pages: {
        Row: {
          blocks: Json
          created_at: string
          created_by: string | null
          id: string
          parent_slug: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          parent_slug?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          parent_slug?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      donation_preferences: {
        Row: {
          created_at: string
          donation_receipt_email: string | null
          donor_category: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          donation_receipt_email?: string | null
          donor_category?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          donation_receipt_email?: string | null
          donor_category?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_preferences: {
        Row: {
          availability: string[] | null
          created_at: string
          id: string
          interested_event_types: string[] | null
          updated_at: string
          user_id: string
          volunteer_areas: string[] | null
          willing_to_volunteer: boolean | null
        }
        Insert: {
          availability?: string[] | null
          created_at?: string
          id?: string
          interested_event_types?: string[] | null
          updated_at?: string
          user_id: string
          volunteer_areas?: string[] | null
          willing_to_volunteer?: boolean | null
        }
        Update: {
          availability?: string[] | null
          created_at?: string
          id?: string
          interested_event_types?: string[] | null
          updated_at?: string
          user_id?: string
          volunteer_areas?: string[] | null
          willing_to_volunteer?: boolean | null
        }
        Relationships: []
      }
      household_members: {
        Row: {
          created_at: string
          household_id: string
          id: string
          is_primary_contact: boolean | null
          relationship_to_household: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          is_primary_contact?: boolean | null
          relationship_to_household?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          is_primary_contact?: boolean | null
          relationship_to_household?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          household_name: string | null
          id: string
          primary_contact_user_id: string | null
          state: string | null
          street_address: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          household_name?: string | null
          id?: string
          primary_contact_user_id?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          household_name?: string | null
          id?: string
          primary_contact_user_id?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      member_profiles: {
        Row: {
          age_group: string | null
          city: string | null
          country: string | null
          created_at: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          first_name: string | null
          gender: string | null
          how_heard_about_us: string | null
          id: string
          interested_in_gyanshala: boolean | null
          join_date: string | null
          last_name: string | null
          member_type: string | null
          membership_status: string | null
          organization_role: string | null
          preferred_contact_method: string | null
          preferred_name: string | null
          primary_email: string | null
          primary_phone: string | null
          profile_picture_url: string | null
          referred_by: string | null
          school_name: string | null
          secondary_email: string | null
          secondary_phone: string | null
          state: string | null
          street_address: string | null
          updated_at: string
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          age_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          gender?: string | null
          how_heard_about_us?: string | null
          id?: string
          interested_in_gyanshala?: boolean | null
          join_date?: string | null
          last_name?: string | null
          member_type?: string | null
          membership_status?: string | null
          organization_role?: string | null
          preferred_contact_method?: string | null
          preferred_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          profile_picture_url?: string | null
          referred_by?: string | null
          school_name?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          age_group?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          first_name?: string | null
          gender?: string | null
          how_heard_about_us?: string | null
          id?: string
          interested_in_gyanshala?: boolean | null
          join_date?: string | null
          last_name?: string | null
          member_type?: string | null
          membership_status?: string | null
          organization_role?: string | null
          preferred_contact_method?: string | null
          preferred_name?: string | null
          primary_email?: string | null
          primary_phone?: string | null
          profile_picture_url?: string | null
          referred_by?: string | null
          school_name?: string | null
          secondary_email?: string | null
          secondary_phone?: string | null
          state?: string | null
          street_address?: string | null
          updated_at?: string
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          created_at: string
          event_id: string
          event_title: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_title: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_title?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          allergies_medical_notes: string | null
          authorized_pickup_people: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          field_trip_permission: boolean | null
          first_name: string | null
          household_id: string | null
          id: string
          last_name: string | null
          parent_notes: string | null
          parent_user_id: string
          photo_video_permission: boolean | null
          religious_class_grade: string | null
          school_grade: string | null
          updated_at: string
        }
        Insert: {
          allergies_medical_notes?: string | null
          authorized_pickup_people?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          field_trip_permission?: boolean | null
          first_name?: string | null
          household_id?: string | null
          id?: string
          last_name?: string | null
          parent_notes?: string | null
          parent_user_id: string
          photo_video_permission?: boolean | null
          religious_class_grade?: string | null
          school_grade?: string | null
          updated_at?: string
        }
        Update: {
          allergies_medical_notes?: string | null
          authorized_pickup_people?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          field_trip_permission?: boolean | null
          first_name?: string | null
          household_id?: string | null
          id?: string
          last_name?: string | null
          parent_notes?: string | null
          parent_user_id?: string
          photo_video_permission?: boolean | null
          religious_class_grade?: string | null
          school_grade?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "member"
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
      app_role: ["admin", "member"],
    },
  },
} as const
