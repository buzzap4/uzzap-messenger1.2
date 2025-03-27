import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signOut: async () => {},
  completeOnboarding: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('Session check error:', error);
        return;
      }

      setSession(session);

      if (session) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          // Only redirect to onboarding if we're sure there's no profile
          if (!profile && !window.location.pathname.includes('/onboarding')) {
            router.replace('/onboarding');
          }
        } catch (error) {
          console.error('Profile check error:', error);
        }
      }

      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
      
      // Redirect based on auth state
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
      // Not logged in, redirect to sign in except for auth screens
      router.replace('/sign-in');
    } else if (session && isAuthScreen) {
      // Logged in but on auth screen, redirect to home
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
    // You could store additional onboarding state in the profiles table if needed
    router.replace('/');
  };

  if (loading) {
    // You can return a loading screen here
    return null;
  }

  return (
    <AuthContext.Provider value={{ session, loading, signOut, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);