import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types, ObjectId } from 'mongoose';
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
import { firstValueFrom } from 'rxjs';
import { CursorBasePaginationDto } from 'src/chat/dto/req/cursor-pagiation.dto';

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

  async validateRoomWithUser(userId: number, roomId: Types.ObjectId) {
    const room = await this.roomRepository.findRoomById(roomId);

    if (!room) {
      throw new BadRequestException('존재하지 않는 채팅방입니다.');
    }

    if (room.memberIds.indexOf(userId) === -1) {
      throw new BadRequestException('방에 권한이 없는 유저입니다.');
    }

    return room;
  }

  async getSpecificChatRoomDetail(
    userId: number,
    roomId: string,
    token: string,
  ) {
    const room = await this.validateRoomWithUser(
      userId,
      new Types.ObjectId(roomId),
    );

    const baseUrl = this.configService.get<string>('API_SERVER_URL');
    const url = `${baseUrl}/chat-room/${roomId}/bookmark-collection/details`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: token,
          },
        }),
      );

      const members = await this.userService.findUsersByIds(room.memberIds);
      const { bookmarks, collectionId } = data;

      return { members, bookmarks, collectionId };
    } catch (error) {
      throw new Error(error);
    }
  }

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
      createdAt: new Date(),
    });

    const url =
      this.configService.get('API_SERVER_URL') +
      `/chat-room/${chatRoom._id}/bookmark-collection`;

    await firstValueFrom(this.httpService.post(url, { title: chatRoom.name }));

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
    const room = await this.validateRoomWithUser(
      userId,
      new Types.ObjectId(roomId),
    );

    const newMemberIds = room.memberIds.filter((item) => {
      return item !== userId;
    });

    room.memberIds = newMemberIds;

    await this.roomRepository.updateChatRoom(room);
  }

  async getChatsInRoom(
    id: string,
    userId: number,
    dto: CursorBasePaginationDto,
  ) {
    let cursor: string | null | undefined = dto.cursor;

    const roomId = new Types.ObjectId(id);
    const room = await this.validateRoomWithUser(userId, roomId);

    if (!cursor) {
      const exitRecord =
        await this.exitRecordService.fetchExitRecordByUserAndRoomId(
          userId,
          roomId,
        );

      const lastChat = await this.chatService.getFirstChatAfterExit(
        roomId,
        exitRecord?.leavedAt,
      );

      cursor = lastChat ? String(lastChat._id) : null;
    }

    const chats = await this.chatService.getChatInRoom(
      room._id,
      dto.limit,
      cursor,
    );

    const hasNext = chats.length === dto.limit + 1;
    const hasPrev = cursor ? true : false;

    return { chats, hasNext, hasPrev, cursor: chats[chats.length - 1] };
  }
}
