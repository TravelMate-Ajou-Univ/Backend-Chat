import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CursorBasePaginationDto {
  @ApiProperty({
    description: '다음번부터 읽어와야 할 채팅 id',
    example: 'asdasd12312sd',
  })
  @IsString()
  cursor?: string;

  @ApiProperty({
    description: '몇개씩 가져올지',
    example: 20,
  })
  limit: number = 20;
}
