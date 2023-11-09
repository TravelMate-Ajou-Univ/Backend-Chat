import { Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @Post('test')
  // async createChatRoom(): Promise<any> {
  //   return await this.chatService.createChatRoom();
  // }
}
