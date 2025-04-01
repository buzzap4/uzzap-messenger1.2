import { IMessage } from 'react-native-gifted-chat';

export interface ChatMessage extends IMessage {
  bubble_color?: string;
  is_edited?: boolean;
  is_deleted?: boolean;
}

// Add a type guard
export const isChatMessage = (message: any): message is ChatMessage => {
  return 'bubble_color' in message || 'is_edited' in message || 'is_deleted' in message;
};
