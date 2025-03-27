export interface User {
  id: string;
  username: string;
  avatar_url: string;
  name?: string;
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
}

export interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  receiver?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}
