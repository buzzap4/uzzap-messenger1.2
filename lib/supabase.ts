import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { storage } from './storage';
import { Database } from '@/src/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Set to false as this app does not rely on URL-based session detection.
    // Ensure this aligns with your app's authentication flow. If OAuth or URL-based session detection is required,
    // consider setting this to true.
  },
});

// Add rate limiting
const messageRateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES = 30; // 30 messages per minute

export const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userMessages = messageRateLimit.get(userId) || 0;
  
  if (userMessages >= MAX_MESSAGES) {
    return false;
  }
  
  messageRateLimit.set(userId, userMessages + 1);
  setTimeout(() => messageRateLimit.set(userId, 0), RATE_LIMIT_WINDOW);
  
  return true;
};

// Add database error codes
export const DB_ERRORS = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502'
} as const;

export const handleDatabaseError = (error: any) => {
  if (!error) return null;
  
  switch (error.code) {
    case DB_ERRORS.FOREIGN_KEY_VIOLATION:
      return 'Referenced record does not exist';
    case DB_ERRORS.UNIQUE_VIOLATION:
      return 'Record already exists';
    case DB_ERRORS.CHECK_VIOLATION:
      return 'Value violates check constraint';
    case DB_ERRORS.NOT_NULL_VIOLATION:
      return 'Required field is missing';
    default:
      return error.message || 'An unexpected database error occurred';
  }
};

// Add better error handling
export const handleSupabaseError = (error: any): string => {
  if (error?.code === '23505') return 'Duplicate entry';
  if (error?.code === 'PGRST301') return 'Authentication required';
  if (error?.code === '23503') return 'Referenced record not found';
  return 'An unexpected error occurred';
};

export const joinChatroom = async (chatroomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chatroom_memberships')
      .insert({ chatroom_id: chatroomId, user_id: userId });

    if (error) throw error;
    console.log(`User ${userId} joined chatroom ${chatroomId}`);
  } catch (error) {
    console.error('Error joining chatroom:', error);
    throw error;
  }
};

export const leaveChatroom = async (chatroomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chatroom_memberships') // Correct table name
      .delete()
      .eq('chatroom_id', chatroomId)
      .eq('user_id', userId);

    if (error) throw error;
    console.log(`User ${userId} left chatroom ${chatroomId}`);
  } catch (error) {
    console.error('Error leaving chatroom:', error);
    throw error;
  }
};

export const fetchUserRole = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, return default role
        return 'user';
      }
      throw error;
    }

    return data?.role || 'user';
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user'; // Default to 'user' role on error
  }
};