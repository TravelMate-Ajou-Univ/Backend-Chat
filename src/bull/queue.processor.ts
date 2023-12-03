import { HttpService } from '@nestjs/axios';
import { Process, Processor } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Job } from 'bull';
import { firstValueFrom } from 'rxjs';
import { ChatService } from 'src/chat/chat.service';

@Processor('chat')
export class ChatProcessor {
  constructor(
    private readonly chatService: ChatService,
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Process('send-message')
  async handleMessage(job: Job) {
    await this.chatService.createChat(job.data);
  }

  // @Process('post-bookmark')
  // async handleBookmark(job: Job) {
  //   const { locationsWithContent, bookmarkCollectionId, token } = job.data;

  //   const url =
  //     this.configService.get<string>('API_SERVER_URL') +
  //     `/chat-room/bookmark-collection/${bookmarkCollectionId}/bookmarks`;

  //   await firstValueFrom(
  //     this.http.post(
  //       url,
  //       { locationsWithContent },
  //       {
  //         headers: {
  //           Authorization: token,
  //         },
  //       },
  //     ),
  //   );
  // }

  @Process('delete-bookmark')
  async deleteBookmark(job: Job) {
    const { bookmarkCollectionId, bookmarkIds, token } = job.data;

    const url =
      this.configService.get<string>('API_SERVER_URL') +
      `/chat-room/bookmark-collection/${bookmarkCollectionId}/remove-bookmarks`;

    await firstValueFrom(
      this.http.post(
        url,
        { bookmarkIds },
        {
          headers: {
            Authorization: token,
          },
        },
      ),
    );
  }
}
