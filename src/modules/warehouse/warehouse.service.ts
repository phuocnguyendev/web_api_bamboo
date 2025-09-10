import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { Warehouse, WarehouseResponse } from './interfaces/warehouse.interface';
import { WarehouseRepository } from './repositories/warehouse.repository';
import { WarehouseValidator } from './validators/warehouse.validator';
import {
  ChangeWarehouseStatusDto,
  CreateWarehouseDto,
  IWarehouseResponse,
  UpdateWarehouseDto,
} from './dto';

@Injectable()
export class WarehouseService {
  constructor(
    private readonly warehouseRepository: WarehouseRepository,
    private readonly warehouseValidator: WarehouseValidator,
  ) {}

  async create(createWarehouseDto: CreateWarehouseDto): Promise<Warehouse> {
    const errors = await this.warehouseValidator.checkWarehouseUniqueFields(
      createWarehouseDto,
      this.warehouseRepository,
    );
    if (errors.length > 0) {
      const msg = errors.map((e) => `${e.Property}: ${e.Message}`).join('; ');
      throw new ConflictException(msg);
    }
    const warehouse =
      await this.warehouseRepository.createWarehouse(createWarehouseDto);
    return warehouse;
  }

  async findAll(
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<IWarehouseResponse> {
    const [data, count] = await this.warehouseRepository.findAllWarehouse(
      page,
      pageSize,
      searchText,
    );
    return new IWarehouseResponse(data, count);
  }

  async findOne(id: string): Promise<WarehouseResponse | null> {
    const findWarehouse = this.warehouseRepository.findOneById(id);
    if (!findWarehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return findWarehouse;
  }

  async update(updateWarehouseDto: UpdateWarehouseDto) {
    const errors = await this.warehouseValidator.checkWarehouseUniqueFields(
      updateWarehouseDto,
      this.warehouseRepository,
    );
    if (errors.length > 0) {
      const msg = errors.map((e) => `${e.Property}: ${e.Message}`).join('; ');
      throw new ConflictException(msg);
    }
    const updateWarehouse = await this.warehouseRepository.updateWarehouse(
      updateWarehouseDto.Id,
      updateWarehouseDto,
    );
    return updateWarehouse;
  }

  async remove(id: string) {
    return this.warehouseRepository.deleteWarehouse(id);
  }

  async ChangeWarehouseStatuses(dto: ChangeWarehouseStatusDto) {
    const ids = await this.warehouseRepository.changeStatus(dto);
    return ids;
  }
}

// GetProductsInWarehouse
// TransferProduct
