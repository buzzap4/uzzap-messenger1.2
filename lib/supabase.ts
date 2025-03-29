import 'react-native-url-polyfill/auto';
import { createClient, PostgrestError } from '@supabase/supabase-js';
import type { Database } from '../src/types/database';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Rate limiting
const messageRateLimit = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_MESSAGES = 30; // 30 messages per minute

export const checkRateLimit = (userId: string): boolean => {
  const userMessages = messageRateLimit.get(userId) || 0;
  
  if (userMessages >= MAX_MESSAGES) {
    return false;
  }
  
  messageRateLimit.set(userId, userMessages + 1);
  setTimeout(() => messageRateLimit.set(userId, 0), RATE_LIMIT_WINDOW);
  
  return true;
};

// Error handling
export const DB_ERRORS = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',
  INVALID_PARAMETER: 'PGRST116'
} as const;

export const handleDatabaseError = (error: PostgrestError | null): string => {
  if (!error) return 'Unknown error occurred';
  
  switch (error.code) {
    case DB_ERRORS.FOREIGN_KEY_VIOLATION:
      return 'Referenced record does not exist';
    case DB_ERRORS.UNIQUE_VIOLATION:
      return 'Record already exists';
    case DB_ERRORS.CHECK_VIOLATION:
      return 'Value violates check constraint';
    case DB_ERRORS.NOT_NULL_VIOLATION:
      return 'Required field is missing';
    case DB_ERRORS.INVALID_PARAMETER:
      return 'Invalid parameters provided';
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

// Add type-safe database operations
export type Tables = Database['public']['Tables'];

// Add response types
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Chatroom functions
export const joinChatroom = async (chatroomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chatroom_memberships')
      .insert({
        chatroom_id: chatroomId,
        user_id: userId
      });

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

export const leaveChatroom = async (chatroomId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('chatroom_memberships')
      .delete()
      .eq('chatroom_id', chatroomId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    throw error;
  }
};

// User functions
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