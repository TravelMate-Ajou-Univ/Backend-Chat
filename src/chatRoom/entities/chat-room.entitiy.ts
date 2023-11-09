import { Types } from 'mongoose';

export class ChatRoomEntity {
  _id: Types.ObjectId;
  name: string;
  creatorId: number;
  memberIds: number[];
  created_at: Date;
}
