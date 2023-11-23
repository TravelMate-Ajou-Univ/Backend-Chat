import { Types } from 'mongoose';
import { MessageType } from 'src/schemas/chat.schema';

export class ChatDto {
  _id: Types.ObjectId;
  content: string;
  type: MessageType;
  userId: number;
  roomId: Types.ObjectId;
  createdAt: Date;
}
