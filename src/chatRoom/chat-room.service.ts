import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ChatRoom } from 'src/schemas/chat-room.schema';
import { CreateChatRoomDto } from './dtos/create-chat-room.dto';
import { UserService } from 'src/user/user.service';
import {
  CreateChatRoomResponseDto,
  UserInfo,
} from './dtos/res/create-chat-room-response.dto';
import { ChatService } from 'src/chat/chat.service';
import { ChatRoomResponseDto } from './dtos/res/chat-room-response.dto';
import { ChatRoomRepository } from './chat-room.repository';

@Injectable()
export class ChatRoomService {
  constructor(
    private readonly roomRepository: ChatRoomRepository,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
  ) {}

  async getMyChatRooms(userId: number): Promise<ChatRoomResponseDto[]> {
    const chatRooms = await this.roomRepository.findRoomByUserId(userId);
    const chatRoomDtos: ChatRoomResponseDto[] = [];

    for (const chatRoom of chatRooms) {
      const members = await this.userService.findUsersByIds(chatRoom.memberIds);
      const lastChat = await this.chatService.getLastChatById(chatRoom._id);

      chatRoomDtos.push({
        chatRoom,
        members,
        lastChat,
      });
    }

    return chatRoomDtos;
  }

  async createChatRoom(
    dto: CreateChatRoomDto,
    userId: number,
  ): Promise<CreateChatRoomResponseDto> {
    const users: UserInfo[] = await this.userService.findUsersByIds(
      dto.memberIds,
    );

    dto.memberIds.push(userId);
    const chatRoom = await this.roomRepository.createChatRoom(dto, userId);

    return { chatRoom, members: users };
  }

  async inviteFriendToRoom(friendId: number, roomId: Types.ObjectId) {
    const room: ChatRoom | null =
      await this.roomRepository.findRoomById(roomId);

    if (!room) {
      throw new NotFoundException('찾을 수 없는 채팅방입니다');
    }

    room.memberIds.push(friendId);

    await this.roomRepository.updateChatRoom(room);
  }

  async exitChatRoom(userId: number, roomId: Types.ObjectId) {
    const room: ChatRoom | null =
      await this.roomRepository.findRoomById(roomId);

    if (!room) {
      throw new NotFoundException('찾을 수 없는 채팅방입니다');
    }

    if (room.memberIds.indexOf(userId) === -1) {
      throw new BadRequestException('이미 나간 채팅방입니다.');
    }

    const newMemberIds = room.memberIds.filter((item) => {
      return item !== userId;
    });

    room.memberIds = newMemberIds;

    await this.roomRepository.updateChatRoom(room);
  }
}
