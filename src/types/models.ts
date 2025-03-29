export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  display_name?: string;
  status_message?: string;
  created_at: string;
  updated_at: string;
  role: 'user' | 'admin' | 'moderator';
}

export interface Profile extends User {
  last_seen: string | null;
}

export interface DatabaseMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  chatroom_id: string;
  is_edited: boolean;
  is_deleted: boolean;
  user?: Profile;
}

export interface DirectDatabaseMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  read_at: string | null;
  sender: Profile;
  receiver: Profile;
}

export interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  chatroom_id: string;
  is_edited: boolean;
  is_deleted: boolean;
  bubble_color?: string;
  user?: User;
}

export interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  read_at: string | null;
  sender?: Profile;
  receiver?: Profile;
}

export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}
