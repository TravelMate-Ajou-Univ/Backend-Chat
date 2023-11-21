import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import {
  DeleteBookmarkType,
  EnterChatRoomType,
  InviteChatRoomType,
  Message,
  PostBookmarkType,
} from './types/chat-type';
import { ChatRoomService } from 'src/chatRoom/chat-room.service';
import { Types } from 'mongoose';
import { MessageType } from 'src/schemas/chat.schema';

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
    private readonly chatService: ChatService,
    private readonly roomService: ChatRoomService,
  ) {}

  handleConnection(client: Socket) {
    // Handle new WebSocket connection
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    // Handle WebSocket disconnection
    console.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    console.log('WebSocket gateway initialized');
  }

  @SubscribeMessage('enterChatRoom')
  enterChatRoom(client: Socket, payload: EnterChatRoomType): void {
    const { nickname, roomId } = payload;

    const message = `${nickname}님이 방에 입장하였습니다.`;
    client.join(roomId);
    this.server.to(`${roomId}`).emit('adminMessage', {
      sender: client.id,
      message,
    });
  }

  @SubscribeMessage('inviteFriend')
  inviteFriend(client: Socket, payload: InviteChatRoomType): void {
    const { friendNickname, friendId, roomId } = payload;

    const message = `${friendNickname}님이 방에 초대되었습니다.`;

    this.roomService.inviteFriendToRoom(friendId, new Types.ObjectId(roomId));

    this.server.to(`${roomId}`).emit('adminMessage', {
      sender: client.id,
      message,
    });
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: Message): void {
    const { userId, nickname, message, roomId } = payload;

    // this.chatService.createChat({
    //   room_id: roomId,
    //   content: message,
    //   type: MessageType.TEXT,
    //   user_id: userId,
    // });
    console.log('a');

    this.server.to(`${roomId}`).emit('message', {
      sender: client.id,
      userId,
      message,
      nickname,
    });
  }

  @SubscribeMessage('exitChatRoom')
  async exitChatRoom(
    client: Socket,
    payload: EnterChatRoomType,
  ): Promise<void> {
    try {
      const { nickname, roomId, userId } = payload;

      const message = `${nickname}님이 방에 입장하였습니다.`;

      await this.roomService.exitChatRoom(userId, new Types.ObjectId(roomId));
      client.leave(`${roomId}`);
      this.server.to(`${roomId}`).emit('message', {
        sender: client.id,
        message,
      });
    } catch (error) {
      this.server.emit('error', error);
    }
  }

  @SubscribeMessage('postBookmark')
  postBookmark(client: Socket, payload: PostBookmarkType): void {
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
  deleteBookmark(client: Socket, payload: DeleteBookmarkType): void {
    const { bookmarkId, roomId } = payload;

    this.server.to(`${roomId}`).emit(`deleteBookmark`, {
      sender: client.id,
      bookmarkId,
    });
  }
}
