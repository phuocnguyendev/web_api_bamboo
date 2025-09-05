import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseResponse } from '../../common/dto/base-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { PermissionResponse } from './interfaces/permission.interface';
import { PermissionService } from './permission.service';

@ApiTags('Permission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new permission' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Permission created successfully',
    type: BaseResponse<PermissionResponse>,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or permission already exists',
  })
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    try {
      const permission =
        await this.permissionService.create(createPermissionDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'Permission created successfully',
        data: permission,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all permissions' })
  @ApiQuery({
    name: 'role_id',
    required: false,
    description: 'Filter permissions by role ID',
  })
  @ApiQuery({
    name: 'resource_type',
    required: false,
    description: 'Filter permissions by resource type',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions retrieved successfully',
    type: BaseResponse<PermissionResponse[]>,
  })
  async findAll(
    @Query('role_id') role_id?: string,
    @Query('resource_type') resource_type?: string,
  ) {
    try {
      let permissions: PermissionResponse[];

      if (role_id && resource_type) {
        permissions = await this.permissionService.findByRoleAndResource(
          role_id,
          resource_type,
        );
      } else if (role_id) {
        permissions = await this.permissionService.findByRoleId(role_id);
      } else {
        permissions = await this.permissionService.findAll();
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Permissions retrieved successfully',
        data: permissions,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('by-resource')
  @ApiOperation({ summary: 'Get permissions grouped by resource type' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permissions grouped by resource retrieved successfully',
  })
  async getPermissionsByResource() {
    try {
      const permissions =
        await this.permissionService.getPermissionsByResource();
      return {
        statusCode: HttpStatus.OK,
        message: 'Permissions grouped by resource retrieved successfully',
        data: permissions,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get('types')
  @ApiOperation({ summary: 'Get available permission and resource types' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Available types retrieved successfully',
  })
  async getAvailableTypes() {
    try {
      const data = {
        permission_types: this.permissionService.getAvailablePermissionTypes(),
        resource_types: this.permissionService.getAvailableResourceTypes(),
      };

      return {
        statusCode: HttpStatus.OK,
        message: 'Available types retrieved successfully',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission retrieved successfully',
    type: BaseResponse<PermissionResponse>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  async findOne(@Param('id') id: string) {
    try {
      const permission = await this.permissionService.findById(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Permission retrieved successfully',
        data: permission,
      };
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission updated successfully',
    type: BaseResponse<PermissionResponse>,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or permission conflict',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    try {
      const permission = await this.permissionService.update(
        id,
        updatePermissionDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Permission updated successfully',
        data: permission,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete permission by ID' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Permission not found',
  })
  async remove(@Param('id') id: string) {
    try {
      await this.permissionService.delete(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Permission deleted successfully',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  @Delete('role/:role_id')
  @ApiOperation({ summary: 'Delete all permissions for a role' })
  @ApiParam({ name: 'role_id', description: 'Role ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All permissions for role deleted successfully',
  })
  async removeByRoleId(@Param('role_id') role_id: string) {
    try {
      await this.permissionService.deleteByRoleId(role_id);
      return {
        statusCode: HttpStatus.OK,
        message: 'All permissions for role deleted successfully',
        data: null,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('check')
  @ApiOperation({ summary: 'Check if a role has specific permission' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Permission check completed',
  })
  async checkPermission(
    @Body()
    checkData: {
      role_id: string;
      permission_type: string;
      resource_type: string;
    },
  ) {
    try {
      const hasPermission = await this.permissionService.hasPermission(
        checkData.role_id,
        checkData.permission_type,
        checkData.resource_type,
      );

      return {
        statusCode: HttpStatus.OK,
        message: 'Permission check completed',
        data: { has_permission: hasPermission },
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Create multiple permissions for a role' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Bulk permissions created successfully',
  })
  async createBulkPermissions(
    @Body()
    bulkData: {
      role_id: string;
      permissions: Array<{ permission_type: string; resource_type: string }>;
    },
  ) {
    try {
      const permissions = await this.permissionService.createBulkPermissions(
        bulkData.role_id,
        bulkData.permissions,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Bulk permissions created successfully',
        data: permissions,
      };
    } catch (error) {
      throw error;
    }
  }

  @Post('full-access')
  @ApiOperation({ summary: 'Grant full permissions for a role on a resource' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Full permissions granted successfully',
  })
  async setFullPermissions(
    @Body()
    fullAccessData: {
      role_id: string;
      resource_type: string;
    },
  ) {
    try {
      const permissions = await this.permissionService.setFullPermissions(
        fullAccessData.role_id,
        fullAccessData.resource_type,
      );

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Full permissions granted successfully',
        data: permissions,
      };
    } catch (error) {
      throw error;
    }
  }
}
