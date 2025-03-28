import { supabase, handleDatabaseError } from '@/lib/supabase';
import type { Database } from '@/src/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export const createProfile = async (profileData: ProfileInsert) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        ...profileData,
        role: profileData.role || 'user', // Ensure role is set
      }])
      .select()
      .single();

    if (error) {
      const errorMessage = handleDatabaseError(error);
      throw new Error(errorMessage || 'Failed to create profile');
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error in createProfile:', error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred')
    };
  }
};

export const getProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return { data: null, error };
  }
};

export const updateProfile = async (
  userId: string,
  updates: {
    username?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    status_message?: string | null;
  }
) => {
  try {
    // Ensure only provided fields are updated
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};
