export interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  display_name?: string;
  status_message?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile extends User {
  last_seen: string | null;
  cover_image?: string | null;
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
  chatroom_id: string;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
  bubble_color?: string;
  user?: User;
}

export interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  bubble_color?: string;
  is_edited?: boolean;
  is_deleted?: boolean;
  sender: User;
  receiver: User;
}

export interface ApiResponse<T> {
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface Region {
  id: string;
  name: string;
  code: string;
  order_sequence: number;
  is_active: boolean;
  provinces?: Province[];
}

export interface Chatroom {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  max_members: number;
  created_at: string;
  updated_at: string;
}

export interface Province {
  id: string;
  region_id: string;
  name: string;
  code: string;
  is_active: boolean;
  chatrooms?: Chatroom[];
}
