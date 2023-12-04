import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/user/strategies/jwt.strategy';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { ChatRoomService } from './chat-room.service';
import { CreateChatRoomDto } from './dtos/create-chat-room.dto';
import { UserEntity } from '../user/entities/user.entity';
import { CreateChatRoomResponseDto } from './dtos/res/create-chat-room-response.dto';
import { Request } from 'express';
import { CursorBasePaginationDto } from 'src/chat/dto/req/cursor-pagiation.dto';

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
  ): Promise<CreateChatRoomResponseDto> {
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

  @ApiOperation({ summary: '특정 채팅방 상세조회' })
  @ApiResponse({})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('chatroom/:id')
  async getSpecificChatRoomDetail(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const token = request.headers.authorization;

    if (!token) {
      throw new BadRequestException('토큰이 누락되었습니다.');
    }

    return await this.chatRoomService.getSpecificChatRoomDetail(
      user.id,
      id,
      token,
    );
  }

  @ApiOperation({ summary: '채팅방내에 있는 채팅들 불러오는 API' })
  @ApiQuery({
    type: CursorBasePaginationDto,
  })
  @ApiResponse({})
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('chatroom/:id/chats')
  async getChatsInRoom(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
    @Query() dto: CursorBasePaginationDto,
  ) {
    return await this.chatRoomService.getChatsInRoom(id, user.id, dto);
  }
}
