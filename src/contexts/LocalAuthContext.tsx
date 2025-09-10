import { createContext, useContext, useEffect, useState } from "react";
import { localAuth, type LocalUser, type LocalSession, type LocalProfile } from "@/lib/localAuth";

interface LocalAuthContextType {
  user: LocalUser | null;
  session: LocalSession | null;
  profile: LocalProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const LocalAuthContext = createContext<LocalAuthContextType | undefined>(undefined);

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    console.log('👤 LocalAuthContext: fetchProfile called for userId:', userId);
    try {
      const profileData = await localAuth.getProfile(userId);
      console.log('👤 LocalAuthContext: Profile query result:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('❌ LocalAuthContext: Error fetching profile:', error);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const signOut = async () => {
    await localAuth.signOutWithNotification();
  };

  useEffect(() => {
    console.log('🔐 LocalAuthProvider: Setting up auth listeners...');
    
    // Initialize default users
    localAuth.initializeDefaultUsers();
    
    // Check for existing session first
    localAuth.getSession().then((session) => {
      console.log('🔐 getSession result:', !!session, 'User:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('🔐 getSession: User found, fetching profile...');
        fetchProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Set up auth state listener for future changes
    const { unsubscribe } = localAuth.onAuthStateChange(
      (event, session) => {
        // Skip INITIAL_SESSION event since we already handled it above
        if (event === 'INITIAL_SESSION') return;
        
        console.log('🔐 LocalAuthStateChange event:', event, 'Session:', !!session, 'User:', session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('🔐 LocalAuthStateChange: User found, fetching profile...');
          fetchProfile(session.user.id);
        } else {
          console.log('🔐 LocalAuthStateChange: No user, clearing profile');
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  );
}

export function useLocalAuth() {
  const context = useContext(LocalAuthContext);
  if (context === undefined) {
    throw new Error('useLocalAuth must be used within a LocalAuthProvider');
  }
  return context;
}