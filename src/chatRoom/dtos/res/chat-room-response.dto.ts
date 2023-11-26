import { ChatDto } from 'src/chat/dto/chat.dto';
import { CreateChatRoomResponseDto } from './create-chat-room-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ChatRoomResponseDto extends CreateChatRoomResponseDto {
  @ApiProperty({
    description: '마지막 채팅 정보',
  })
  @Expose()
  lastChat: ChatDto | null;

  @ApiProperty({
    description: '마지막 채팅 정보',
  })
  @Expose()
  unReadCount: number;
}
