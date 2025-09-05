import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { AuthResponseDto } from './dto/authResponse.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthUser, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private createAccessToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.user_id,
      role: user.role?.role_name,
      iss: 'dipstick',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_KEY'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRE'),
    });
  }

  private createRefreshToken(user: AuthUser): string {
    const payload: JwtPayload = {
      sub: user.user_id,
      role: user.role?.role_name,
      iss: 'dipstick',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_KEY'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE'),
    });
  }

  async login(createAuthDto: CreateAuthDto): Promise<AuthResponseDto> {
    const { email, password } = createAuthDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: {
            role_id: true,
            role_name: true,
          },
        },
      },
    });

    if (!user) {
      throw new HttpException('Người dùng không tồn tại', HttpStatus.NOT_FOUND);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException('Mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
    }

    // Convert to AuthUser type
    const authUser: AuthUser = {
      user_id: user.user_id,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
      center_id: user.center_id,
      role: user.role,
    };

    const accessToken = this.createAccessToken(authUser);
    const refreshToken = this.createRefreshToken(authUser);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload: JwtPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_KEY'),
      });

      const user = await this.prisma.user.findUnique({
        where: { user_id: payload.sub },
        include: {
          role: {
            select: {
              role_id: true,
              role_name: true,
            },
          },
        },
      });

      if (!user) {
        throw new HttpException(
          'Refresh token không hợp lệ',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Convert to AuthUser type
      const authUser: AuthUser = {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role_id: user.role_id,
        center_id: user.center_id,
        role: user.role,
      };

      return {
        accessToken: this.createAccessToken(authUser),
        refreshToken: this.createRefreshToken(authUser),
      };
    } catch (error) {
      throw new HttpException(
        'Refresh token không hợp lệ',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateUser(email: string, password: string): Promise<AuthUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          role: {
            select: {
              role_id: true,
              role_name: true,
            },
          },
        },
      });

      if (!user || !user.password) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return {
        user_id: user.user_id,
        email: user.email,
        username: user.username,
        role_id: user.role_id,
        center_id: user.center_id,
        role: user.role,
      };
    } catch (error) {
      return null;
    }
  }
}
