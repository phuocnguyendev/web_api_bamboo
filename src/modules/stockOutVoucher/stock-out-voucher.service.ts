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
  /**
   * Batch insert stock out vouchers from array of arrays (rows), similar to Receipt/Product insertMany
   * @param items Array of rows, each row is an array of voucher fields
   */
  async insertMany(items: any[][]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Danh sách phiếu xuất trống');
    }
    const validRows: CreateStockOutVoucherDto[] = [];
    const invalidRows: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const dto: any = {
        Code: row[0],
        WarehouseId: row[1],
        WarehouseToId: row[2],
        Type: row[3],
        Reason: row[4],
        IssuedAt: row[5],
        Status: row[6],
        Items: row[7] || [], // Items should be an array of CreateStockOutItemDto
      };
      // Validate using validator
      let errorList: string[] = [];
      const instance = Object.assign(
        new (require('./dto/create-stock-out-voucher.dto').CreateStockOutVoucherDto)(),
        dto,
      );
      const { validateSync } = require('class-validator');
      const validationErrors = validateSync(instance, { whitelist: true });
      if (validationErrors.length > 0) {
        errorList = validationErrors.map((e: any) =>
          Object.values(e.constraints || {}).join(', '),
        );
      }
      // TODO: Add unique code check if needed
      if (errorList.length > 0) {
        // Map error to errorCells (column indices)
        const errorCells: number[] = [];
        const errorMsgs: string[] = errorList;
        for (let j = 0; j < row.length; j++) errorCells.push(j);
        invalidRows.push({
          RowIndex: i,
          ErrorMessage: errorMsgs.join(', '),
          ErrorCells: errorCells,
          CellValues: row,
        });
      } else {
        validRows.push(dto);
      }
    }
    let inserted = 0;
    if (validRows.length > 0) {
      for (const dto of validRows) {
        await this.create(dto);
      }
      inserted = validRows.length;
    }
    return {
      InsertedCount: inserted,
      InvalidStockOutVouchers: invalidRows,
    };
  }
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
    // Flatten: assume importDtos is an array of ImportStockOutVoucherDto, each with vouchers: CreateStockOutVoucherDto[]
    const rows: any[][] = [];
    for (const importDto of importDtos) {
      if (Array.isArray(importDto.vouchers)) {
        for (const v of importDto.vouchers) {
          rows.push([
            v.Code,
            v.WarehouseId,
            v.WarehouseToId,
            v.Type,
            v.Reason,
            v.IssuedAt,
            v.Status,
            v.Items || [],
          ]);
        }
      }
    }
    const result = await this.insertMany(rows);
    if (
      result.InvalidStockOutVouchers &&
      result.InvalidStockOutVouchers.length > 0
    ) {
      const invalidBuffer = StockOutVoucherExcelHelper.exportInvalidExcel(
        result.InvalidStockOutVouchers,
      );
      throw new BadRequestException({
        message: 'Dữ liệu import không hợp lệ',
        errorFile: 'InvalidStockOutVoucher.xlsx',
        errors: result.InvalidStockOutVouchers,
        fileBuffer: invalidBuffer,
      });
    }
    return { imported: result.InsertedCount };
  }

  async exportExcel(dto: ExportStockOutVoucherDto): Promise<Buffer> {
    return StockOutVoucherExcelHelper.exportSampleExcel();
  }
}
