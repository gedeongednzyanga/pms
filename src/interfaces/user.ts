export interface Utilisateur {
  id: number;
  first_name: string | null;
  last_name: string | null;
  user_name: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}