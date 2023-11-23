import { Types } from 'mongoose';

export class ChatRoomDto {
  _id: Types.ObjectId;
  name: string;
  creatorId: number;
  memberIds: number[];
  createdAt: Date;
}
