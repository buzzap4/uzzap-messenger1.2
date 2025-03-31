import { supabase } from '@/lib/supabase';
import type { Region, Province } from '../types/models';

export const fetchRegions = async () => {
  try {
    const { data, error } = await supabase
      .from('regions')
      .select(`
        id,
        name,
        code,
        order_sequence,
        is_active,
        provinces:provinces(
          id,
          name,
          code,
          is_active,
          chatrooms:chatrooms(*)
        )
      `)
      .order('order_sequence');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching regions:', error);
    return { data: null, error };
  }
};

export const fetchProvincesByRegion = async (region_id: string) => {
  try {
    const { data, error } = await supabase
      .from('provinces')
      .select(`
        id,
        name,
        region_id,
        created_at,
        chatrooms (
          id,
          name,
          created_at
        )
      `)
      .eq('region_id', region_id)
      .order('name')
      .order('created_at', { foreignTable: 'chatrooms' });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return { data: null, error };
  }
};

export const fetchProvinceChatrooms = async (province_id: string) => {
  try {
    const { data, error } = await supabase
      .from('chatrooms')
      .select(`
        id,
        name,
        created_at,
        messages (
          id,
          content,
          created_at,
          user:profiles!messages_user_id_fkey (
            username,
            avatar_url
          )
        )
      `)
      .eq('province_id', province_id)
      .order('name')
      .limit(1, { foreignTable: 'messages' });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching province chatrooms:', error);
    return { data: null, error };
  }
};
