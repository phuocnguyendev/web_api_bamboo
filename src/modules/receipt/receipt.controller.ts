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
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ExportReceiptDto } from './dto/export-receipt.dto';
import { FilterReceiptDto } from './dto/filter-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import {
  exportInvalidReceiptsExcel,
  exportReceiptExcelSample,
} from './helpers/receipt.excel';
import { ReceiptService } from './receipt.service';

@ApiTags('Receipt')
@Controller('Receipt')
export class ReceiptController {
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
    return this.receiptService.insertMany(items);
  }
  constructor(private readonly receiptService: ReceiptService) {}

  @Post('Create')
  @ResponseMessage(SUCCESS)
  async create(@Body() createReceiptDto: CreateReceiptDto) {
    return this.receiptService.create(createReceiptDto);
  }

  @Put('Update/:id')
  @ResponseMessage(SUCCESS)
  async update(
    @Param('id') id: string,
    @Body() updateReceiptDto: UpdateReceiptDto,
  ) {
    return this.receiptService.update(id, updateReceiptDto);
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  async remove(@Param('id') id: string) {
    return this.receiptService.remove(id);
  }

  @Get('GetAll')
  @ResponseMessage(SUCCESS)
  async findAll(@Query() filter: FilterReceiptDto) {
    return this.receiptService.findAll(filter);
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  async findOne(@Param('id') id: string) {
    return this.receiptService.findOne(id);
  }

  @Get('GetByItem/:id/items')
  @ResponseMessage(SUCCESS)
  async getItems(@Param('id') id: string) {
    return this.receiptService.getItems(id);
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
    return this.receiptService.importExcel(file.buffer);
  }

  @Post('DownloadInvalidReceipt')
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
  async downloadInvalidReceipt(
    @Body() invalidReceipts: any[],
    @Res() res: Response,
  ) {
    const filePath = 'src/assets/files/InvalidReceipt.xlsx';
    await exportInvalidReceiptsExcel(invalidReceipts, filePath);
    return res.download(filePath);
  }

  @Get('DownloadTemplate')
  @ResponseMessage(SUCCESS)
  async exportSample(@Res() res: Response) {
    const filePath = 'src/assets/files/DanhSachPhieuNhap.xlsx';
    await exportReceiptExcelSample(filePath);
    res.download(filePath);
  }

  @Post('Export')
  @ResponseMessage(SUCCESS)
  async exportExcel(@Body() dto: ExportReceiptDto, @Res() res: Response) {
    const filePath = await this.receiptService.exportExcel(dto);
    res.download(filePath);
  }
}
