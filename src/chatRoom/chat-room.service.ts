import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from 'src/schemas/chat-room.schema';
import { CreateChatRoomDto } from './dtos/create-chat-room.dto';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
  ) {}

  async getMyChatRooms(userId: number) {
    return await this.chatRoomModel.find({ memberIds: userId });
  }

  async createChatRoom(
    dto: CreateChatRoomDto,
    userId: number,
  ): Promise<ChatRoomDocument> {
    dto.memberIds.push(userId);
    const newChatRoom = new this.chatRoomModel({ ...dto, creatorId: userId });
    return await newChatRoom.save();
  }
}
