import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from '../product/repositories/product.repository';
import { StockRepository } from '../stock/repositories/stock.repository';
import { WarehouseRepository } from '../warehouse/repositories/warehouse.repository';
import { CreateStockOutVoucherDto } from './dto/create-stock-out-voucher.dto';
import { ExportStockOutVoucherDto } from './dto/export-stock-out-voucher.dto';
import { FilterStockOutVoucherDto } from './dto/filter-stock-out-voucher.dto';
import { UpdateStockOutVoucherDto } from './dto/update-stock-out-voucher.dto';
import { StockOutVoucherExcelHelper } from './helpers/stockOutVoucher.excel';
import { StockOutVoucherRepository } from './repositories/stock-out-voucher.repository';
import { StockOutVoucherValidator } from './validators/stock-out-voucher.validator';

@Injectable()
export class StockOutVoucherService {
  constructor(
    private readonly stockOutVoucherRepository: StockOutVoucherRepository,
    private readonly stockOutVoucherValidator: StockOutVoucherValidator,
    private readonly productRepository: ProductRepository,
    private readonly warehouseRepository: WarehouseRepository,
    private readonly stockRepository: StockRepository,
  ) {}

  async create(createDto: CreateStockOutVoucherDto) {
    const warehouse = createDto.WarehouseId
      ? await this.warehouseRepository.findOneById(createDto.WarehouseId)
      : null;
    if (!warehouse || warehouse.Status !== 1) {
      throw new ConflictException(
        'Warehouse không tồn tại hoặc không hoạt động',
      );
    }
    if (createDto.WarehouseToId) {
      const warehouseTo = await this.warehouseRepository.findOneById(
        createDto.WarehouseToId,
      );
      if (!warehouseTo || warehouseTo.Status !== 1) {
        throw new ConflictException(
          'WarehouseTo không tồn tại hoặc không hoạt động',
        );
      }
    }
    for (const item of createDto.Items) {
      const product = await this.productRepository.findProductById(
        item.ProductId,
      );
      if (!product || product.Status !== true) {
        throw new ConflictException(
          `Product ${item.ProductId} không tồn tại hoặc không hoạt động`,
        );
      }
      const stock = await this.stockRepository.findByWarehouseAndProduct(
        createDto.WarehouseId,
        item.ProductId,
      );
      if (!stock || stock.QtyOnHand < item.Qty) {
        throw new ConflictException(
          `Tồn kho sản phẩm ${item.ProductId} không đủ để xuất`,
        );
      }
    }
    return this.stockOutVoucherRepository.create(createDto);
  }

  async update(id: string, updateDto: UpdateStockOutVoucherDto) {
    const warehouse = updateDto.WarehouseId
      ? await this.warehouseRepository.findOneById(updateDto.WarehouseId)
      : null;
    if (!warehouse || warehouse.Status !== 1) {
      throw new ConflictException(
        'Warehouse không tồn tại hoặc không hoạt động',
      );
    }
    if (updateDto.WarehouseToId) {
      const warehouseTo = await this.warehouseRepository.findOneById(
        updateDto.WarehouseToId,
      );
      if (!warehouseTo || warehouseTo.Status !== 1) {
        throw new ConflictException(
          'WarehouseTo không tồn tại hoặc không hoạt động',
        );
      }
    }
    if (updateDto.Items) {
      for (const item of updateDto.Items) {
        const product = await this.productRepository.findProductById(
          item.ProductId,
        );
        if (!product || product.Status !== true) {
          throw new ConflictException(
            `Product ${item.ProductId} không tồn tại hoặc không hoạt động`,
          );
        }
        const stock = await this.stockRepository.findByWarehouseAndProduct(
          updateDto.WarehouseId!,
          item.ProductId,
        );
        if (!stock || stock.QtyOnHand < item.Qty) {
          throw new ConflictException(
            `Tồn kho sản phẩm ${item.ProductId} không đủ để xuất`,
          );
        }
      }
    }
    return this.stockOutVoucherRepository.update(id, updateDto);
  }

  async remove(id: string) {
    return this.stockOutVoucherRepository.delete(id);
  }

  async findAll(filter: FilterStockOutVoucherDto) {
    return this.stockOutVoucherRepository.findAll(filter);
  }

  async findOne(id: string) {
    const voucher = await this.stockOutVoucherRepository.findById(id);
    if (!voucher) throw new NotFoundException('StockOutVoucher not found');
    return voucher;
  }

  async getItems(id: string) {
    return this.stockOutVoucherRepository.getItems(id);
  }

  async importExcel(buffer: Buffer) {
    const importDtos = StockOutVoucherExcelHelper.parseImportExcel(buffer);
    if (!importDtos.length) {
      throw new BadRequestException('No data found in import file');
    }
    const {
      valid,
      invalid,
    }: { valid: CreateStockOutVoucherDto[]; invalid: any[] } =
      await this.stockOutVoucherValidator.validateImportBatch(importDtos[0]);
    if (invalid.length > 0) {
      const invalidBuffer =
        StockOutVoucherExcelHelper.exportInvalidExcel(invalid);
      throw new BadRequestException({
        message: 'Dữ liệu import không hợp lệ',
        errorFile: 'InvalidStockOutVoucher.xlsx',
        errors: invalid,
        fileBuffer: invalidBuffer,
      });
    }
    const results: any[] = [];
    for (const dto of valid) {
      results.push(await this.create(dto));
    }
    return { imported: results.length };
  }

  async exportExcel(dto: ExportStockOutVoucherDto): Promise<Buffer> {
    return StockOutVoucherExcelHelper.exportSampleExcel();
  }
}
