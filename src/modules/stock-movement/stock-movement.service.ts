import { Injectable } from '@nestjs/common';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { UpdateStockMovementDto } from './dto/update-stock-movement.dto';

@Injectable()
export class StockMovementService {
  create(createStockMovementDto: CreateStockMovementDto) {
    return 'This action adds a new stockMovement';
  }

  findAll() {
    return `This action returns all stockMovement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stockMovement`;
  }

  update(id: number, updateStockMovementDto: UpdateStockMovementDto) {
    return `This action updates a #${id} stockMovement`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockMovement`;
  }
}
