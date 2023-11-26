import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatRoom, ChatRoomSchema } from 'src/schemas/chat-room.schema';
import { ChatRoomController } from './chat-room.controller';
import { ChatRoomService } from './chat-room.service';
import { UserModule } from 'src/user/user.module';
import { ChatModule } from 'src/chat/chat.module';
import { ChatRoomRepository } from './chat-room.repository';
import { HttpModule } from '@nestjs/axios';
import { ExitRecordModule } from 'src/exitRecord/exit-record.module';

@Module({
  imports: [
    forwardRef(() => ChatModule),
    UserModule,
    MongooseModule.forFeature([
      { name: ChatRoom.name, schema: ChatRoomSchema },
    ]),
    HttpModule,
    ExitRecordModule,
  ],
  controllers: [ChatRoomController],
  providers: [ChatRoomService, ChatRoomRepository],
  exports: [ChatRoomService, ChatRoomRepository],
})
export class ChatRoomModule {}
