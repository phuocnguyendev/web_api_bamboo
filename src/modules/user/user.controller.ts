import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SUCCESS } from 'src/constants/message.constant';
import { ResponseMessage } from 'src/core/customize';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Public } from '../auth/decorators/public.decorator';
import { PermissionService } from '../permission/permission.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User')
@Controller('User')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
  ) {}

  @Post('Create')
  @Public()
  @ResponseMessage(SUCCESS)
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
  findAll(
    @Query('searchText') searchText: string = '',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 30,
  ) {
    return this.userService.findAll(Number(page), Number(pageSize), searchText);
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put('Update')
  @ResponseMessage(SUCCESS)
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(updateUserDto);
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/GetListPermissionItemByUserId/:id')
  @ResponseMessage(SUCCESS)
  async getUserPermissions(@Param('id') id: string) {
    const user = await this.userService.findOne(id);
    if (!user || !user.Id) {
      return {
        permissions: [],
      };
    }
    const userWithRole: any = user;
    const roleId = userWithRole.RoleId || user.RoleId;
    if (!roleId) {
      return {
        permissions: [],
      };
    }
    const permissions = await this.permissionService.getRolePermissions(roleId);
    return {
      permissions: permissions.map((p) => p.Code),
    };
  }
}
