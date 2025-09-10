import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ensureFieldUnique } from 'src/common/db.validator';
import { UserData } from '../interfaces/user.interface';
import { UserRepository } from '../repositories';

@Injectable()
export class UniqueUserValidator {
  constructor(private readonly userRepository: UserRepository) {}

  async validate(
    field: 'Email',
    value: string,
    excludeId?: string,
  ): Promise<void> {
    await ensureFieldUnique(
      this.userRepository,
      field,
      value,
      'Email',
      excludeId,
    );
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
}
