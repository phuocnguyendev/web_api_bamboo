import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import {
  PermissionCheck,
  PermissionCreateData,
  PermissionResponse,
  PermissionType,
  PermissionUpdateData,
  ResourceType,
} from './interfaces/permission.interface';
import { PermissionRepository } from './permission.repository';

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

  async findAll(): Promise<PermissionResponse[]> {
    return this.permissionRepository.findAll();
  }

  async findByRoleId(role_id: string): Promise<PermissionResponse[]> {
    return this.permissionRepository.findByRoleId(role_id);
  }

  async findByRoleAndResource(
    role_id: string,
    resource_type: string,
  ): Promise<PermissionResponse[]> {
    return this.permissionRepository.findByRoleAndResource(
      role_id,
      resource_type,
    );
  }

  async create(createData: CreatePermissionDto): Promise<PermissionResponse> {
    // Validate permission_type and resource_type
    if (
      !Object.values(PermissionType).includes(
        createData.permission_type as PermissionType,
      )
    ) {
      throw new BadRequestException(
        `Invalid permission type: ${createData.permission_type}`,
      );
    }

    if (
      !Object.values(ResourceType).includes(
        createData.resource_type as ResourceType,
      )
    ) {
      throw new BadRequestException(
        `Invalid resource type: ${createData.resource_type}`,
      );
    }

    // Check if permission already exists
    const exists = await this.permissionRepository.exists(
      createData.role_id,
      createData.permission_type,
      createData.resource_type,
    );

    if (exists) {
      throw new BadRequestException(
        `Permission already exists for role ${createData.role_id}, ` +
          `permission ${createData.permission_type}, resource ${createData.resource_type}`,
      );
    }

    const permissionData: PermissionCreateData = {
      role_id: createData.role_id,
      permission_type: createData.permission_type,
      resource_type: createData.resource_type,
    };

    return this.permissionRepository.create(permissionData);
  }

  async update(
    permission_id: string,
    updateData: UpdatePermissionDto,
  ): Promise<PermissionResponse> {
    const existing = await this.permissionRepository.findById(permission_id);
    if (!existing) {
      throw new NotFoundException(
        `Permission with ID ${permission_id} not found`,
      );
    }

    // Validate permission_type and resource_type if provided
    if (
      updateData.permission_type &&
      !Object.values(PermissionType).includes(
        updateData.permission_type as PermissionType,
      )
    ) {
      throw new BadRequestException(
        `Invalid permission type: ${updateData.permission_type}`,
      );
    }

    if (
      updateData.resource_type &&
      !Object.values(ResourceType).includes(
        updateData.resource_type as ResourceType,
      )
    ) {
      throw new BadRequestException(
        `Invalid resource type: ${updateData.resource_type}`,
      );
    }

    // Check for conflicts if updating key fields
    if (
      updateData.role_id ||
      updateData.permission_type ||
      updateData.resource_type
    ) {
      const role_id = updateData.role_id || existing.role_id;
      const permission_type =
        updateData.permission_type || existing.permission_type;
      const resource_type = updateData.resource_type || existing.resource_type;

      const conflicting = await this.permissionRepository.exists(
        role_id,
        permission_type,
        resource_type,
      );

      if (conflicting) {
        throw new BadRequestException(
          `Permission already exists for role ${role_id}, ` +
            `permission ${permission_type}, resource ${resource_type}`,
        );
      }
    }

    const permissionUpdateData: PermissionUpdateData = {
      role_id: updateData.role_id,
      permission_type: updateData.permission_type,
      resource_type: updateData.resource_type,
    };

    return this.permissionRepository.update(
      permission_id,
      permissionUpdateData,
    );
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

  async deleteByRoleId(role_id: string): Promise<void> {
    await this.permissionRepository.deleteByRoleId(role_id);
  }

  // Permission checking methods
  async checkPermission(check: PermissionCheck): Promise<boolean> {
    return this.permissionRepository.checkPermission(check);
  }

  async hasPermission(
    role_id: string,
    permission_type: string,
    resource_type: string,
  ): Promise<boolean> {
    return this.permissionRepository.checkPermission({
      role_id,
      permission_type,
      resource_type,
    });
  }

  // Bulk operations
  async createBulkPermissions(
    role_id: string,
    permissions: Array<{ permission_type: string; resource_type: string }>,
  ): Promise<PermissionResponse[]> {
    const results: PermissionResponse[] = [];

    for (const perm of permissions) {
      try {
        const createData: CreatePermissionDto = {
          role_id,
          permission_type: perm.permission_type,
          resource_type: perm.resource_type,
        };
        const created = await this.create(createData);
        results.push(created);
      } catch (error) {
        // Continue if permission already exists
        if (
          error instanceof BadRequestException &&
          error.message.includes('already exists')
        ) {
          continue;
        }
        throw error;
      }
    }

    return results;
  }

  // Set full permissions for a role on a resource
  async setFullPermissions(
    role_id: string,
    resource_type: string,
  ): Promise<PermissionResponse[]> {
    const fullPermissions = Object.values(PermissionType).map(
      (permission_type) => ({
        permission_type: permission_type as string,
        resource_type,
      }),
    );

    return this.createBulkPermissions(role_id, fullPermissions);
  }

  // Get permissions grouped by resource
  async getPermissionsByResource(): Promise<
    Record<string, PermissionResponse[]>
  > {
    return this.permissionRepository.getPermissionsByResource();
  }

  // Utility methods
  getAvailablePermissionTypes(): string[] {
    return Object.values(PermissionType);
  }

  getAvailableResourceTypes(): string[] {
    return Object.values(ResourceType);
  }
}
