import { Controller, Get, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiOperation } from '@nestjs/swagger';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // @ApiOperation({ summary: '채팅 생성' })
  // @Post('test')
  // async createChatRoom(): Promise<any> {
  //   return await this.chatService.createChat();
  // }
}
