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
  Query,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
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
  @ResponseMessage(SUCCESS)
  async create(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponse> {
    return this.permissionService.create(createPermissionDto);
  }

  @Get('GetAll')
  @ResponseMessage(SUCCESS)
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'searchText',
    required: false,
    type: String,
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 20,
    @Query('searchText') searchText: string = '',
  ): Promise<BaseResponse<PermissionData>> {
    return this.permissionService.findAll(
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<PermissionResponse> {
    return this.permissionService.findById(id);
  }

  @Put('Update')
  @ResponseMessage(SUCCESS)
  @ApiBody({ type: UpdatePermissionDto })
  async update(
    @Body() updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionResponse> {
    return this.permissionService.update(
      updatePermissionDto.Id,
      updatePermissionDto,
    );
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ deleted: true }> {
    await this.permissionService.delete(id);
    return { deleted: true };
  }

  @Get('GetPermissionsByRole/:roleId')
  @ResponseMessage(SUCCESS)
  async findByRoleId(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ): Promise<PermissionResponse[]> {
    return this.permissionService.findByRoleId(roleId);
  }

  @Post('roles/:roleId/permissions')
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
  @ResponseMessage(SUCCESS)
  async addPermissionToRole(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Param('permissionId', new ParseUUIDPipe()) permissionId: string,
  ): Promise<{ added: true }> {
    await this.permissionService.addPermissionToRole(roleId, permissionId);
    return { added: true };
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  @ResponseMessage(SUCCESS)
  async removePermissionFromRole(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
    @Param('permissionId', new ParseUUIDPipe()) permissionId: string,
  ): Promise<{ removed: true }> {
    await this.permissionService.removePermissionFromRole(roleId, permissionId);
    return { removed: true };
  }

  @Delete('roles/:roleId/permissions')
  @ResponseMessage(SUCCESS)
  async clearRolePermissions(
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ): Promise<{ cleared: true }> {
    await this.permissionService.clearRolePermissions(roleId);
    return { cleared: true };
  }
}
