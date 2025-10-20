import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SUCCESS } from 'src/constants/message.constant';
import { ResponseMessage } from 'src/core/customize';

import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { RoleResponse } from 'src/interfaces';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Role')
@Controller('Role')
export class RoleController {
  constructor(private readonly rolesService: RoleService) {}

  @Post('Create')
  @Public()
  @ResponseMessage(SUCCESS)
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Headers('x-updated-by') updatedBy?: string,
  ): Promise<RoleResponse> {
    return this.rolesService.create(createRoleDto, updatedBy || 'system');
  }

  @Get('GetAll')
  @Public()
  @ResponseMessage(SUCCESS)
  async findAll(): Promise<RoleResponse[]> {
    return this.rolesService.findAll();
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  async findOne(@Param('id') Id: string): Promise<RoleResponse> {
    return this.rolesService.findOne(Id);
  }

  @Put('Update')
  @ResponseMessage(SUCCESS)
  async update(
    @Body() updateRoleDto: UpdateRoleDto,
    @Headers('x-updated-by') updatedBy?: string,
  ): Promise<RoleResponse> {
    return this.rolesService.update(updateRoleDto, updatedBy || 'system');
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  async remove(
    @Param('id') Id: string,
    @Headers('x-updated-by') updatedBy?: string,
  ) {
    return this.rolesService.remove(Id, updatedBy || 'system');
  }
  @Get('GetOptions')
  @ResponseMessage(SUCCESS)
  async getOptions(): Promise<{ label: string; value: string }[]> {
    const roles: RoleResponse[] = await this.rolesService.findAll();
    return roles.map((role) => ({ label: role.Name, value: role.Id }));
  }
}
