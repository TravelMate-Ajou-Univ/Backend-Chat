import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateChatRoomDto {
  @ApiProperty({
    example: '강릉갈 김준하, 홍성표, 조진수',
    description: '채팅방 이름',
    required: true,
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: '채팅방 멤버들 userId',
    required: true,
  })
  @Expose()
  memberIds: number[];
}
