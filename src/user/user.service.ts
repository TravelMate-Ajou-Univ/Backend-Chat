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

  async findUserById(userId: number) {
    const url =
      this.configService.get<string>('API_SERVER_URL') + `/users/${userId}`;
    const { data } = await firstValueFrom(this.httpService.get(url));
    return data;
  }
}
