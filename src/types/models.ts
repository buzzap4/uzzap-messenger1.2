export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  display_name?: string;
  status_message?: string;
  created_at: string;
  updated_at: string;
  role: 'user' | 'admin';
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
  profiles: Profile[];
}

export interface Message extends Omit<DatabaseMessage, 'profiles'> {
  user?: Profile;
}

export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}
