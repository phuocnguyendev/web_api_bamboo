import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { AuthResponseDto } from './dto/authResponse.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthUser, JwtPayload } from './interfaces/auth.interface';
import { queryRole } from '../role/repositories';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly AUTH_USER_SELECT = {
    Id: true,
    Email: true,
    Name: true,
    RoleId: true,
    Status: true,
    Phone: true,
    Avatar_url: true,
    CreatedAt: true,
    UpdatedAt: true,
    Password: true,
    Role: { select: queryRole },
  } as const;

  private mapToAuthUser(user: any): AuthUser {
    return {
      Id: user.Id,
      Email: user.Email,
      Name: user.Name,
      RoleId: user.RoleId,
      Status: user.Status,
      Phone: user.Phone,
      Avatar_url: user.Avatar_url,
      CreatedAt: user.CreatedAt,
      UpdatedAt: user.UpdatedAt,
      Role: user.Role,
    };
  }

  private createAccessToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.Id,
      role: user.Role?.Code,
      iss: 'bamboo_hat_ms',
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_KEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE'),
    });
  }

  private createRefreshToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.Id,
      role: user.Role?.Code,
      iss: 'bamboo_hat_ms',
    };
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_KEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    });
  }

  private createTokens(user: AuthUser): AuthResponseDto {
    return {
      accessToken: this.createAccessToken(user),
      refreshToken: this.createRefreshToken(user),
    };
  }

  async login({ Email, Password }: CreateAuthDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { Email },
      select: this.AUTH_USER_SELECT,
    });

    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }

    if (!user.Password || !(await bcrypt.compare(Password, user.Password))) {
      throw new HttpException('Mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
    }

    const authUser = this.mapToAuthUser(user);
    return this.createTokens(authUser);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_KEY'),
      });

      const user = await this.prisma.user.findUnique({
        where: { Id: payload.sub },
        select: this.AUTH_USER_SELECT,
      });

      if (!user) {
        throw new HttpException(
          'Không tìm thấy người dùng',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const authUser = this.mapToAuthUser(user);
      return this.createTokens(authUser);
    } catch {
      throw new HttpException(
        'Refresh token không hợp lệ',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { Email: email },
        select: this.AUTH_USER_SELECT,
      });
      if (!user || !user.Password) return null;

      const ok = await bcrypt.compare(password, user.Password);
      if (!ok) return null;

      return this.mapToAuthUser(user);
    } catch {
      return null;
    }
  }
}
