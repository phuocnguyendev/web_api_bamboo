import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { StockMovementService } from './stock-movement.service';
import {
  CreateStockMovementDto,
  UpdateStockMovementDto,
  FilterStockMovementDto,
  StockMovementStatsDto,
} from './dto';
import {
  StockMovementResponse,
  StockMovementStats,
} from './interfaces/stock_movement.interface';
import { StockMovementHelper } from './helpers/stock-movement.helper';
import { IStockMovementResponse } from './dto/response';
import { ResponseMessage } from 'src/core';
import { SUCCESS } from 'src/constants';

@ApiTags('Stock-Movement')
@Controller('StockMovement')
export class StockMovementController {
  @Post('InsertMany')
  @ResponseMessage(SUCCESS)
  async insertMany(@Body() items: any[][]) {
    return this.stockMovementService.insertMany(items);
  }
  constructor(private readonly stockMovementService: StockMovementService) {}

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
  async getAllStockMovements(
    @Query() filterDto: FilterStockMovementDto,
  ): Promise<IStockMovementResponse> {
    return this.stockMovementService.getAllStockMovements(filterDto);
  }

  @Get('GetById/:id')
  @ResponseMessage(SUCCESS)
  async getStockMovementById(
    @Param('id') id: string,
  ): Promise<StockMovementResponse> {
    return this.stockMovementService.getStockMovementById(id);
  }

  @Get('GetByProduct/:productId')
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
  async getStockMovementsByProduct(
    @Param('productId') productId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('searchText') searchText?: string,
  ): Promise<IStockMovementResponse> {
    return this.stockMovementService.getStockMovementsByProduct(
      productId,
      page,
      pageSize,
      searchText,
    );
  }

  @Get('GetByWarehouse/:warehouseId')
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
  async getStockMovementsByWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('searchText') searchText?: string,
  ): Promise<IStockMovementResponse> {
    return this.stockMovementService.getStockMovementsByWarehouse(
      warehouseId,
      page,
      pageSize,
      searchText,
    );
  }

  @Post('Create')
  @ResponseMessage(SUCCESS)
  async createStockMovement(
    @Body() createDto: CreateStockMovementDto,
  ): Promise<StockMovementResponse> {
    return this.stockMovementService.createStockMovement(createDto);
  }

  @Put('Update/:id')
  @ResponseMessage(SUCCESS)
  async updateStockMovement(
    @Param('id') id: string,
    @Body() updateDto: UpdateStockMovementDto,
  ): Promise<StockMovementResponse> {
    return this.stockMovementService.updateStockMovement(id, updateDto);
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  async deleteStockMovement(@Param('id') id: string): Promise<void> {
    return this.stockMovementService.deleteStockMovement(id);
  }

  @Get('Stats/summary')
  @ResponseMessage(SUCCESS)
  async getStockMovementStats(
    @Query() statsDto: StockMovementStatsDto,
  ): Promise<StockMovementStats> {
    return this.stockMovementService.getStockMovementStats(statsDto);
  }

  @Get('Export/Excel')
  @ResponseMessage(SUCCESS)
  async exportStockMovementExcel(
    @Query() filterDto: FilterStockMovementDto,
    @Res() res: Response,
  ) {
    try {
      const buffer =
        await this.stockMovementService.exportStockMovementExcel(filterDto);

      const filename = StockMovementHelper.generateExcelFilename(
        'lich-su-di-chuyen-kho',
      );

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Lỗi khi xuất file Excel',
        error: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Get('Import/DownloadTemplate')
  @ResponseMessage(SUCCESS)
  async getImportTemplate(@Res() res: Response) {
    try {
      const buffer = await this.stockMovementService.getImportTemplate();
      const filename = StockMovementHelper.generateExcelFilename(
        'template-import-stock-movement',
      );

      res.set({
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length,
      });

      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Lỗi khi tạo template Excel',
        error: error.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  @Post('Import/Excel')
  @ResponseMessage(SUCCESS)
  async importStockMovementsFromExcel(@Body() body: { buffer: Buffer }) {
    return this.stockMovementService.importStockMovementsFromExcel(body.buffer);
  }
}
