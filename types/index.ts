export interface User {
  id: string;
  username: string;
  avatar_url: string;
}

export interface DirectMessage {
  id: string;
  content: string;
  created_at: string;
  sender: User;
}
