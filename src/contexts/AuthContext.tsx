import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'legal_entity';
  legal_entity_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('👤 AuthContext: fetchProfile called for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('👤 AuthContext: Profile query result:', { data, error });
      if (error) throw error;
      console.log('👤 AuthContext: Setting profile:', data);
      setProfile(data as Profile);
    } catch (error) {
      console.error('❌ AuthContext: Error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth listeners...');
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 getSession result:', !!session, 'User:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔐 getSession: User found, fetching profile...');
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Then set up auth state listener for future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Skip INITIAL_SESSION event since we already handled it above
        if (event === 'INITIAL_SESSION') return;
        
        console.log('🔐 AuthStateChange event:', event, 'Session:', !!session, 'User:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('🔐 AuthStateChange: User found, fetching profile...');
          fetchProfile(session.user.id);
        } else {
          console.log('🔐 AuthStateChange: No user, clearing profile');
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}