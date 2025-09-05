import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SUCCESS } from 'src/constants';
import { ResponseMessage } from 'src/core/customize';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/authResponse.dto';
import { CreateAuthDto } from './dto/create-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('Login')
  @ResponseMessage(SUCCESS)
  async login(@Body() createUserDto: CreateAuthDto): Promise<AuthResponseDto> {
    return this.authService.login(createUserDto);
  }

  @Public()
  @Post('RefreshToken')
  @ResponseMessage(SUCCESS)
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }
}
