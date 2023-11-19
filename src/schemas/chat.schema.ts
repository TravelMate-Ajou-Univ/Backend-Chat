import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

export enum MessageType {
  IMAGE = 'image',
  TEXT = 'text',
}

@Schema({
  timestamps: true,
})
export class Chat {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    ref: 'ChatRoom',
  })
  room_id: Types.ObjectId;

  @Prop({
    required: true,
  })
  user_id: number;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  type: MessageType;

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
