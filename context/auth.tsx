import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, fetchUserRole } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  userRole: string | undefined; // Add a separate state for user role
  loading: boolean;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  userRole: undefined,
  loading: true,
  signOut: async () => {},
  completeOnboarding: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | undefined>(undefined); // Separate state for role
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        return;
      }

      if (session) {
        setSession(session);
        const role = await fetchUserRole(session.user.id);
        setUserRole(role || undefined); // Handle null by setting undefined
      }

      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setSession(session);
        const role = await fetchUserRole(session.user.id);
        setUserRole(role || undefined); // Handle null by setting undefined
      } else {
        setSession(null);
        setUserRole(undefined);
      }
      setLoading(false);

      if (!session) {
        router.replace('/sign-in');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const isAuthScreen = ['sign-in', 'sign-up'].includes(segments[segments.length - 1] || '');

    if (!session && !isAuthScreen) {
      router.replace('/sign-in');
    } else if (session && isAuthScreen) {
      router.replace('/');
    }
  }, [session, loading, segments, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const completeOnboarding = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', session?.user?.id);
      
      if (error) throw error;
      router.replace('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ session, userRole, loading, signOut, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);