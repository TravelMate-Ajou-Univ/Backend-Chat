import { Injectable } from '@nestjs/common';
import { ExitRecordRepository } from './exit-record.repository';
import { UpsertExitRecordDto } from './dto/req/upsert-exit-record.dto';
import { ObjectId, Types } from 'mongoose';

@Injectable()
export class ExitRecordService {
  constructor(private readonly exitRecordRepository: ExitRecordRepository) {}

  async upsertExitRecord(dto: UpsertExitRecordDto) {
    await this.exitRecordRepository.upsertExitRecord(dto);
  }

  async fetchExitRecordByUserAndRoomId(userId: number, id: Types.ObjectId) {
    return await this.exitRecordRepository.fetchExitRecordByUserAndRoomId(
      userId,
      id,
    );
  }
}
