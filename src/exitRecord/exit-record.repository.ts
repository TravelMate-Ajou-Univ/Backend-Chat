import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { ExitRecord } from 'src/schemas/exit-record.schema';
import { UpsertExitRecordDto } from './dto/req/upsert-exit-record.dto';

@Injectable()
export class ExitRecordRepository {
  constructor(
    @InjectModel(ExitRecord.name) private exitRecordModel: Model<ExitRecord>,
  ) {}

  async upsertExitRecord(dto: UpsertExitRecordDto) {
    const { userId, roomId, leavedAt } = dto;
    // await this.exitRecordModel.create({
    //   userId,
    //   roomId,
    //   leavedAt,
    // });
    const exitRecord = await this.exitRecordModel.findOne({ userId, roomId });

    exitRecord
      ? await this.exitRecordModel.updateOne(
          { _id: exitRecord.id },
          { $set: { leavedAt } },
        )
      : await this.exitRecordModel.create({
          userId,
          roomId,
          leavedAt,
        });
  }

  async fetchExitRecordByUserAndRoomId(userId: number, roomId: Types.ObjectId) {
    return await this.exitRecordModel.findOne({ roomId, userId });
  }
}
