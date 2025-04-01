import { router } from 'expo-router';

export const navigate = {
  toChat: (id: string, name: string) => 
    router.push(`/chatroom/${id}?name=${name}`),
  
  toDirectMessage: (userId: string, userName: string) => 
    router.push(`/direct-message/${userId}?name=${userName}`),
  
  toNewMessage: () => 
    router.push('/new-message'),
  
  toSettings: () => 
    router.push('/settings'),
  
  toPrivacySettings: () => 
    router.push('/privacy-settings'),
  
  toBlockedUsers: () => 
    router.push('/blocked-users'),
  
  goBack: () => 
    router.back(),
};
