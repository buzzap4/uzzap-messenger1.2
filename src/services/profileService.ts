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

    // Get the authenticated user with proper error handling
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw new Error('Authentication error: ' + authError.message);
    if (!authData.session) throw new Error('No active session');

    // Check if profile already exists with better error handling
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing profile:', checkError);
      throw new Error('Failed to check existing profile: ' + checkError.message);
    }

    if (existingProfile) {
      return { data: existingProfile, error: null };
    }

    // Create new profile with additional validation
    const profileData = {
      id: params.id,
      username: params.username,
      display_name: params.display_name || params.username,
      avatar_url: params.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${params.username}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: 'user' // Add default role
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([profileData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating profile:', insertError);
      throw new Error('Failed to create profile: ' + insertError.message);
    }

    return { data: newProfile, error: null };
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
