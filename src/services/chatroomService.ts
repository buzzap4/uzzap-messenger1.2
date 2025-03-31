import { supabase } from '../../lib/supabase';

export const joinChatroom = async (chatroomId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { error } = await supabase
      .from('chatroom_memberships')
      .insert({
        chatroom_id: chatroomId,
        user_id: session.user.id,
      });

    if (error) {
      throw error;
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const leaveChatroom = async (chatroomId: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('No active session');
    }

    const { error } = await supabase
      .from('chatroom_memberships')
      .delete()
      .match({ chatroom_id: chatroomId, user_id: session.user.id });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const isUserInChatroom = async (chatroomId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('chatroom_memberships')
      .select('chatroom_id')
      .eq('chatroom_id', chatroomId)
      .eq('user_id', userId);

    if (error) throw error;
    // Return true if there is at least one matching record
    return { data: data && data.length > 0, error: null };
  } catch (error) {
    return { data: false, error };
  }
};

export const verifyOrJoinChatroom = async (chatroomId: string, userId: string) => {
  try {
    // First check if user is already a member
    const { data: isMember } = await isUserInChatroom(chatroomId, userId);
    
    if (!isMember) {
      // If not a member, try to join
      const { error: joinError } = await supabase
        .from('chatroom_memberships')
        .insert({ chatroom_id: chatroomId, user_id: userId });
      
      if (joinError) throw joinError;
    }
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};
