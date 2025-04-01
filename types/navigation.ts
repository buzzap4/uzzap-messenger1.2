export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'chatroom': { id: string; name: string };
  'direct-message': { userId: string; userName: string };
  'new-message': undefined;
  'privacy-settings': undefined;
  'blocked-users': undefined;
};

export type TabParamList = {
  'index': undefined; // Chats tab
  'rooms': undefined;
  'direct-messages': undefined;
  'settings': undefined;
  'profile': undefined;
};

export type AuthStackParamList = {
  'sign-in': undefined;
  'sign-up': undefined;
  'onboarding': undefined;
  'forgot-password': undefined;
};
