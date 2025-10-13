import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { File as MulterFile } from 'multer';
import { SUCCESS } from 'src/constants';
import { ResponseMessage } from 'src/core';
import { CreateStockOutVoucherDto } from './dto/create-stock-out-voucher.dto';
import { ExportStockOutVoucherDto } from './dto/export-stock-out-voucher.dto';
import { FilterStockOutVoucherDto } from './dto/filter-stock-out-voucher.dto';
import { UpdateStockOutVoucherDto } from './dto/update-stock-out-voucher.dto';
import { StockOutVoucherExcelHelper } from './helpers/stockOutVoucher.excel';
import { StockOutVoucherService } from './stock-out-voucher.service';

@ApiTags('StockOutVoucher')
@Controller('StockOutVoucher')
export class StockOutVoucherController {
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
    return this.stockOutVoucherService.insertMany(items);
  }
  constructor(
    private readonly stockOutVoucherService: StockOutVoucherService,
  ) {}

  @Post('Create')
  @ResponseMessage(SUCCESS)
  async create(@Body() createDto: CreateStockOutVoucherDto) {
    return this.stockOutVoucherService.create(createDto);
  }

  @Put('Update/:id')
  @ResponseMessage(SUCCESS)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStockOutVoucherDto,
  ) {
    return this.stockOutVoucherService.update(id, updateDto);
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  async remove(@Param('id') id: string) {
    return this.stockOutVoucherService.remove(id);
  }

  @Get('GetAll')
  @ResponseMessage(SUCCESS)
  async findAll(@Query() filter: FilterStockOutVoucherDto) {
    return this.stockOutVoucherService.findAll(filter);
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  async findOne(@Param('id') id: string) {
    return this.stockOutVoucherService.findOne(id);
  }

  @Get('GetByItem/:id/items')
  @ResponseMessage(SUCCESS)
  async getItems(@Param('id') id: string) {
    return this.stockOutVoucherService.getItems(id);
  }

  @Post('Import')
  @ResponseMessage(SUCCESS)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  async importExcel(@UploadedFile() file: MulterFile) {
    if (!file || !file.buffer)
      throw new BadRequestException(
        'No file uploaded or wrong field name. Please upload with field name "file".',
      );
    return this.stockOutVoucherService.importExcel(file.buffer);
  }

  @Post('DownloadInvalidStockOutVoucher')
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
  async downloadInvalid(@Body() invalidRows: any[], @Res() res: Response) {
    const buffer = StockOutVoucherExcelHelper.exportInvalidExcel(invalidRows);
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=InvalidStockOutVoucher.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.end(buffer);
  }

  @Get('DownloadTemplate')
  @ResponseMessage(SUCCESS)
  async exportSample(@Res() res: Response) {
    const buffer = StockOutVoucherExcelHelper.exportSampleExcel();
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=StockOutVoucherTemplate.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.end(buffer);
  }

  @Post('Export')
  @ResponseMessage(SUCCESS)
  async exportExcel(
    @Body() dto: ExportStockOutVoucherDto,
    @Res() res: Response,
  ) {
    const buffer = await this.stockOutVoucherService.exportExcel(dto);
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=ExportedStockOutVouchers.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.end(buffer);
  }
}
