import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatRoom } from 'src/schemas/chat-room.schema';
import { CreateChatRoomDto } from './dtos/create-chat-room.dto';

@Injectable()
export class ChatRoomRepository {
  @InjectModel(ChatRoom.name) private roomModel: Model<ChatRoom>;

  async createChatRoom(
    dto: CreateChatRoomDto,
    creatorId: number,
  ): Promise<ChatRoom> {
    return await this.roomModel.create({ ...dto, creatorId });
  }

  async findRoomByUserId(userId: number): Promise<ChatRoom[]> {
    return await this.roomModel
      .find({ memberIds: userId })
      .sort({ created_at: -1 });
  }

  async findRoomById(roomId: Types.ObjectId): Promise<ChatRoom | null> {
    return await this.roomModel.findById({ _id: roomId });
  }

  async updateChatRoom(room: ChatRoom) {
    return await this.roomModel.updateOne({ _id: room._id }, room);
  }

  async deleteChatRoom(room: ChatRoom) {
    return await this.roomModel.updateOne(
      { _id: room._id },
      { $set: { deletedAt: new Date() } },
    );
  }
}
