import { supabase } from '../lib/supabaseClient';

export const createUserProfile = async (userId: string, username: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          username,
          created_at: new Date().toISOString(),
        }
      ]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};
