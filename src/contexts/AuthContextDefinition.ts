import { createContext } from "react";
import { User, Session } from "@supabase/supabase-js";

// This interface defines the shape of the user profile data.
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  lmp_date?: string;
  due_date?: string;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

// This interface defines all the values and functions that the AuthContext will provide.
export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, lmpDate?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>, avatarFile?: File) => Promise<{ error: any }>;
  calculateDueDate: (lmpDate: string) => string;
}

// Create and export the React Context. Components will use this to consume the auth state.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
