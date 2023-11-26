import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExitRecord, ExitRecordSchema } from 'src/schemas/exit-record.schema';
import { ExitRecordService } from './exit-record.service';
import { ExitRecordRepository } from './exit-record.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExitRecord.name, schema: ExitRecordSchema },
    ]),
  ],
  controllers: [],
  providers: [ExitRecordService, ExitRecordRepository],
  exports: [ExitRecordService, ExitRecordRepository],
})
export class ExitRecordModule {}
