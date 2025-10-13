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

@Controller('StockOutItems')
export class StockOutItemController {
  constructor(private readonly stockOutItemService: StockOutItemService) {}

  @Post('Create')
  @ResponseMessage(SUCCESS)
  async create(@Body() dto: CreateStockOutItemDto) {
    return this.stockOutItemService.create(dto);
  }

  @Put('Update/:id')
  @ResponseMessage(SUCCESS)
  async update(@Param('id') id: string, @Body() dto: UpdateStockOutItemDto) {
    return this.stockOutItemService.update(id, dto);
  }

  @Delete('Delete/:id')
  @ResponseMessage(SUCCESS)
  async delete(@Param('id') id: string) {
    return this.stockOutItemService.delete(id);
  }

  @Get('GetAll')
  @ResponseMessage(SUCCESS)
  async findAll(@Query() filter: FilterStockOutItemDto) {
    return this.stockOutItemService.findAll(filter);
  }

  @Get('By-voucher/:voucherId')
  @ResponseMessage(SUCCESS)
  async findByVoucherId(@Param('voucherId') voucherId: string) {
    return this.stockOutItemService.findByVoucherId(voucherId);
  }

  @Get('By-product/:productId')
  @ResponseMessage(SUCCESS)
  async findByProductId(@Param('productId') productId: string) {
    return this.stockOutItemService.findByProductId(productId);
  }

  @Get('Report/by-product')
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

  @Get('Analytics/forecast-demand/:productId')
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

  @Get('Analytics/compare-price/:productId')
  @ResponseMessage(SUCCESS)
  async compareExportAndCurrentPrice(@Param('productId') productId: string) {
    return this.stockOutItemService.compareExportAndCurrentPrice(productId);
  }

  @Get('Analytics/audit-trail/:itemId')
  @ResponseMessage(SUCCESS)
  async getAuditTrail(@Param('itemId') itemId: string) {
    return this.stockOutItemService.getAuditTrail(itemId);
  }
}
