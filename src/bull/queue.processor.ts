import { HttpService } from '@nestjs/axios';
import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { ChatService } from 'src/chat/chat.service';

@Processor('chat')
export class ChatProcessor {
  constructor(
    private readonly chatService: ChatService,
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Process('send-message')
  async handleMessage(job: Job) {
    await this.chatService.createChat(job.data);
  }

  @Process('handle-bookmark')
  async handleBookmark(job: Job) {
    const baseURL = this.configService.get<string>('API_SERVER_URL');
    const method = job.data.method;

    await this.http[method](baseURL, job.data);
  }
}
