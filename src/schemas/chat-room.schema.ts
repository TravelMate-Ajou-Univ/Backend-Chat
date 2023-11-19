import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatRoomDocument = HydratedDocument<ChatRoom>;

@Schema({})
export class ChatRoom {
  _id: Types.ObjectId;

  @Prop({
    required: true,
  })
  name: string;

  @Prop({
    required: true,
  })
  memberIds: number[];

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop()
  creatorId: number;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
