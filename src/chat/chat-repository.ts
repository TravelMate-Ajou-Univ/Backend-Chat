import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, MessageType } from 'src/schemas/chat.schema';
import { CreateChatDto } from './dto/req/ create-chat.dto';

@Injectable()
export class ChatRepository {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async createChat(dto: CreateChatDto): Promise<Chat> {
    dto.roomId = new Types.ObjectId(dto.roomId);
    return await this.chatModel.create(dto);
  }

  async findChatsByRoomId(
    roomId: Types.ObjectId,
    limit: number,
    cursor?: string | null,
  ): Promise<Chat[]> {
    return await this.chatModel
      .find({
        roomId,
        ...(cursor && {
          _id: {
            $gt: new Types.ObjectId(),
          },
        }),
      })
      .limit(limit + 1);
  }

  async findLastChatByRoomId(roomId: Types.ObjectId): Promise<Chat | null> {
    return await this.chatModel.findOne({ roomId }).sort({ createdAt: 'desc' });
  }

  async findManyUnReadChatCount(roomId: Types.ObjectId, leavedAt: Date) {
    return await this.chatModel.count({
      roomId,
      createdAt: { $gt: leavedAt },
    });
  }

  async getFirstChatAfterExit(id: Types.ObjectId, leavedAt?: Date) {
    return await this.chatModel.findOne({
      roomId: id,
      ...(leavedAt && { createdAt: { $gt: leavedAt } }),
    });
  }
}
