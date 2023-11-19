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
  EnterChatRoomType,
  InviteChatRoomType,
  Message,
} from './types/chat-type';
import { ChatRoomService } from 'src/chatRoom/chat-room.service';
import { Types } from 'mongoose';

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

    this.server.to(`${roomId}`).emit('message', {
      sender: client.id,
      message,
    });
  }

  @SubscribeMessage('inviteFriend')
  inviteFriend(client: Socket, payload: InviteChatRoomType): void {
    const { friendNickname, friendId, roomId } = payload;

    const message = `${friendNickname}님이 방에 입장하였습니다.`;

    this.roomService.inviteFriendToRoom(friendId, new Types.ObjectId(roomId));

    this.server.to(`${roomId}`).emit('message', {
      sender: client.id,
      message,
    });
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: Socket, payload: Message): void {
    const { userId, nickname, message, type, roomId } = payload;

    this.chatService.createChat({
      room_id: roomId,
      content: message,
      type,
      user_id: userId,
    });

    this.server.emit('message', {
      sender: client.id,
      message: payload.message,
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

      this.server.to(`${roomId}`).emit('message', {
        sender: client.id,
        message,
      });
    } catch (error) {
      this.server.emit('error', error);
    }
  }
}
