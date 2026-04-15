export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      custom_events: {
        Row: {
          content: string | null;
          created_at: string | null;
          created_by: string | null; // references profiles.id
          event_date: string;
          id: string;
          location: string | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null; // references profiles.id
          event_date: string;
          id?: string;
          location?: string | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          created_by?: string | null; // references profiles.id
          event_date?: string;
          id?: string;
          location?: string | null;
          name?: string;
          updated_at?: string | null;
        };
      };
      person_details_private: {
        Row: {
          created_at: string | null;
          current_residence: string | null;
          occupation: string | null;
          person_id: string; // references persons.id
          phone_number: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          current_residence?: string | null;
          occupation?: string | null;
          person_id: string; // references persons.id
          phone_number?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          current_residence?: string | null;
          occupation?: string | null;
          person_id?: string; // references persons.id
          phone_number?: string | null;
          updated_at?: string | null;
        };
      };
      persons: {
        Row: {
          avatar_url: string | null;
          birth_day: number | null;
          birth_month: number | null;
          birth_order: number | null;
          birth_year: number | null;
          created_at: string | null;
          death_day: number | null;
          death_lunar_day: number | null;
          death_lunar_month: number | null;
          death_lunar_year: number | null;
          death_month: number | null;
          death_year: number | null;
          full_name: string;
          gender: Database["public"]["Enums"]["gender_enum"];
          generation: number | null;
          id: string;
          is_deceased: boolean;
          is_in_law: boolean;
          note: string | null;
          other_names: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          birth_day?: number | null;
          birth_month?: number | null;
          birth_order?: number | null;
          birth_year?: number | null;
          created_at?: string | null;
          death_day?: number | null;
          death_lunar_day?: number | null;
          death_lunar_month?: number | null;
          death_lunar_year?: number | null;
          death_month?: number | null;
          death_year?: number | null;
          full_name: string;
          gender: Database["public"]["Enums"]["gender_enum"];
          generation?: number | null;
          id?: string;
          is_deceased?: boolean;
          is_in_law?: boolean;
          note?: string | null;
          other_names?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          birth_day?: number | null;
          birth_month?: number | null;
          birth_order?: number | null;
          birth_year?: number | null;
          created_at?: string | null;
          death_day?: number | null;
          death_lunar_day?: number | null;
          death_lunar_month?: number | null;
          death_lunar_year?: number | null;
          death_month?: number | null;
          death_year?: number | null;
          full_name?: string;
          gender?: Database["public"]["Enums"]["gender_enum"];
          generation?: number | null;
          id?: string;
          is_deceased?: boolean;
          is_in_law?: boolean;
          note?: string | null;
          other_names?: string | null;
          updated_at?: string | null;
        };
      };
      profiles: {
        Row: {
          created_at: string | null;
          id: string; // references auth.users.id
          is_active: boolean;
          role: Database["public"]["Enums"]["user_role_enum"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string; // references auth.users.id
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role_enum"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string; // references auth.users.id
          is_active?: boolean;
          role?: Database["public"]["Enums"]["user_role_enum"];
          updated_at?: string | null;
        };
      };
      relationships: {
        Row: {
          created_at: string | null;
          id: string;
          note: string | null;
          person_a: string; // references persons.id
          person_b: string; // references persons.id
          type: Database["public"]["Enums"]["relationship_type_enum"];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          note?: string | null;
          person_a: string; // references persons.id
          person_b: string; // references persons.id
          type: Database["public"]["Enums"]["relationship_type_enum"];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          note?: string | null;
          person_a?: string; // references persons.id
          person_b?: string; // references persons.id
          type?: Database["public"]["Enums"]["relationship_type_enum"];
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_create_user: {
        Args: {
          new_active: boolean;
          new_email: string;
          new_password: string;
          new_role: string;
        };
        Returns: string;
      };
      delete_user: {
        Args: {
          target_user_id: string;
        };
        Returns: undefined;
      };
      get_admin_users: {
        Args: Record<PropertyKey, never>;
        Returns: {
          created_at: string;
          email: string;
          id: string;
          is_active: boolean;
          role: Database["public"]["Enums"]["user_role_enum"];
        }[];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_editor: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      set_user_active_status: {
        Args: {
          new_status: boolean;
          target_user_id: string;
        };
        Returns: undefined;
      };
      set_user_role: {
        Args: {
          new_role: string;
          target_user_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      gender_enum: "male" | "female" | "other";
      relationship_type_enum: "marriage" | "biological_child" | "adopted_child";
      user_role_enum: "admin" | "editor" | "member";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
