import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma/prisma.service';
import {
  PermissionCreateData,
  PermissionResponse,
  PermissionUpdateData,
} from './interfaces/permission.interface';
import { BaseResponse } from 'src/common/dto/base-response.dto';
import { IPermissionResponse } from './dto/IPermissionResponse';
@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: PermissionCreateData): Promise<PermissionResponse> {
    return this.prisma.permission.create({
      data,
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
    if (!permission_id) return null;
    return this.prisma.permission.findUnique({
      where: { Id: permission_id },
    }) as Promise<PermissionResponse | null>;
  }

  async findAll(
    page: number = 1,
    pageSize: number = 20,
    searchText: string = '',
  ): Promise<IPermissionResponse> {
    const where: any = {};
    if (searchText) {
      where.OR = [
        { Name: { contains: searchText, mode: 'insensitive' } },
        { Code: { contains: searchText, mode: 'insensitive' } },
      ];
    }
    const data = await this.prisma.permission.findMany({
      where,
      orderBy: [{ LastUpdatedAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    const count = await this.prisma.permission.count({ where });
    return new BaseResponse(data, count);
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

  async assignPermissions(roleId: string, permissionIds: string[]) {
    const data = permissionIds.map((pid) => ({
      RoleId: roleId,
      PermissionId: pid,
    }));
    return this.prisma.rolePermission.createMany({ data });
  }

  async getRolePermissions(roleId: string): Promise<PermissionResponse[]> {
    const rolePermissions = await this.prisma.rolePermission.findMany({
      where: { RoleId: roleId },
      include: { Permission: true },
    });
    // Trả về mảng permission chuẩn
    return rolePermissions.map((rp) => rp.Permission);
  }

  async clearRolePermissions(roleId: string) {
    return this.prisma.rolePermission.deleteMany({
      where: { RoleId: roleId },
    });
  }
}
