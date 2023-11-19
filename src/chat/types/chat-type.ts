import { MessageType } from 'src/schemas/chat.schema';

export type Message = {
  userId: number;
  nickname: string;
  message: string;
  type: MessageType.TEXT;
  roomId: string;
};

export type EnterChatRoomType = {
  nickname: string;
  roomId: string;
  userId: number;
};

export type InviteChatRoomType = {
  friendNickname: string;
  roomId: string;
  friendId: number;
};
