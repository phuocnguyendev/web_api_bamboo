import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto, UpdateStockDto, ResetStockDto } from './dto';
import { ApiQuery, ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ResponseMessage } from 'src/core';
import { SUCCESS } from 'src/constants';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { exportInvalidStocksExcel } from './helpers/stock.excel';

@ApiTags('Stock')
@Controller('Stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('Create')
  @ResponseMessage(SUCCESS)
  create(@Body() createStockDto: CreateStockDto) {
    return this.stockService.create(createStockDto);
  }

  @Get('GetAllStocks')
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
    return this.stockService.findAll(
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  @Get('GetStockById/:id')
  @ResponseMessage(SUCCESS)
  findOne(@Param('id') id: string) {
    return this.stockService.findOne(id);
  }

  @Get('GetStockByWarehouse')
  @ResponseMessage(SUCCESS)
  @ApiQuery({
    name: 'warehouseId',
    required: true,
    type: String,
  })
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
  findByWarehouse(
    @Query('warehouseId') warehouseId: string,
    @Query('searchText') searchText: string = '',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 30,
  ) {
    return this.stockService.findByWarehouse(
      warehouseId,
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  @Get('GetStockByProduct')
  @ResponseMessage(SUCCESS)
  @ApiQuery({
    name: 'productId',
    required: true,
    type: String,
  })
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
  findByProduct(
    @Query('productId') productId: string,
    @Query('searchText') searchText: string = '',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 30,
  ) {
    return this.stockService.findByProduct(
      productId,
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  @Get('GetLowStock')
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
  getLowStock(
    @Query('searchText') searchText: string = '',
    @Query('page') page: number = 1,
    @Query('pageSize') pageSize: number = 30,
  ) {
    return this.stockService.getLowStock(
      Number(page),
      Number(pageSize),
      searchText,
    );
  }

  @Get('GetStockSummary')
  @ResponseMessage(SUCCESS)
  getStockSummary() {
    return this.stockService.getStockSummary();
  }

  @Put('UpdateStock')
  @ResponseMessage(SUCCESS)
  update(@Body() updateStockDto: UpdateStockDto) {
    return this.stockService.update(updateStockDto);
  }

  @Put('ResetStock')
  @ResponseMessage(SUCCESS)
  resetStock(@Body() resetStockDto: ResetStockDto) {
    return this.stockService.resetStock(resetStockDto);
  }

  @Delete('DeleteStock/:id')
  @ResponseMessage(SUCCESS)
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
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
    return this.stockService.importExcel(file.buffer);
  }

  @Post('InsertMany')
  @ResponseMessage(SUCCESS)
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'array',
        items: { type: 'string' },
      },
    },
  })
  async insertMany(@Body() items: any[][]) {
    return this.stockService.insertMany(items);
  }

  @Post('DownloadInvalidStock')
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          RowIndex: { type: 'number' },
          ErrorMessage: { type: 'string' },
          ErrorCells: { type: 'array', items: { type: 'number' } },
          CellValues: { type: 'array', items: { type: 'string' } },
        },
      },
    },
  })
  async downloadInvalidStock(
    @Body() invalidStocks: any[],
    @Res() res: Response,
  ) {
    const filePath = 'src/assets/files/InvalidStock.xlsx';
    await exportInvalidStocksExcel(invalidStocks, filePath);
    return res.download(filePath);
  }

  @Get('DownloadTemplate')
  @ResponseMessage(SUCCESS)
  async exportSample(@Res() res: Response) {
    const filePath = 'src/assets/files/DanhSachTonKho.xlsx';
    await this.stockService.exportSampleExcel(filePath);
    res.download(filePath);
  }
}
