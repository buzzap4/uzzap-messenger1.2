import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { avatarCache } from '@/lib/avatarCache';
import { Profile, ApiResponse } from '@/src/types/models';

export function useProfile() {
  const [state, setState] = useState<{
    profile: Profile | null;
    loading: boolean;
    error: string | null;
  }>({
    profile: null,
    loading: false,
    error: null
  });

  const fetchProfile = useCallback(async (userId: string): Promise<ApiResponse<Profile>> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) throw fetchError;

      const profile = data ? {
        ...data,
        avatar_url: data.avatar_url ?? avatarCache.getAvatarUrl(data.id, data.username)
      } : null;

      setState(prev => ({ ...prev, profile, loading: false }));
      return { data: profile, error: null };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to fetch profile';
      setState(prev => ({ ...prev, error, loading: false }));
      return { data: null, error: { code: 'FETCH_ERROR', message: error } };
    }
  }, []);

  return {
    ...state,
    fetchProfile
  };
}
