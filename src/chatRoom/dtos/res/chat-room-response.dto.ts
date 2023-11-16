import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ChatRoomDto } from '../chat-room.dto';

export type UserInfo = {
  id: number;
  nickname: string;
  profileImageId: string | null;
};

export class ChatRoomResponseDto {
  constructor(chatRoom: ChatRoomDto, members: UserInfo[]) {
    this.chatRoom = chatRoom;
    this.members = members;
  }
  @ApiProperty({
    description: '채팅방 정보',
  })
  @Expose()
  chatRoom: ChatRoomDto;

  @ApiProperty({
    example: [
      {
        id: 1,
        nickname: 'asd',
        profileImageId: null,
      },
    ],
    description: '채팅방 멤버들 정보',
  })
  @Expose()
  members: UserInfo[];
}
