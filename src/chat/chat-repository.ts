import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from 'src/schemas/chat.schema';
import { CreateChatDto } from './dto/req/ create-chat.dto';

@Injectable()
export class ChatRepository {
  constructor(@InjectModel(Chat.name) private chatModel: Model<Chat>) {}

  async createChat(dto: CreateChatDto): Promise<Chat> {
    return await this.chatModel.create(dto);
  }

  async findChatsByRoomId(roomId: Types.ObjectId): Promise<Chat[]> {
    return await this.chatModel.find({ room_id: roomId });
  }

  async findLastChatByRoomId(roomId: Types.ObjectId): Promise<Chat | null> {
    return await this.chatModel
      .findOne({ room_id: roomId })
      .sort({ created_at: -1 });
  }
}
