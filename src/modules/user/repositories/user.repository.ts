import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { UserData, UserResponse, UserWithRole } from 'src/interfaces';
import { queryRole } from 'src/modules/role/repositories';
import { BaseRepository } from 'src/repository/baseRepository';

@Injectable()
export class UserRepository extends BaseRepository<UserData, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.user);
  }

  async findByEmail(Email: string): Promise<UserWithRole | null> {
    return this.model.findUnique({
      where: { Email },
      include: {
        Role: {
          select: queryRole,
        },
      },
    });
  }

  async findByUsername(Name: string): Promise<UserData | null> {
    return this.model.findUnique({ where: { Name } });
  }

  async findAllUsers(
    page: number,
    pageSize: number,
    searchText?: string,
  ): Promise<[UserResponse[], number]> {
    const skip = (page - 1) * pageSize;
    const where = searchText
      ? { Name: { contains: searchText, mode: 'insensitive' } }
      : undefined;

    const [data, count] = await Promise.all([
      this.model.findMany({
        skip,
        take: pageSize,
        where,
        select: {
          Id: true,
          Name: true,
          Email: true,
          Avatar_url: true,
          Status: true,
          Phone: true,
        },
      }),
      this.model.count({ where }),
    ]);

    return [data, count];
  }

  async findUserById(Id: string): Promise<UserResponse | null> {
    return this.model.findUnique({
      where: { Id: Id },
      select: {
        Id: true,
        Name: true,
        Email: true,
        Avatar_url: true,
        Status: true,
        Phone: true,
      },
    });
  }

  async findUserByIdWithRole(Id: string): Promise<UserWithRole | null> {
    return this.model.findUnique({
      where: { Id: Id },
      include: {
        Role: {
          select: queryRole,
        },
      },
    });
  }
}
