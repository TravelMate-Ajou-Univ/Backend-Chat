import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  BaseChatRoomType,
  BroadCastUserId,
  DeleteBookmarkType,
  PostBookmarkType,
  EnterChatRoomType,
  InviteFriendType,
  SendMessageType,
} from './types/chat-type';
import { ChatRoomService } from 'src/chatRoom/chat-room.service';
import { Types } from 'mongoose';
import { UseFilters, UseGuards } from '@nestjs/common';
import { InjectQueue, Processor } from '@nestjs/bull';
import { Queue } from 'bull';
import { MessageType } from 'src/schemas/chat.schema';
import { ExitRecordService } from 'src/exitRecord/exit-record.service';
import { WsGuard } from 'src/common/guards/web-socket.guard';
import { WebsocketExceptionsFilter } from 'src/common/filiters/socket.exception';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Processor('chat')
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseFilters(WebsocketExceptionsFilter)
@UseGuards(WsGuard)
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  constructor(
    @InjectQueue('chat') private readonly chatQueue: Queue,
    private readonly roomService: ChatRoomService,
    private readonly exitRecordService: ExitRecordService,
    private readonly configService: ConfigService,
    private readonly http: HttpService,
  ) {}

  private extractRoomIdFromSocket(client: Socket): string {
    const roomId = [...client.rooms].slice(1)[0];

    if (!roomId) {
      throw new WsException('roomId를 찾을 수 없습니다.');
    }

    return roomId;
  }

  handleConnection(@ConnectedSocket() client: Socket) {
    // Handle new WebSocket connection
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  @SubscribeMessage('leaveRoom')
  leaveChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BaseChatRoomType,
  ) {
    const roomId = this.extractRoomIdFromSocket(client);

    const { user } = payload;

    this.exitRecordService.upsertExitRecord({
      userId: user.id,
      roomId: new Types.ObjectId(roomId),
      leavedAt: new Date(),
    });
  }

  @SubscribeMessage('enterChatRoom')
  async EnterChatRoomType(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: EnterChatRoomType,
  ): Promise<void> {
    const user = payload.user;
    const roomId = payload.roomId;

    const room = await this.roomService.getRoomByIdOrThrow(
      new Types.ObjectId(roomId),
    );

    if (room.memberIds.indexOf(user.id) === -1) {
      throw new WsException('채팅방에 접근권한이 없는 유저입니다.');
    }

    const message = `${user.nickname}님이 방에 입장하였습니다.`;

    client.join(roomId);

    this.server.to(`${roomId}`).emit('adminMessage', {
      sender: client.id,
      message,
    });
  }

  @SubscribeMessage('inviteFriend')
  inviteFriend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: InviteFriendType,
  ): void {
    const roomId = this.extractRoomIdFromSocket(client);
    const nickname = payload.user.nickname;
    const members = payload.members;

    const content = `${nickname} 님이 ${members
      .map((member) => member.nickname)
      .join(', ')} 님을 방에 초대하였습니다.`;

    this.chatQueue.add(
      'send-message',
      {
        content,
        type: MessageType.TEXT,
        userId: BroadCastUserId,
        roomId,
      },
      {
        removeOnComplete: true,
      },
    );

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
    payload: SendMessageType,
  ): Promise<void> {
    const roomId = this.extractRoomIdFromSocket(client);
    const { id, nickname } = payload.user;
    const content = payload.message;

    const createdAt = new Date();

    this.chatQueue.add(
      'send-message',
      { userId: id, nickname, content, createdAt, type: MessageType.TEXT },
      {
        removeOnComplete: true,
      },
    );

    this.server.to(`${roomId}`).emit('message', {
      sender: client.id,
      userId: id,
      content,
      nickname,
      type: MessageType.TEXT,
      createdAt,
    });
  }

  @SubscribeMessage('sendImage')
  async handleImage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: SendMessageType,
  ): Promise<void> {
    const roomId = this.extractRoomIdFromSocket(client);
    const { id, nickname } = payload.user;
    const content = payload.message;

    const createdAt = new Date();

    this.chatQueue.add(
      'send-message',
      { userId: id, nickname, content, createdAt, type: MessageType.IMAGE },
      {
        removeOnComplete: true,
      },
    );

    this.server.to(`${roomId}`).emit('message', {
      sender: client.id,
      userId: id,
      content,
      nickname,
      type: MessageType.IMAGE,
      createdAt,
    });
  }

  @SubscribeMessage('exitChatRoom')
  async exitChatRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: BaseChatRoomType,
  ): Promise<void> {
    const { nickname, id } = payload.user;
    const roomId = this.extractRoomIdFromSocket(client);

    const content = `${nickname}님이 방에서 나갔습니다.`;

    this.chatQueue.add(
      'send-message',
      {
        content,
        type: MessageType.TEXT,
        userId: BroadCastUserId,
        roomId,
      },
      {
        removeOnComplete: true,
      },
    );

    client.leave(`${roomId}`);

    await this.roomService.exitChatRoom(id, new Types.ObjectId(roomId));

    this.server.to(`${roomId}`).emit('message', {
      userId: BroadCastUserId,
      sender: client.id,
      content,
      leaveUserId: id,
    });
  }

  @SubscribeMessage('postBookmark')
  async postBookmark(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: PostBookmarkType,
  ): Promise<void> {
    const { locationsWithContent, bookmarkCollectionId } = payload;

    const roomId = this.extractRoomIdFromSocket(client);
    const token = client.handshake.auth.token;

    const url =
      this.configService.get<string>('API_SERVER_URL') +
      `/chat-room/bookmark-collection/${bookmarkCollectionId}/bookmarks`;

    const { data } = await firstValueFrom(
      this.http.post(
        url,
        { locationsWithContent },
        {
          headers: {
            Authorization: token,
          },
        },
      ),
    );

    this.server.to(`${roomId}`).emit(`postBookmark`, {
      sender: client.id,
      bookmark: data,
    });
  }

  @SubscribeMessage('deleteBookmark')
  deleteBookmark(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: DeleteBookmarkType,
  ): void {
    const { bookmarkIds, bookmarkCollectionId } = payload;
    console.log(payload);
    const roomId = this.extractRoomIdFromSocket(client);
    const token = client.handshake.auth.token;

    this.chatQueue.add(
      'delete-bookmark',
      {
        bookmarkCollectionId,
        bookmarkIds,
        token,
      },
      {
        removeOnComplete: true,
      },
    );

    this.server.to(`${roomId}`).emit(`deleteBookmark`, {
      sender: client.id,
      bookmarkIds,
    });
  }
}
