import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { ChatProcessor } from './queue.processor';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ChatModule,
    BullModule.registerQueue({
      name: 'chat',
    }),
    HttpModule,
  ],
  providers: [ChatProcessor],
  exports: [ChatProcessor],
})
export class QueueModule {}
