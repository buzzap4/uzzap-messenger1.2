import { supabase } from '../lib/supabaseClient';

export interface CreateProfileParams {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

export const createProfile = async (params: CreateProfileParams) => {
  try {
    // Validate required fields
    if (!params.id || !params.username) {
      throw new Error('id and username are required');
    }

    // Validate username length and format
    if (params.username.length < 3 || params.username.length > 30) {
      throw new Error('Username must be between 3 and 30 characters');
    }
    if (!/^[a-zA-Z0-9_]+$/.test(params.username)) {
      throw new Error('Username can only contain letters, numbers and underscores');
    }

    // Create new profile with additional validation
    const profileData = {
      id: params.id,
      username: params.username,
      display_name: params.display_name || params.username,
      avatar_url: params.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${params.username}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: 'user'
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Username already taken');
      }
      throw error;
    }

    if (!data) {
      throw new Error('Failed to create profile');
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
