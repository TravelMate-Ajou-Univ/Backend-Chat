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

  async getUnReadChatCount(id: Types.ObjectId, leavedAt: Date) {
    return await this.chatRepository.findManyUnReadChatCount(id, leavedAt);
  }

  async getChatInRoom(
    id: Types.ObjectId,
    // limit: number,
    // cursor?: string | null,
  ) {
    // return await this.chatRepository.findChatsByRoomId(id, limit, cursor);
    return await this.chatRepository.findChatsByRoomId(id);
  }

  async getFirstChatAfterExit(id: Types.ObjectId, date?: Date) {
    return await this.chatRepository.getFirstChatAfterExit(id, date);
  }
}
