import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StockMovementRepository } from './repositories/stock_movement.repositoriy';
import { StockMovementValidator } from './validators/stock_movement.validator';
import { StockMovementHelper } from './helpers/stock-movement.helper';
import { IStockMovementResponse } from './dto/response';
import {
  CreateStockMovementDto,
  UpdateStockMovementDto,
  FilterStockMovementDto,
  StockMovementStatsDto,
} from './dto';
import {
  StockMovementResponse,
  StockMovementStats,
  StockMovementFilter,
  StockMovementType,
} from './interfaces/stock_movement.interface';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class StockMovementService {
  constructor(
    private readonly stockMovementRepository: StockMovementRepository,
    private readonly stockMovementValidator: StockMovementValidator,
  ) {}

  async getAllStockMovements(
    filterDto: FilterStockMovementDto,
  ): Promise<IStockMovementResponse> {
    const { page = 1, pageSize = 10, searchText, ...filterOptions } = filterDto;

    const filter: StockMovementFilter = {
      type: filterOptions.type,
      refType: filterOptions.refType,
      warehouseId: filterOptions.warehouseId,
      warehouseToId: filterOptions.warehouseToId,
      productId: filterOptions.productId,
      createdBy: filterOptions.createdBy,
      startDate: filterOptions.startDate
        ? new Date(filterOptions.startDate)
        : undefined,
      endDate: filterOptions.endDate
        ? new Date(filterOptions.endDate)
        : undefined,
    };

    const [data, totalRecords] =
      await this.stockMovementRepository.findAllStockMovements(
        page,
        pageSize,
        searchText,
        filter,
      );

    return new IStockMovementResponse(data, totalRecords);
  }

  async getStockMovementById(id: string): Promise<StockMovementResponse> {
    const movement =
      await this.stockMovementRepository.findStockMovementById(id);

    if (!movement) {
      throw new NotFoundException(
        `Không tìm thấy phiếu di chuyển kho với ID: ${id}`,
      );
    }

    return movement;
  }

  async getStockMovementsByProduct(
    productId: string,
    page: number = 1,
    pageSize: number = 10,
    searchText?: string,
  ): Promise<IStockMovementResponse> {
    const [data, totalRecords] =
      await this.stockMovementRepository.findStockMovementsByProduct(
        productId,
        page,
        pageSize,
        searchText,
      );

    return new IStockMovementResponse(data, totalRecords);
  }

  async getStockMovementsByWarehouse(
    warehouseId: string,
    page: number = 1,
    pageSize: number = 10,
    searchText?: string,
  ): Promise<IStockMovementResponse> {
    const [data, totalRecords] =
      await this.stockMovementRepository.findStockMovementsByWarehouse(
        warehouseId,
        page,
        pageSize,
        searchText,
      );

    return new IStockMovementResponse(data, totalRecords);
  }

  async createStockMovement(
    createDto: CreateStockMovementDto,
  ): Promise<StockMovementResponse> {
    const createData = {
      Type: createDto.Type,
      RefType: createDto.RefType,
      RefId: createDto.RefId,
      WarehouseId: createDto.WarehouseId,
      WarehouseToId: createDto.WarehouseToId,
      ProductId: createDto.ProductId,
      Qty: createDto.Qty,
      UnitCost: createDto.UnitCost
        ? new Decimal(createDto.UnitCost)
        : undefined,
      Reason: createDto.Reason,
      OccurredAt: new Date(createDto.OccurredAt),
      CreatedBy: createDto.CreatedBy,
    };

    await this.stockMovementValidator.validateCreateData(createData);

    const movement =
      await this.stockMovementRepository.createStockMovement(createData);

    return movement;
  }

  async updateStockMovement(
    id: string,
    updateDto: UpdateStockMovementDto,
  ): Promise<StockMovementResponse> {
    const existingMovement =
      await this.stockMovementRepository.findStockMovementById(id);

    if (!existingMovement) {
      throw new NotFoundException(
        `Không tìm thấy phiếu di chuyển kho với ID: ${id}`,
      );
    }

    // Prepare update data
    const updateData = {
      Type: updateDto.Type,
      RefType: updateDto.RefType,
      RefId: updateDto.RefId,
      WarehouseId: updateDto.WarehouseId,
      WarehouseToId: updateDto.WarehouseToId,
      ProductId: updateDto.ProductId,
      Qty: updateDto.Qty,
      UnitCost: updateDto.UnitCost
        ? new Decimal(updateDto.UnitCost)
        : undefined,
      Reason: updateDto.Reason,
      OccurredAt: updateDto.OccurredAt
        ? new Date(updateDto.OccurredAt)
        : undefined,
    };

    // Validate the update data
    await this.stockMovementValidator.validateUpdateData(id, updateData);

    const movement = await this.stockMovementRepository.updateStockMovement(
      id,
      updateData,
    );

    return movement;
  }

  async deleteStockMovement(id: string): Promise<void> {
    await this.stockMovementValidator.validateDeletion(id);

    await this.stockMovementRepository.deleteStockMovement(id);
  }

  async getStockMovementStats(
    statsDto: StockMovementStatsDto,
  ): Promise<StockMovementStats> {
    const stats = await this.stockMovementRepository.getStockMovementStats(
      statsDto.startDate ? new Date(statsDto.startDate) : undefined,
      statsDto.endDate ? new Date(statsDto.endDate) : undefined,
      statsDto.warehouseId,
      statsDto.productId,
      statsDto.type,
    );

    return stats;
  }

  async exportStockMovementExcel(
    filterDto: FilterStockMovementDto,
  ): Promise<Buffer> {
    const filter: StockMovementFilter = {
      type: filterDto.type,
      refType: filterDto.refType,
      warehouseId: filterDto.warehouseId,
      warehouseToId: filterDto.warehouseToId,
      productId: filterDto.productId,
      createdBy: filterDto.createdBy,
      startDate: filterDto.startDate
        ? new Date(filterDto.startDate)
        : undefined,
      endDate: filterDto.endDate ? new Date(filterDto.endDate) : undefined,
    };

    const [movements] =
      await this.stockMovementRepository.findAllStockMovements(
        1,
        10000,
        filterDto.searchText,
        filter,
      );

    // Use helper to generate Excel buffer
    return StockMovementHelper.exportMovementsToExcel(movements);
  }

  /**
   * Get Excel import template
   */
  async getImportTemplate(): Promise<Buffer> {
    return StockMovementHelper.createImportTemplate();
  }

  /**
   * Import stock movements from Excel file
   */
  async importStockMovementsFromExcel(buffer: Buffer): Promise<{
    successCount: number;
    errorCount: number;
    errors: Array<{
      row: number;
      data: any;
      errors: string[];
    }>;
  }> {
    const { validMovements, invalidMovements } =
      StockMovementHelper.parseMovementExcel(buffer);

    let successCount = 0;

    // Process valid movements
    for (const movementData of validMovements) {
      try {
        await this.stockMovementValidator.validateCreateData(movementData);
        await this.stockMovementRepository.createStockMovement(movementData);
        successCount++;
      } catch (error) {
        // Add to invalid movements if validation fails
        invalidMovements.push({
          row: -1, // Will need to track row number properly
          data: movementData,
          errors: [error.message || 'Validation error'],
        });
      }
    }

    return {
      successCount,
      errorCount: invalidMovements.length,
      errors: invalidMovements,
    };
  }

  private getMovementTypeText(type: StockMovementType): string {
    return StockMovementHelper.getMovementTypeText(type);
  }
}
