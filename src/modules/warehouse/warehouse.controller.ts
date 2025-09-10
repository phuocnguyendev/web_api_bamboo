import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core';
import { SUCCESS } from 'src/constants';
import {
  ChangeWarehouseStatusDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
} from './dto';

@ApiTags('Warehouse')
@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('Create')
  @ResponseMessage(SUCCESS)
  create(@Body() createWarehouseDto: CreateWarehouseDto) {
    return this.warehouseService.create(createWarehouseDto);
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
    return this.warehouseService.findAll(
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  findOne(@Param('id') id: string) {
    return this.warehouseService.findOne(id);
  }

  @Put('Update')
  @ResponseMessage(SUCCESS)
  update(@Body() updateWarehouseDto: UpdateWarehouseDto) {
    return this.warehouseService.update(updateWarehouseDto);
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  remove(@Param('id') id: string) {
    return this.warehouseService.remove(id);
  }

  @Post('ChangeStatus')
  @ResponseMessage(SUCCESS)
  changeStatuses(@Body() body: ChangeWarehouseStatusDto) {
    return this.warehouseService.ChangeWarehouseStatuses(body);
  }
}
