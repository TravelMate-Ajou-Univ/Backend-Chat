import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findUsersByIds(userIds: number[]) {
    const baseUrl = this.configService.get<string>('API_SERVER_URL');
    const queryParams = userIds.map((id) => `userIds=${id}`).join('&');
    const url = `${baseUrl}/users?${queryParams}`;
    const { data } = await firstValueFrom(this.httpService.get(url));
    return data;
  }

  async findUserById(userId: number) {
    const baseUrl = this.configService.get<string>('API_SERVER_URL');
    const url = `${baseUrl}/users?userIds=${userId}`;
    const { data } = await firstValueFrom(this.httpService.get(url));
    return data;
  }
}
