// ...existing code...
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
  Query,
  Put,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { exportInvalidStudentsExcel } from './helpers/product.excel';
import { CreateProductDto, UpdateProductDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core';
import { SUCCESS } from 'src/constants';

@ApiTags('Product')
@Controller('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('Create')
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

  @Post('InsertMany')
  @ResponseMessage(SUCCESS)
  @ApiBody({ type: [CreateProductDto] })
  async insertMany(@Body() products: CreateProductDto[]) {
    return this.productService.insertMany(products);
  }

  @Post('DownloadInvalidProduct')
  @ApiBody({
    schema: {
      type: 'array',
      items: { type: 'object' },
    },
  })
  async downloadInvalidProduct(
    @Body() invalidStudents: any[],
    @Res() res: Response,
  ) {
    const filePath = 'src/assets/files/InvalidProduct.xlsx';
    await exportInvalidStudentsExcel(invalidStudents, filePath);
    return res.download(filePath);
  }

  @Get('DownloadTemplate')
  @ResponseMessage(SUCCESS)
  async exportSample(@Res() res: Response) {
    const filePath = 'src/assets/files/DanhSachSanPham.xlsx';
    await this.productService.exportSampleExcel(filePath);
    res.download(filePath);
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

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Put('Update')
  @ResponseMessage(SUCCESS)
  @ApiBody({ type: UpdateProductDto })
  async update(@Body() dto: UpdateProductDto) {
    return this.productService.update(dto);
  }

  @Delete(':id')
  @ResponseMessage(SUCCESS)
  async remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
