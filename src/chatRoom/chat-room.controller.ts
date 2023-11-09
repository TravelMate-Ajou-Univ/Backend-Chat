import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/user/strategies/jwt.strategy';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dtos/create-chat-room.dto';
import { ChatRoomEntity } from './entities/chat-room.entitiy';
import { UserEntity } from '../user/entities/user.entity';

@Controller()
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @ApiOperation({ summary: '채팅방 생성' })
  @ApiResponse({})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('chatroom')
  async createChatRoom(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateChatRoomDto,
  ): Promise<ChatRoomEntity> {
    return await this.chatRoomService.createChatRoom(dto, user.id);
  }

  @ApiOperation({ summary: '나의 채팅방 조회' })
  @ApiResponse({})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me/chatrooms')
  async getMyChatRooms(@CurrentUser() user: UserEntity) {
    return await this.chatRoomService.getMyChatRooms(user.id);
  }
}
