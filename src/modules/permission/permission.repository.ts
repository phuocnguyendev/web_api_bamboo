import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import {
  PermissionCreateData,
  PermissionResponse,
  PermissionUpdateData,
  RolePermissionWithPermission,
} from './interfaces/permission.interface';
@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: PermissionCreateData): Promise<PermissionResponse> {
    return this.prisma.permission.create({
      data,
      skipDuplicates: true,
    }) as Promise<PermissionResponse>;
  }

  async update(
    permission_id: string,
    data: PermissionUpdateData,
  ): Promise<PermissionResponse> {
    return this.prisma.permission.update({
      where: { Id: permission_id },
      data,
    }) as Promise<PermissionResponse>;
  }

  async delete(permission_id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { Id: permission_id },
    });
  }
  async findById(permission_id: string): Promise<PermissionResponse | null> {
    return this.prisma.permission.findUnique({
      where: { Id: permission_id },
    }) as Promise<PermissionResponse | null>;
  }

  async findAll(): Promise<PermissionResponse[]> {
    return this.prisma.permission.findMany({
      orderBy: {
        created_at: 'desc',
      },
    }) as Promise<PermissionResponse[]>;
  }

  async findByRoleId(roleId: string): Promise<PermissionResponse[]> {
    return this.prisma.permission.findMany({
      where: {
        RolePermissions: {
          some: {
            RoleId: roleId,
          },
        },
      },
    });
  }

  async findByCode(code: string): Promise<PermissionResponse | null> {
    return this.prisma.permission.findUnique({
      where: { Code: code },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.delete({
      where: {
        RoleId_PermissionId: {
          RoleId: roleId,
          PermissionId: permissionId,
        },
      },
    });
  }

  async addPermissionToRole(roleId: string, permissionId: string) {
    return this.prisma.rolePermission.create({
      data: {
        RoleId: roleId,
        PermissionId: permissionId,
      },
    });
  }

  // Thêm phương thức gán nhiều permission cho một role
  async assignPermissions(roleId: string, permissionIds: string[]) {
    const data = permissionIds.map((pid) => ({
      RoleId: roleId,
      PermissionId: pid,
    }));
    return this.prisma.rolePermission.createMany({ data });
  }

  async getRolePermissions(roleId: string): Promise<Permissions[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { RoleId: roleId },
      include: { Permission: true },
    });

    const typedRolePermissions =
      rolePermissions as RolePermissionWithPermission[];
    return typedRolePermissions.map((rp) => rp.Permission);
  }

  async clearRolePermissions(roleId: string) {
    return this.prisma.rolePermission.deleteMany({
      where: { RoleId: roleId },
    });
  }
}
