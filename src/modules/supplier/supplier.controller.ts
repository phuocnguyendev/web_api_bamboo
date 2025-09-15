import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core';
import { SUCCESS } from 'src/constants';

@ApiTags('Supplier')
@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post('Create')
  @ResponseMessage(SUCCESS)
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.supplierService.create(createSupplierDto);
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
    return this.supplierService.findAll(
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  findOne(@Param('id') id: string) {
    return this.supplierService.findOne(id);
  }

  @Put('Update')
  @ResponseMessage(SUCCESS)
  update(@Body() updateSupplierDto: UpdateSupplierDto) {
    return this.supplierService.update(updateSupplierDto);
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}
