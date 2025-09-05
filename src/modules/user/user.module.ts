import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repositories';
import { UniqueUserValidator } from './validators';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, PrismaService, UserRepository, UniqueUserValidator],
  exports: [UserRepository],
})
export class UserModule {}
