/**
 * Tipos do banco.
 *
 * Espelham exatamente supabase/migrations/20260928120000_auth_profiles.sql.
 * Quando o projeto Supabase estiver criado, regere com:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type UserRole = 'aluno' | 'admin';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          preferred_unit: number | null;
          goal: string | null;
          role: UserRole;
          marketing_opt_in: boolean;
          terms_accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          preferred_unit?: number | null;
          goal?: string | null;
          role?: UserRole;
          marketing_opt_in?: boolean;
          terms_accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        /** O aluno só pode gravar estas colunas (as demais são revogadas no banco). */
        Update: {
          full_name?: string;
          phone?: string | null;
          preferred_unit?: number | null;
          goal?: string | null;
          marketing_opt_in?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
