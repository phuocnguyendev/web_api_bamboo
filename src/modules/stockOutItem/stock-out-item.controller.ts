import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SUCCESS } from 'src/constants/message.constant';
import { ResponseMessage } from 'src/core/customize';
import { CreateStockOutItemDto } from './dto/create-stock-out-item.dto';
import { FilterStockOutItemDto } from './dto/filter-stock-out-item.dto';
import { UpdateStockOutItemDto } from './dto/update-stock-out-item.dto';
import { StockOutItemService } from './stock-out-item.service';

@Controller('stock-out-items')
export class StockOutItemController {
  constructor(private readonly stockOutItemService: StockOutItemService) {}

  @Post('create')
  @ResponseMessage(SUCCESS)
  async create(@Body() dto: CreateStockOutItemDto) {
    return this.stockOutItemService.create(dto);
  }

  @Put('update/:id')
  @ResponseMessage(SUCCESS)
  async update(@Param('id') id: string, @Body() dto: UpdateStockOutItemDto) {
    return this.stockOutItemService.update(id, dto);
  }

  @Delete('delete/:id')
  @ResponseMessage(SUCCESS)
  async delete(@Param('id') id: string) {
    return this.stockOutItemService.delete(id);
  }

  @Get('get-all')
  @ResponseMessage(SUCCESS)
  async findAll(@Query() filter: FilterStockOutItemDto) {
    return this.stockOutItemService.findAll(filter);
  }

  @Get('by-voucher/:voucherId')
  @ResponseMessage(SUCCESS)
  async findByVoucherId(@Param('voucherId') voucherId: string) {
    return this.stockOutItemService.findByVoucherId(voucherId);
  }

  @Get('by-product/:productId')
  @ResponseMessage(SUCCESS)
  async findByProductId(@Param('productId') productId: string) {
    return this.stockOutItemService.findByProductId(productId);
  }

  @Get('report/by-product')
  @ResponseMessage(SUCCESS)
  async reportByProduct(
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    return this.stockOutItemService.reportByProduct({
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    });
  }

  @Get('analytics/forecast-demand/:productId')
  @ResponseMessage(SUCCESS)
  async forecastProductDemand(
    @Param('productId') productId: string,
    @Query('months') months?: string,
  ) {
    return this.stockOutItemService.forecastProductDemand(
      productId,
      months ? Number(months) : undefined,
    );
  }

  @Get('analytics/compare-price/:productId')
  @ResponseMessage(SUCCESS)
  async compareExportAndCurrentPrice(@Param('productId') productId: string) {
    return this.stockOutItemService.compareExportAndCurrentPrice(productId);
  }

  @Get('analytics/audit-trail/:itemId')
  @ResponseMessage(SUCCESS)
  async getAuditTrail(@Param('itemId') itemId: string) {
    return this.stockOutItemService.getAuditTrail(itemId);
  }
}
