import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePermissionDto, UpdatePermissionDto } from './dto';
import { PermissionService } from './permission.service';
import { ResponseMessage } from 'src/core';
import { SUCCESS } from 'src/constants';
import {
  PermissionResponse,
  PermissionData,
} from './interfaces/permission.interface';
import { BaseResponse } from 'src/common/dto/base-response.dto';

@ApiTags('Permission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('Permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('Create')
  @ApiOperation({ summary: 'Create a permission' })
  @ResponseMessage(SUCCESS)
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponse> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('GetAll')
  @ApiOperation({ summary: 'Get all permissions' })
  @ResponseMessage(SUCCESS)
  async findAll(): Promise<BaseResponse<PermissionData>> {
    return this.permissionService.findAll();
  }

  @Get('GetById/:id')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ResponseMessage(SUCCESS)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PermissionResponse> {
    return this.permissionService.findById(id);
  }

  @Patch('Update/:id')
  @ApiOperation({ summary: 'Update a permission by ID' })
  @ResponseMessage(SUCCESS)
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponse> {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete('Delete/:id')
  @ApiOperation({ summary: 'Delete a permission by ID' })
  @ResponseMessage(SUCCESS)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: true }> {
    await this.permissionService.delete(id);
    return { deleted: true };
  }

  @Get('GetPermissionsByRole/:roleId')
  @ApiOperation({ summary: 'Get permissions by roleId (legacy endpoint)' })
  @ResponseMessage(SUCCESS)
  async findByRoleId(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ): Promise<PermissionResponse[]> {
    return this.permissionService.findByRoleId(roleId);
  }

  @Post('roles/:roleId/permissions')
  @ApiOperation({
    summary:
      'Assign a set of permissions to a role (overwrite or upsert by service logic)',
  })
  @ResponseMessage(SUCCESS)
  async assignPermissions(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Body() body: { permissionIds: string[] },
  ): Promise<{ assigned: true; count: number }> {
    const { permissionIds } = body;
    await this.permissionService.assignPermissions(roleId, permissionIds);
    return { assigned: true, count: permissionIds?.length ?? 0 };
  }

  @Post('roles/:roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Add a permission to a role' })
  @ResponseMessage(SUCCESS)
  async addPermissionToRole(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Param('permissionId', new ParseUUIDPipe()) permissionId: string,
  ): Promise<{ added: true }> {
    await this.permissionService.addPermissionToRole(roleId, permissionId);
    return { added: true };
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @ApiOperation({ summary: 'Remove a permission from a role' })
  @ResponseMessage(SUCCESS)
  async removePermissionFromRole(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Param('permissionId', new ParseUUIDPipe()) permissionId: string,
  ): Promise<{ removed: true }> {
    await this.permissionService.removePermissionFromRole(roleId, permissionId);
    return { removed: true };
  }

  @Delete('roles/:roleId/permissions')
  @ApiOperation({ summary: 'Clear all permissions from a role' })
  @ResponseMessage(SUCCESS)
  async clearRolePermissions(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ): Promise<{ cleared: true }> {
    await this.permissionService.clearRolePermissions(roleId);
    return { cleared: true };
  }
}
