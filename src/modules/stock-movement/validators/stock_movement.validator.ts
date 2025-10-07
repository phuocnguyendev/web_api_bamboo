import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/config/prisma/prisma.service';
import {
  StockMovementType,
  StockMovementRefType,
  StockMovementCreateData,
  StockMovementUpdateData,
} from '../interfaces/stock_movement.interface';

@Injectable()
export class StockMovementValidator {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Validate stock movement data before creation
   */
  async validateCreateData(data: StockMovementCreateData): Promise<void> {
    await this.validateBasicData(data);
    await this.validateBusinessRules(data);
  }

  /**
   * Validate stock movement data before update
   */
  async validateUpdateData(
    id: string,
    data: StockMovementUpdateData,
  ): Promise<void> {
    // Check if movement exists
    const existingMovement = await this.prisma.stockMovement.findUnique({
      where: { Id: id },
    });

    if (!existingMovement) {
      throw new BadRequestException(
        `Không tìm thấy phiếu di chuyển với ID: ${id}`,
      );
    }

    // Validate basic data if provided
    if (data.WarehouseId || data.ProductId || data.WarehouseToId) {
      await this.validateBasicData(data as any);
    }

    // Validate business rules
    await this.validateBusinessRules(data, existingMovement);
  }

  /**
   * Validate basic data (warehouse, product existence)
   */
  private async validateBasicData(
    data: Partial<StockMovementCreateData>,
  ): Promise<void> {
    // Validate warehouse exists
    if (data.WarehouseId) {
      const warehouse = await this.prisma.warehouse.findUnique({
        where: { Id: data.WarehouseId },
      });

      if (!warehouse) {
        throw new BadRequestException(
          `Không tìm thấy kho với ID: ${data.WarehouseId}`,
        );
      }

      if (warehouse.Status !== 1) {
        throw new BadRequestException(`Kho ${warehouse.Name} không hoạt động`);
      }
    }

    // Validate destination warehouse exists (for transfers)
    if (data.WarehouseToId) {
      const warehouseTo = await this.prisma.warehouse.findUnique({
        where: { Id: data.WarehouseToId },
      });

      if (!warehouseTo) {
        throw new BadRequestException(
          `Không tìm thấy kho đích với ID: ${data.WarehouseToId}`,
        );
      }

      if (warehouseTo.Status !== 1) {
        throw new BadRequestException(
          `Kho đích ${warehouseTo.Name} không hoạt động`,
        );
      }

      // Cannot transfer to same warehouse
      if (data.WarehouseId === data.WarehouseToId) {
        throw new BadRequestException('Không thể chuyển hàng cùng một kho');
      }
    }

    // Validate product exists
    if (data.ProductId) {
      const product = await this.prisma.product.findUnique({
        where: { Id: data.ProductId },
      });

      if (!product) {
        throw new BadRequestException(
          `Không tìm thấy sản phẩm với ID: ${data.ProductId}`,
        );
      }

      if (!product.Status) {
        throw new BadRequestException(
          `Sản phẩm ${product.Name} không hoạt động`,
        );
      }
    }
  }

  /**
   * Validate business rules
   */
  private async validateBusinessRules(
    data: Partial<StockMovementCreateData>,
    existingMovement?: any,
  ): Promise<void> {
    const type = data.Type || existingMovement?.Type;
    const warehouseToId = data.WarehouseToId || existingMovement?.WarehouseToId;
    const qty = data.Qty || existingMovement?.Qty;
    const warehouseId = data.WarehouseId || existingMovement?.WarehouseId;
    const productId = data.ProductId || existingMovement?.ProductId;

    // Validate transfer movement
    if (type === StockMovementType.TRANSFER) {
      if (!warehouseToId) {
        throw new BadRequestException('Chuyển kho phải có kho đích');
      }
    } else {
      if (warehouseToId) {
        throw new BadRequestException('Chỉ chuyển kho mới có kho đích');
      }
    }

    // Validate quantity
    if (qty !== undefined && qty <= 0) {
      throw new BadRequestException('Số lượng phải lớn hơn 0');
    }

    // Validate OUT movement - check stock availability
    if (type === StockMovementType.OUT && warehouseId && productId && qty) {
      const stock = await this.prisma.stock.findUnique({
        where: {
          WarehouseId_ProductId: {
            WarehouseId: warehouseId,
            ProductId: productId,
          },
        },
      });

      if (!stock) {
        throw new BadRequestException(
          'Không có tồn kho cho sản phẩm này trong kho',
        );
      }

      const availableQty = stock.QtyOnHand - stock.QtyReserved;
      if (qty > availableQty) {
        throw new BadRequestException(
          `Số lượng xuất (${qty}) vượt quá tồn kho khả dụng (${availableQty})`,
        );
      }
    }

    // Validate TRANSFER movement - check stock availability
    if (
      type === StockMovementType.TRANSFER &&
      warehouseId &&
      productId &&
      qty
    ) {
      const stock = await this.prisma.stock.findUnique({
        where: {
          WarehouseId_ProductId: {
            WarehouseId: warehouseId,
            ProductId: productId,
          },
        },
      });

      if (!stock) {
        throw new BadRequestException(
          'Không có tồn kho cho sản phẩm này trong kho xuất',
        );
      }

      const availableQty = stock.QtyOnHand - stock.QtyReserved;
      if (qty > availableQty) {
        throw new BadRequestException(
          `Số lượng chuyển (${qty}) vượt quá tồn kho khả dụng (${availableQty})`,
        );
      }
    }
  }

  /**
   * Validate reference data consistency
   */
  async validateReferenceData(
    refType: StockMovementRefType,
    refId: string,
  ): Promise<void> {
    switch (refType) {
      case StockMovementRefType.RECEIPT:
        const receipt = await this.prisma.receipt.findUnique({
          where: { Id: refId },
        });
        if (!receipt) {
          throw new BadRequestException(
            `Không tìm thấy phiếu nhập với ID: ${refId}`,
          );
        }
        break;

      case StockMovementRefType.STOCK_OUT:
        const stockOut = await this.prisma.stockOutVoucher.findUnique({
          where: { Id: refId },
        });
        if (!stockOut) {
          throw new BadRequestException(
            `Không tìm thấy phiếu xuất với ID: ${refId}`,
          );
        }
        break;

      default:
        // Other reference types can be added here
        break;
    }
  }

  /**
   * Validate if movement can be deleted
   */
  async validateDeletion(id: string): Promise<void> {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { Id: id },
    });

    if (!movement) {
      throw new BadRequestException(
        `Không tìm thấy phiếu di chuyển với ID: ${id}`,
      );
    }

    // Check if movement is referenced by other documents
    if (movement.RefType && movement.RefId) {
      throw new BadRequestException(
        'Không thể xóa phiếu di chuyển đã được tham chiếu từ chứng từ khác',
      );
    }

    // Additional business rules for deletion can be added here
    // For example: check if it's within allowed time frame, user permissions, etc.
  }

  /**
   * Validate date ranges
   */
  validateDateRange(startDate?: Date, endDate?: Date): void {
    if (startDate && endDate) {
      if (startDate > endDate) {
        throw new BadRequestException(
          'Ngày bắt đầu không thể lớn hơn ngày kết thúc',
        );
      }

      // Check if date range is too large (e.g., more than 1 year)
      const daysDiff =
        Math.abs(endDate.getTime() - startDate.getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        throw new BadRequestException(
          'Khoảng thời gian không được vượt quá 365 ngày',
        );
      }
    }

    // Check if dates are not in the future (for occurred date)
    const now = new Date();
    if (startDate && startDate > now) {
      throw new BadRequestException('Ngày bắt đầu không thể ở tương lai');
    }
    if (endDate && endDate > now) {
      throw new BadRequestException('Ngày kết thúc không thể ở tương lai');
    }
  }

  /**
   * Validate pagination parameters
   */
  validatePagination(page: number, pageSize: number): void {
    if (page < 1) {
      throw new BadRequestException('Số trang phải lớn hơn hoặc bằng 1');
    }

    if (pageSize < 1 || pageSize > 100) {
      throw new BadRequestException('Số lượng mỗi trang phải từ 1 đến 100');
    }
  }
}
