import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { Warehouse, WarehouseResponse } from './interfaces/warehouse.interface';
import { BaseResponse } from 'src/common/dto/base-response.dto';
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
  async getProductsInWarehouse(
    warehouseId,
    page = 1,
    pageSize = 30,
    searchText = '',
  ) {
    const result = await this.warehouseRepository.getProductsInWarehouse(
      warehouseId,
      page,
      pageSize,
      searchText,
    );
    const data = Array.isArray(result[0]) ? result[0] : [];
    const count = typeof result[1] === 'number' ? result[1] : 0;
    return new BaseResponse(data, count);
  }

  async transferProduct({
    fromWarehouseId,
    toWarehouseId,
    productId,
    quantity,
  }) {
    // Kiểm tra tồn tại kho, sản phẩm, số lượng đủ
    const fromStock = await this.warehouseRepository.getStock(
      fromWarehouseId,
      productId,
    );
    if (!fromStock || fromStock.QtyOnHand < quantity) {
      throw new ConflictException('Số lượng tồn kho không đủ');
    }
    // Trừ kho nguồn
    await this.warehouseRepository.updateStockQty(
      fromWarehouseId,
      productId,
      -quantity,
    );
    // Cộng kho đích
    await this.warehouseRepository.updateStockQty(
      toWarehouseId,
      productId,
      quantity,
    );
    return {
      success: true,
      fromWarehouseId,
      toWarehouseId,
      productId,
      quantity,
    };
  }
}
