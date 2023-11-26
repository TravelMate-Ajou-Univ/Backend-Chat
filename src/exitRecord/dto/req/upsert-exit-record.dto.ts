import { Types } from 'mongoose';

export class UpsertExitRecordDto {
  userId: number;
  roomId: Types.ObjectId;
  leavedAt: Date;
}
