import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AuthUser } from './types/auth-user.type';
import { TokenPayload } from './types/token-payload.type';

type RequestWithUser = {
  headers: Record<string, string | string[] | undefined>;
  user?: AuthUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Token de acceso requerido');
    }

    try {
      const payload = await this.jwtService.verifyAsync<TokenPayload>(token);
      const user = await this.usersService.findActiveById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Sesion no valida');
      }

      request.user = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  private extractBearerToken(
    authorization: string | string[] | undefined,
  ): string | null {
    if (typeof authorization !== 'string') {
      return null;
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
