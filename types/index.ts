export * from './Region';

// Type declarations
export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

export interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  conversation_id?: string;
  is_read?: boolean;
  read_at?: string | null;
  sender?: User;
  receiver?: User;
}

export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  display_name?: string;
  status_message?: string;
  created_at?: string;
  last_seen?: string;
}
