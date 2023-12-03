import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JwtPayload } from 'src/common/guards/web-socket.guard';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async verifyJwtToken(jwt: string): Promise<JwtPayload> {
    if (!jwt) {
      throw new UnauthorizedException();
    }
    try {
      return await this.jwtService.verifyAsync(jwt);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
