import { Decimal128 } from 'mongoose';
import { ChatDto } from '../dto/chat.dto';

export const BroadCastUserId = 0;

export type BaseChatRoomType = {
  nickname: string;
  roomId: string;
  userId: number;
};

export type ExtendChatType = Partial<ChatDto> & {
  nickname: string;
};

export type UserType = {
  id: number;
  nickname: string;
  profileImageId: string | null;
};

export type InviteChatRoomType = {
  members: UserType[];
  roomId: string;
  nickname: string;
};

export type PostBookmarkType = {
  longitude: Decimal128;
  latitude: Decimal128;
  roomId: string;
};

export type DeleteBookmarkType = {
  roomId: string;
  bookmarkId: number;
};
