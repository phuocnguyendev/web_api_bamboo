import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import {
  PermissionCreateData,
  PermissionResponse,
  PermissionUpdateData,
} from './interfaces/permission.interface';
import { PermissionRepository } from './permission.repository';
import { IPermissionResponse } from './dto/IPermissionResponse';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async findById(permission_id: string): Promise<PermissionResponse> {
    const permission = await this.permissionRepository.findById(permission_id);
    if (!permission) {
      throw new NotFoundException(
        `Permission with ID ${permission_id} not found`,
      );
    }
    return permission;
  }

  async findAll(): Promise<IPermissionResponse> {
    return this.permissionRepository.findAll();
  }

  async findByRoleId(roleId: string): Promise<PermissionResponse[]> {
    return this.permissionRepository.findByRoleId(roleId);
  }

  async create(createData: CreatePermissionDto): Promise<PermissionResponse> {
    const existed = await this.permissionRepository.findByCode(createData.Code);
    if (existed) {
      throw new BadRequestException(
        `Permission code đã tồn tại với mã: ${createData.Code}`,
      );
    }
    const permissionData: PermissionCreateData = {
      Code: createData.Code,
      Name: createData.Name,
    };
    return this.permissionRepository.create(permissionData);
  }

  async update(
    permission_id: string,
    updateData: Partial<PermissionUpdateData>,
  ): Promise<PermissionResponse> {
    const existing = await this.permissionRepository.findById(permission_id);
    if (!existing) {
      throw new NotFoundException(
        `Permission với ID ${permission_id} không tồn tại`,
      );
    }
    if (updateData.Code && updateData.Code !== existing.Code) {
      const existed = await this.permissionRepository.findByCode(
        updateData.Code,
      );
      if (existed) {
        throw new BadRequestException(
          `Permission code đã tồn tại với mã: ${updateData.Code}`,
        );
      }
    }

    if (updateData.Code !== undefined && updateData.Name !== undefined) {
      return this.permissionRepository.update(permission_id, {
        Code: updateData.Code,
        Name: updateData.Name,
      });
    } else if (updateData.Code !== undefined) {
      return this.permissionRepository.update(permission_id, {
        Code: updateData.Code,
        Name: existing.Name,
      });
    } else if (updateData.Name !== undefined) {
      return this.permissionRepository.update(permission_id, {
        Code: existing.Code,
        Name: updateData.Name,
      });
    } else {
      return existing;
    }
  }

  async delete(permission_id: string): Promise<void> {
    const existing = await this.permissionRepository.findById(permission_id);
    if (!existing) {
      throw new NotFoundException(
        `Permission with ID ${permission_id} not found`,
      );
    }
    await this.permissionRepository.delete(permission_id);
  }

  async deleteByRoleId(roleId: string): Promise<void> {
    await this.permissionRepository.clearRolePermissions(roleId);
  }

  async addPermissionToRole(roleId: string, permissionId: string) {
    return this.permissionRepository.addPermissionToRole(roleId, permissionId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    return this.permissionRepository.removePermissionFromRole(
      roleId,
      permissionId,
    );
  }

  async assignPermissions(roleId: string, permissionIds: string[]) {
    return this.permissionRepository.assignPermissions(roleId, permissionIds);
  }

  async getRolePermissions(roleId: string) {
    return this.permissionRepository.getRolePermissions(roleId);
  }

  async clearRolePermissions(roleId: string) {
    return this.permissionRepository.clearRolePermissions(roleId);
  }
}
