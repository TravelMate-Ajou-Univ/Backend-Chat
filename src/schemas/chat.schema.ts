import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

enum MessageType {
  IMAGE,
  TEXT,
}

@Schema({
  timestamps: true,
})
export class Chat {
  @Prop({
    required: true,
    unique: true,
  })
  /// 변경
  id: Types.ObjectId;

  @Prop({
    required: true,
  })
  roomId: number;

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

  @Prop({ default: Date.now })
  created_at: Date;

  @Prop({ default: Date.now })
  updated_at: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
