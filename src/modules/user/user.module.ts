import { Module } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './repositories';
import { UniqueUserValidator } from './validators';
import { PermissionService } from '../permission/permission.service';
import { PermissionRepository } from '../permission/permission.repository';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    UserRepository,
    UniqueUserValidator,
    PermissionService,
    PermissionRepository,
  ],
  exports: [UserRepository],
})
export class UserModule {}
