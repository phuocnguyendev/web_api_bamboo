import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  UserCreateData,
  UserResponse,
  UserResponseWithRole,
  UserWithRole,
} from './interfaces/user.interface';
import { UserRepository } from './repositories';
import { UniqueUserValidator } from './validators';
import { IUserResponse } from './dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly uniqueValidator: UniqueUserValidator,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    await this.uniqueValidator.validate('Email', createUserDto.Email);

    const hashedPassword = await bcrypt.hash(createUserDto.Password, 10);

    const userData: UserCreateData = {
      ...createUserDto,
      Password: hashedPassword,
    };

    const user = await this.userRepository.create({
      data: userData,
    });

    return user;
  }

  async update(data: UpdateUserDto): Promise<UserResponse> {
    const user = await this.uniqueValidator.ensureUserExists(data.Id);

    if (data.Email && data.Email !== user.Email)
      await this.uniqueValidator.validate('Email', data.Email, data.Id);

    const updatedUser = await this.userRepository.updateUser(data.Id, data);

    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return updatedUser;
  }

  async findOne(id: string): Promise<UserResponseWithRole> {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findAll(
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<IUserResponse> {
    const [data, count] = await this.userRepository.findAllUsers(
      page,
      pageSize,
      searchText,
    );

    return new IUserResponse(data, count);
  }

  async remove(id: string) {
    await this.uniqueValidator.ensureUserExists(id);

    await this.userRepository.delete({
      where: { Id: id },
    });

    return {};
  }
  async removeMany(ids: string[]) {
    const removedUsers: UserResponse[] = [];
    for (const id of ids) {
      await this.uniqueValidator.ensureUserExists(id);
      const deletedUser = await this.userRepository.delete({
        where: { Id: id },
      });
      removedUsers.push(deletedUser);
    }
    return {};
  }
  async findUserToLogin(email: string): Promise<UserWithRole | null> {
    return await this.userRepository.findByEmail(email);
  }
}
