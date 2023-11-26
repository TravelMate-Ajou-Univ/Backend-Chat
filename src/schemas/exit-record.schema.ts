import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExitRecordDocument = HydratedDocument<ExitRecord>;

@Schema({
  timestamps: false,
})
export class ExitRecord {
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
    default: Date.now(),
  })
  leavedAt: Date;
}

export const ExitRecordSchema = SchemaFactory.createForClass(ExitRecord);
