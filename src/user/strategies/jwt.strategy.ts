import {
  ExecutionContext,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user.service';

interface JwtPayload {
  id: number;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status: any,
  ) {
    if (info && info.message === 'jwt expired') {
      throw new HttpException('토큰이 만료되었습니다.', 401);
    }

    return super.handleRequest(err, user, info, context, status);
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    protected readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.JWT_SECRET'),
      signOptions: {
        expiresIn: configService.get<string | number>('jwt.JWT_EXPIRES_IN'),
      },
    });
  }

  async validate(payload: JwtPayload) {
    const id = payload.id;
    const user = await this.userService.findUserById(id);

    if (!user) {
      throw new NotFoundException('존재하지 않는 계정입니다.');
    }

    return user;
  }
}
