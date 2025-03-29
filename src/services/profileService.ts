import { supabase, handleDatabaseError, type Tables, type DatabaseResponse } from '../../lib/supabase';
import { PostgrestError } from '@supabase/supabase-js';

type Profile = Tables['profiles']['Row'];
type ProfileInsert = Tables['profiles']['Insert'];

interface ProfileResponse {
  data: Profile | null;
  error: Error | null;
}

export const createProfile = async (profileData: ProfileInsert): Promise<ProfileResponse> => {
  try {
    const { data: authData } = await supabase.auth.getSession();
    
    if (!authData?.session?.user || authData.session.user.id !== profileData.id) {
      throw new Error('Unauthorized: Can only create profile for authenticated user');
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        ...profileData,
        role: profileData.role || 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      const errorMessage = handleDatabaseError(error);
      throw new Error(errorMessage);
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
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'role'>>
): Promise<DatabaseResponse<Profile>> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      const errorMessage = handleDatabaseError(error);
      throw new Error(errorMessage);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { 
      data: null, 
      error: new Error(error instanceof PostgrestError ? handleDatabaseError(error) : 'Unknown error occurred')
    };
  }
};
