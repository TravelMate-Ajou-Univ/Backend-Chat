import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  InternalServerErrorException,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotFoundError, firstValueFrom } from 'rxjs';

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

  async findUserByToken(token: string) {
    try {
      const baseUrl = this.configService.get<string>('API_SERVER_URL');
      const url = `${baseUrl}/users/me`;

      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            Authorization: token,
          },
        }),
      );

      return data;
    } catch (error) {
      return null;
    }
  }

  async findUserById(userId: number) {
    try {
      const baseUrl = this.configService.get<string>('API_SERVER_URL');
      const url = `${baseUrl}/users/${userId}`;

      const { data } = await firstValueFrom(this.httpService.get(url));

      return data;
    } catch (error) {
      throw new NotFoundException('존재하지 않는 회원입니다.');
    }
  }
}
