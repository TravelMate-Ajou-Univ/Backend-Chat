import { JwtPayload } from 'src/common/guards/web-socket.guard';

export const BroadCastUserId = 0;

export type BaseChatRoomType = {
  user: JwtPayload;
};

export type EnterChatRoomType = BaseChatRoomType & {
  roomId: string;
};

export type InviteFriendType = BaseChatRoomType & {
  members: JwtPayload[];
};

export type SendMessageType = BaseChatRoomType & {
  message: string;
};

export type PostBookmarkType = BaseChatRoomType & {
  locationsWithContent: LocationWithContent[];
  bookmarkCollectionId: number;
};

export type DeleteBookmarkType = BaseChatRoomType & {
  bookmarkIds: number[];
  bookmarkCollectionId: number;
};

export type LocationWithContent = {
  latitude: number;
  longitude: number;
  content: string;
  placeId?: string;
};
