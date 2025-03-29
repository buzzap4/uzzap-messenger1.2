import { createProfile } from '../services/profileService';

export const createUserProfile = async (userId: string, username: string) => {
  try {
    const { error } = await createProfile({
      id: userId,
      username,
      display_name: null,
      avatar_url: null,
      status_message: null,
      role: 'user'
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
};
