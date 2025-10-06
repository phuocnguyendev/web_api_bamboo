import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StockMovementService } from './stock-movement.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Controller('stock-movement')
export class StockMovementController {
  constructor(private readonly stockMovementService: StockMovementService) {}

  @Post()
  create(@Body() createStockMovementDto: CreateStockMovementDto) {
    return this.stockMovementService.create(createStockMovementDto);
  }

  @Get()
  findAll() {
    return this.stockMovementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockMovementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStockMovementDto: UpdateStockMovementDto) {
    return this.stockMovementService.update(+id, updateStockMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.stockMovementService.remove(+id);
  }
}
