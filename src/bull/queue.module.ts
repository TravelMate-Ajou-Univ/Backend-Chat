import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';
import { ChatProcessor } from './queue.processor';

@Module({
  imports: [
    ChatModule,
    BullModule.registerQueue({
      name: 'chat',
    }),
  ],
  providers: [ChatProcessor],
  exports: [ChatProcessor],
})
export class QueueModule {}
