import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ChatService } from 'src/chat/chat.service';

@Processor('chat')
export class ChatProcessor {
  constructor(private readonly chatService: ChatService) {}

  @Process('send-message')
  async handleTranscode(job: Job) {
    await this.chatService.createChat(job.data);
  }
}
