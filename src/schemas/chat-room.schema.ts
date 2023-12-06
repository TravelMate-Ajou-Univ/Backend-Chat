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
    index: true,
  })
  memberIds: number[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  creatorId: number;

  deletedAt?: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
