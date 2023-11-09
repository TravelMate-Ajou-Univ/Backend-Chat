import { Module } from '@nestjs/common';
import { ChatClientController } from './chat-client.controller';

@Module({
  controllers: [ChatClientController],
})
export class ChatClientModule {}
