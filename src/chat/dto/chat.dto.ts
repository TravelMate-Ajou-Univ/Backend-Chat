import { Types } from 'mongoose';
import { MessageType } from 'src/schemas/chat.schema';

export class ChatDto {
  _id: Types.ObjectId;
  content: string;
  type: MessageType;
  user_id: number;
  room_id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}
