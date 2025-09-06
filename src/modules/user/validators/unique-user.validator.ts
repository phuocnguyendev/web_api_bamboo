import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserData, UserResponse } from '../interfaces/user.interface';
import { UserRepository } from '../repositories';

@Injectable()
export class UniqueUserValidator {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(
    field: 'Email',
    value: string,
    excludeId?: string,
  ): Promise<void> {
    if (!value) return;

    let user: UserData | null = null;

    if (field === 'Email') {
      user = await this.userRepository.findByEmail(value);
    }

    if (user && user.Id !== excludeId) {
      throw new HttpException(
        `${field === 'Email'} ${value} đã tồn tại`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async ensureUserExists(id: string): Promise<UserData> {
    const user = await this.userRepository.findUnique({
      where: { Id: id },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  toUserResponse(user: UserData): UserResponse {
    return {
      Id: user.Id,
      Name: user.Name,
      Email: user.Email,
      Avatar_url: user.Avatar_url || null,
      Status: user.Status,
      Phone: user.Phone || null,
    };
  }
}
