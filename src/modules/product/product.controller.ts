import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core';
import { SUCCESS } from 'src/constants';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ResponseMessage(SUCCESS)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Post('Import')
  @ResponseMessage(SUCCESS)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  async importExcel(@UploadedFile() file: any) {
    if (!file || !file.buffer)
      throw new BadRequestException(
        'No file uploaded or wrong field name. Please upload with field name "file".',
      );
    return this.productService.importExcel(file.buffer);
  }

  @Get('DownloadInvalidProduct')
  @ResponseMessage(SUCCESS)
  async downloadInvalidProduct(@Res() res: Response) {
    const filePath = 'src/assets/files/InvalidProduct.xlsx';
    res.download(filePath);
  }

  @Get('DownloadTemplate')
  @ResponseMessage(SUCCESS)
  async exportSample(@Res() res: Response) {
    const filePath = 'src/assets/files/DanhSachSanPham.xlsx';
    await this.productService.exportSampleExcel(filePath);
    res.download(filePath);
  }

  @Get()
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
    @Query('searchText') searchText: string = '',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 30,
  ) {
    return this.productService.findAll(
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   return this.productService.findOne(id);
  // }

  // @Patch(':id')
  // async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
  //   return this.productService.update(id, dto);
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return this.productService.remove(id);
  // }
}
