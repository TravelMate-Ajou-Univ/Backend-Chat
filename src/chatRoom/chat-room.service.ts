import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatRoom, ChatRoomDocument } from 'src/schemas/chat-room.schema';
import { CreateChatRoomDto } from './dtos/create-chat-room.dto';
import { UserService } from 'src/user/user.service';
import {
  ChatRoomResponseDto,
  UserInfo,
} from './dtos/res/chat-room-response.dto';

@Injectable()
export class ChatRoomService {
  constructor(
    @InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoom>,
    private readonly userService: UserService,
  ) {}

  async getMyChatRooms(userId: number): Promise<ChatRoomResponseDto[]> {
    const chatRooms = await this.chatRoomModel.find({ memberIds: userId });
    const chatRoomDtos: ChatRoomResponseDto[] = [];

    for (const chatRoom of chatRooms) {
      const members = await this.userService.findUsersByIds(chatRoom.memberIds);
      chatRoomDtos.push({ chatRoom, members });
    }

    return chatRoomDtos;
  }

  async createChatRoom(
    dto: CreateChatRoomDto,
    userId: number,
  ): Promise<ChatRoomResponseDto> {
    const users: UserInfo[] = await this.userService.findUsersByIds(
      dto.memberIds,
    );

    dto.memberIds.push(userId);
    const newChatRoom = new this.chatRoomModel({ ...dto, creatorId: userId });

    return { chatRoom: await newChatRoom.save(), members: users };
  }
}
