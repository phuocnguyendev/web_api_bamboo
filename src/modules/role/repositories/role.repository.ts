import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import { RoleData, RoleResponse } from 'src/interfaces';
import { BaseRepository } from 'src/repository/baseRepository';

export const queryRole = {
  Id: true,
  Name: true,
  Code: true,
  LastUpdatedBy: true,
  LastUpdatedAt: true,
};

@Injectable()
export class RoleRepository extends BaseRepository<RoleData, any> {
  constructor(prisma: PrismaService) {
    super(prisma, prisma.role);
  }

  async findByCode(Code: string): Promise<RoleData | null> {
    return this.model.findUnique({
      where: { Code },
      select: queryRole,
    });
  }

  async findById(Id: string): Promise<RoleResponse | null> {
    return this.model.findUnique({
      where: { Id },
      select: queryRole,
    });
  }

  async findAllRoles(): Promise<RoleResponse[]> {
    return this.model.findMany({
      orderBy: { Id: 'asc' },
      select: queryRole,
    });
  }

  async createRole(data: {
    Name: string;
    Code: string;
    LastUpdatedBy?: string;
    LastUpdatedAt?: Date;
  }): Promise<RoleData> {
    return this.model.create({
      data,
      select: queryRole,
    });
  }

  async updateRole(
    Id: string,
    data: {
      Name: string;
      Code: string;
      LastUpdatedBy?: string;
      LastUpdatedAt?: Date;
    },
  ): Promise<RoleData> {
    return this.model.update({
      where: { Id },
      data,
      select: queryRole,
    });
  }

  async deleteRole(Id: string): Promise<RoleData> {
    return this.model.delete({
      where: { Id },
      select: queryRole,
    });
  }

  async getRoleWithPermissions(roleId: string) {
    return this.prisma.role.findUnique({
      where: { Id: roleId },
      include: {
        RolePermissions: {
          include: { Permission: true },
        },
      },
    });
  }

  async findRolesByPermissionId(permissionId: string) {
    return this.prisma.role.findMany({
      where: { RolePermissions: { some: { PermissionId: permissionId } } },
    });
  }
}
