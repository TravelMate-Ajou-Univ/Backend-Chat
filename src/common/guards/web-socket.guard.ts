import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

export interface JwtPayload {
  id: number;
  nickname: string;
  profileImageUrl: string | null;
  profileImageId: number | null;
}

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const token = context.switchToWs().getClient().handshake.auth.token;

    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      return new Promise(async (resolve, reject) => {
        const user = await this.userService.findUserByToken(token);
        if (user) {
          context.switchToWs().getData().user = user; // save user info to a user object.
          resolve(Boolean(user));
        } else {
          reject('unauthorized');
        }
      });
    } catch (ex) {
      throw new WsException(ex.message);
    }
  }
}
