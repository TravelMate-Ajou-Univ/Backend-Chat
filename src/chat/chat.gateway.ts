import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import {
  BaseChatRoomType,
  BroadCastUserId,
  DeleteBookmarkType,
  ExtendChatType,
  InviteChatRoomType,
  PostBookmarkType,
} from './types/chat-type';
import { ChatRoomService } from 'src/chatRoom/chat-room.service';
import { Types } from 'mongoose';
import { BadRequestException, UseFilters } from '@nestjs/common';
import {
  SocketException,
  SocketExceptionFilter,
} from 'src/common/filiters/socket.exception';
import { InjectQueue, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { MessageType } from 'src/schemas/chat.schema';

@UseFilters(new SocketExceptionFilter())
@Processor('chat')
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  constructor(
    @InjectQueue('chat') private readonly chatQueue: Queue,
    private readonly roomService: ChatRoomService,
  ) {}

  handleConnection(@ConnectedSocket() client: Socket) {
    // Handle new WebSocket connection
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    // Handle WebSocket disconnection
    console.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  @SubscribeMessage('enterChatRoom')
  enterChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BaseChatRoomType,
  ): void {
    const { nickname, roomId } = payload;

    const message = `${nickname}님이 방에 입장하였습니다.`;

    client.join(roomId);
    this.server.to(`${roomId}`).emit('adminMessage', {
      sender: client.id,
      message,
    });
  }

  @SubscribeMessage('inviteFriend')
  inviteFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: InviteChatRoomType,
  ): void {
    const { nickname, roomId } = payload;
    const members = payload.members;
    // if (members.length === 0) {
    //   throw new SocketException('BadRequest', '초대할 사람을 적용해주세요');
    // }

    const content = `${nickname} 님이 ${members
      .map((member) => member.nickname)
      .join(', ')} 님을 방에 초대하였습니다.`;

    this.chatQueue.add('send-message', {
      content,
      type: MessageType.TEXT,
      userId: BroadCastUserId,
      roomId,
    });

    const friendIds = members.map((member) => {
      return member.id;
    });

    this.roomService.inviteFriendToRoom(friendIds, new Types.ObjectId(roomId));

    this.server.to(`${roomId}`).emit('message', {
      userId: BroadCastUserId,
      sender: client.id,
      content,
      members,
    });
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: ExtendChatType,
  ): Promise<void> {
    const { roomId, content, userId, nickname } = payload;

    const createdAt = new Date();
    payload.type = MessageType.TEXT;
    payload.createdAt = createdAt;

    this.chatQueue.add('send-message', payload);

    this.server.to(`${roomId}`).emit('message', {
      sender: client.id,
      userId,
      content,
      nickname,
      createdAt: createdAt,
    });
  }

  @SubscribeMessage('exitChatRoom')
  async exitChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BaseChatRoomType,
  ): Promise<void> {
    const { nickname, roomId, userId } = payload;

    const content = `${nickname}님이 방에서 나갔습니다.`;

    this.chatQueue.add('send-message', {
      content,
      type: MessageType.TEXT,
      userId: BroadCastUserId,
      roomId,
    });

    client.leave(`${roomId}`);

    await this.roomService.exitChatRoom(userId, new Types.ObjectId(roomId));

    this.server.to(`${roomId}`).emit('message', {
      userId: BroadCastUserId,
      sender: client.id,
      content,
      leaveUserId: userId,
    });
  }

  @SubscribeMessage('postBookmark')
  postBookmark(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PostBookmarkType,
  ): void {
    const { longitude, latitude, roomId } = payload;

    this.server.to(`${roomId}`).emit(`postBookmark`, {
      sender: client.id,
      data: {
        longitude,
        latitude,
      },
    });
  }

  @SubscribeMessage('deleteBookmark')
  deleteBookmark(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DeleteBookmarkType,
  ): void {
    const { bookmarkId, roomId } = payload;

    this.server.to(`${roomId}`).emit(`deleteBookmark`, {
      sender: client.id,
      bookmarkId,
    });
  }
}
