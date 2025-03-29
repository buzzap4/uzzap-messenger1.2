export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          display_name: string | null
          status_message: string | null
          role: 'user' | 'admin' | 'moderator'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      messages: {
        Row: {
          id: string
          content: string
          user_id: string
          chatroom_id: string
          created_at: string
          is_edited: boolean
          is_deleted: boolean
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'is_edited' | 'is_deleted'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      direct_messages: {
        Row: {
          id: string
          content: string
          sender_id: string
          receiver_id: string
          conversation_id: string
          created_at: string
          read_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['direct_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['direct_messages']['Insert']>
      }
      chatroom_memberships: {
        Row: {
          chatroom_id: string
          user_id: string
          joined_at: string
        }
        Insert: Omit<Database['public']['Tables']['chatroom_memberships']['Row'], 'joined_at'>
        Update: never
      }
    }
  }
}
