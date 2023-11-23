import { Injectable } from '@nestjs/common';

import { Types } from 'mongoose';
import { ChatRepository } from './chat-repository';
import { CreateChatDto } from './dto/req/ create-chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly chatRepository: ChatRepository) {}

  async createChat(dto: CreateChatDto) {
    return await this.chatRepository.createChat(dto);
  }

  async getLastChatById(roomId: Types.ObjectId) {
    return await this.chatRepository.findLastChatByRoomId(roomId);
  }
}
