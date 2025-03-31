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
const RATE_LIMIT_WINDOW = 60000; // 1 minuteminute
const MAX_MESSAGES = 30; // 30 messages per minute
// Add proper rate limiting with database storage
export const checkRateLimit = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'message')
      .single();

    if (error) throw error;

    if (!data) {
      // Create new rate limit record
      await supabase.from('rate_limits').insert({
        user_id: userId,
        type: 'message',
        count: 1,
        reset_at: new Date(Date.now() + RATE_LIMIT_WINDOW)
      });
      return true;
    }

    if (new Date(data.reset_at) < new Date()) {
      // Reset expired rate limit
      await supabase.from('rate_limits').upsert({
        user_id: userId,
        type: 'message',
        count: 1,
        reset_at: new Date(Date.now() + RATE_LIMIT_WINDOW)
      });
      return true;
    }

    if (data.count >= MAX_MESSAGES) {
      return false;
    }

    // Increment count
    await supabase.from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('user_id', userId)
      .eq('type', 'message');

    return true;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }
};

// Error handling
export const DB_ERRORS = {
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',
  INVALID_PARAMETER: 'PGRST116',
  PERMISSION_DENIED: '42501',
  UNDEFINED_TABLE: '42P01'
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
    case DB_ERRORS.PERMISSION_DENIED:
      return 'Permission denied';
    case DB_ERRORS.UNDEFINED_TABLE:
      return 'Table does not exist';
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

// Session management
export const refreshSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session || error) {
      const { data: { session: newSession }, error: refreshError } = 
        await supabase.auth.refreshSession();
      
      if (refreshError) throw refreshError;
      return newSession;
    }
    return session;
  } catch (error) {
    console.error('Session refresh failed:', error);
    throw error;
  }
};