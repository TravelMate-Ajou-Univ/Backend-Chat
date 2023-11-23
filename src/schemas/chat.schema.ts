import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

export enum MessageType {
  IMAGE = 'image',
  TEXT = 'text',
}

@Schema({
  timestamps: false,
})
export class Chat {
  _id: Types.ObjectId;

  @Prop({
    required: true,
    ref: 'ChatRoom',
  })
  roomId: Types.ObjectId;

  @Prop({
    required: true,
  })
  userId: number;

  @Prop({
    required: true,
  })
  content: string;

  @Prop({
    required: true,
  })
  type: MessageType;

  @Prop({
    default: Date.now(),
  })
  createdAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
