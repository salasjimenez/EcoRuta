import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, hash, truncates } from 'bcryptjs';
import { QueryFailedError } from 'typeorm';
import { User } from '../users/user.entity';
import { UserRole } from '../users/user-role.enum';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from './types/auth-user.type';
import { PublicAccountType } from './types/public-account-type.enum';
import { TokenPayload } from './types/token-payload.type';

@Injectable()
export class AuthService {
  private readonly passwordRounds = 12;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    if (truncates(dto.password)) {
      throw new BadRequestException(
        'La contrasena supera el limite seguro admitido por bcrypt',
      );
    }

    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Ya existe una cuenta con ese correo');
    }

    const passwordHash = await hash(dto.password, this.passwordRounds);
    const role =
      dto.accountType === PublicAccountType.COMPANY
        ? UserRole.COMPANY
        : UserRole.TRANSPORTER;

    try {
      const user = await this.usersService.create({
        fullName: dto.fullName.trim(),
        email,
        passwordHash,
        role,
      });

      return this.createSession(user);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Ya existe una cuenta con ese correo');
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Correo o contrasena incorrectos');
    }

    const passwordMatches = await compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Correo o contrasena incorrectos');
    }

    return this.createSession(user);
  }

  private async createSession(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
    };
    const expiresIn = this.config.get<number>('JWT_EXPIRES_SECONDS') ?? 7200;
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as { code?: string } | undefined;
    return driverError?.code === '23505';
  }
}
