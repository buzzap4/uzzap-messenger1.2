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
          last_seen: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'last_seen'>
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
      regions: {
        Row: {
          id: string
          name: string
          code: string
          order_sequence: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['regions']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['regions']['Insert']>
      }
      provinces: {
        Row: {
          id: string
          region_id: string
          name: string
          code: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['provinces']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['provinces']['Insert']>
      }
      chatrooms: {
        Row: {
          id: string
          province_id: string
          name: string
          description: string | null
          is_active: boolean
          max_members: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['chatrooms']['Row'], 'created_at' | 'updated_at' | 'is_active'>
        Update: Partial<Database['public']['Tables']['chatrooms']['Insert']>
      }
      chatroom_roles: {
        Row: {
          id: string
          chatroom_id: string
          user_id: string
          role: 'owner' | 'moderator' | 'member'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chatroom_roles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['chatroom_roles']['Insert']>
      }
      user_blocks: {
        Row: {
          blocker_id: string
          blocked_id: string 
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_blocks']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['user_blocks']['Insert']>
      }
    }
  }
}
