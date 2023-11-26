import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/user/strategies/jwt.strategy';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dtos/create-chat-room.dto';
import { UserEntity } from '../user/entities/user.entity';
import { CreateChatRoomResponseDto } from './dtos/res/create-chat-room-response.dto';

@Controller()
export class ChatRoomController {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @ApiOperation({ summary: '채팅방 생성' })
  @ApiResponse({})
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Post('chatroom')
  async createChatRoom(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateChatRoomDto,
  ): Promise<CreateChatRoomResponseDto> {
    const userId = 1;
    return await this.chatRoomService.createChatRoom(dto, userId);
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
