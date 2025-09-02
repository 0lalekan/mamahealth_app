import { useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthContext, AuthContextType, Profile } from "@/contexts/AuthContextDefinition";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const calculateDueDate = (lmpDate: string): string => {
    const lmp = new Date(lmpDate);
    const dueDate = new Date(lmp.getTime() + (280 * 24 * 60 * 60 * 1000));
    return dueDate.toISOString().split('T')[0];
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const d: any = data;
        setProfile({
          id: d.id,
          email: d.email ?? "",
            full_name: d.full_name ?? "User",
            phone_number: d.phone_number ?? "",
            lmp_date: d.lmp_date ?? "",
            due_date: d.due_date ?? "",
            is_premium: d.is_premium ?? false,
            created_at: d.created_at ?? new Date().toISOString(),
            updated_at: d.updated_at ?? new Date().toISOString(),
            avatar_url: d.avatar_url ?? "",
        });
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null); // Clear profile on error
      toast({
        title: "Could not load profile",
        description: "There was an issue fetching your profile data. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      if (import.meta.env.DEV) console.time('[Auth] setup');
      setLoading(true);

      // Initial session check
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      const initialUser = initialSession?.user;
      setUser(initialUser ?? null);

      // Fire profile fetch without blocking overall loading (optimistic hydration)
      if (initialUser) {
        fetchProfile(initialUser.id).finally(() => {
          if (import.meta.env.DEV) console.timeEnd('[Auth] profile fetch (initial)');
        });
      }

      // End global loading early (user known, profile may still hydrate)
      setLoading(false);
      if (import.meta.env.DEV) console.timeEnd('[Auth] setup');

      // Auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (import.meta.env.DEV) console.time('[Auth] state change');
          setSession(session);
            const currentUser = session?.user;
            setUser(currentUser ?? null);

            if (currentUser) {
              // Avoid long spinner: don't set loading true unless we had no profile yet
              const shouldShowSpinner = !profile; 
              if (shouldShowSpinner) setLoading(true);
              fetchProfile(currentUser.id).finally(() => {
                if (shouldShowSpinner) setLoading(false);
                if (import.meta.env.DEV) console.timeEnd('[Auth] state change');
              });
            } else {
              setProfile(null);
              setLoading(false);
              if (import.meta.env.DEV) console.timeEnd('[Auth] state change');
            }
        }
      );

      return () => subscription.unsubscribe();
    };

    const cleanupPromise = setupAuth();
    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, []);

  const signUp = async (email: string, password: string, name: string, lmpDate?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name, // Pass full_name to be used by the trigger
            lmp_date: lmpDate,
            due_date: lmpDate ? calculateDueDate(lmpDate) : undefined
          }
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message
        });
        return { error };
      }

      if (data.user) {
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account."
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message
        });
        return { error };
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Sign out failed",
          description: error.message
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Password reset failed",
          description: error.message
        });
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message
      });
      return { error };
    }
  };

  const updateProfile = async (updates: Partial<Profile>, avatarFile?: File) => {
    if (!user) return { error: new Error("No user found") };

    try {
      let avatarUrl = updates.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        avatarUrl = data.publicUrl;
      }

      const profileUpdates = {
        ...updates,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      // Remove avatar_url from updates if it's undefined and there's no new file
      if (!avatarFile && profileUpdates.avatar_url === undefined) {
        delete profileUpdates.avatar_url;
      }

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh profile data
      await fetchProfile(user.id);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Profile update failed",
        description: error.message
      });
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    calculateDueDate,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

