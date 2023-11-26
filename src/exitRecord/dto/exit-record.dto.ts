import { Types } from 'mongoose';

export class ExitRecordDto {
  _id: Types.ObjectId;
  userId: number;
  roomId: Types.ObjectId;
  leavedAt: Date;
}
