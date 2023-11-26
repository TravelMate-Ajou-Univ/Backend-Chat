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
import { BroadCastUserId } from 'src/chat/types/chat-type';
import { MessageType } from 'src/schemas/chat.schema';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ExitRecordService } from 'src/exitRecord/exit-record.service';
import { exit } from 'process';

@Injectable()
export class ChatRoomService {
  constructor(
    private readonly roomRepository: ChatRoomRepository,
    private readonly chatService: ChatService,
    private readonly userService: UserService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly exitRecordService: ExitRecordService,
  ) {}

  async getMyChatRooms(userId: number): Promise<ChatRoomResponseDto[]> {
    const chatRooms = await this.roomRepository.findRoomByUserId(userId);
    const chatRoomDtos: ChatRoomResponseDto[] = [];

    for (const chatRoom of chatRooms) {
      const members = await this.userService.findUsersByIds(chatRoom.memberIds);

      const lastChat = await this.chatService.getLastChatById(chatRoom._id);

      const exitRecord =
        await this.exitRecordService.fetchExitRecordByUserAndRoomId(
          userId,
          chatRoom._id,
        );

      const unReadCount = await this.chatService.getUnReadChatCount(
        chatRoom._id,
        exitRecord ? exitRecord.leavedAt : chatRoom.createdAt,
      );

      chatRoomDtos.push({
        chatRoom,
        members,
        lastChat,
        unReadCount,
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
    const members = await this.userService.findUsersByIds(dto.memberIds);

    const invitedUsers = members.filter((member) => member.id !== userId);

    const invitationString = `${
      members.find((member) => member.id === userId).nickname
    }님이 ${invitedUsers
      .map((user) => user.nickname)
      .join(', ')} 님을 방에 초대하였습니다.`;

    const chatRoom = await this.roomRepository.createChatRoom(dto, userId);

    const lastChat = await this.chatService.createChat({
      userId: BroadCastUserId,
      type: MessageType.TEXT,
      roomId: chatRoom._id,
      content: invitationString,
    });

    return { chatRoom, members: users, lastChat };
  }

  async inviteFriendToRoom(friendIds: number[], roomId: Types.ObjectId) {
    const room: ChatRoom | null =
      await this.roomRepository.findRoomById(roomId);

    if (!room) {
      throw new NotFoundException('찾을 수 없는 채팅방입니다');
    }
    room.memberIds = [...room.memberIds, ...friendIds];

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
