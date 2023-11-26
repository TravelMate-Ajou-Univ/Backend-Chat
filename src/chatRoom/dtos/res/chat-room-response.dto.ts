import { CreateChatRoomResponseDto } from './create-chat-room-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ChatDto } from 'src/chat/dto/chat.dto';

export class ChatRoomResponseDto extends CreateChatRoomResponseDto {
  @ApiProperty({
    description: '마지막 채팅 정보',
  })
  @Expose()
  unReadCount: number;
}
