import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateStockDto,
  UpdateStockDto,
  ResetStockDto,
  ImportStockDto,
  IStockResponse,
  StockSummaryResponse,
} from './dto';
import { StockRepository } from './repositories/stock.repository';
import {
  StockValidator,
  validateStockDto,
  checkStockUniqueFields,
} from './validators/stock.validator';
import {
  exportFullStockSampleExcelStyled,
  parseStockExcel,
} from './helpers/stock.excel';
import * as XLSX from 'xlsx';

@Injectable()
export class StockService {
  constructor(
    private readonly stockRepository: StockRepository,
    private readonly stockValidator: StockValidator,
  ) {}

  async create(createStockDto: CreateStockDto) {
    await this.stockValidator.ensureUniqueCombination(
      createStockDto,
      this.stockRepository,
    );

    const stock = await this.stockRepository.createWithResponse({
      WarehouseId: createStockDto.WarehouseId,
      ProductId: createStockDto.ProductId,
      QtyOnHand: createStockDto.QtyOnHand,
      SafetyStock: createStockDto.SafetyStock,
      ReorderPoint: createStockDto.ReorderPoint,
      MinQty: createStockDto.MinQty,
    });

    return stock;
  }

  async findAll(
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<IStockResponse> {
    const [data, count] = await this.stockRepository.findAllStocks(
      page,
      pageSize,
      searchText,
    );
    return new IStockResponse(data, count);
  }

  async findOne(id: string) {
    const stock = await this.stockRepository.findStockById(id);
    if (!stock) {
      throw new NotFoundException(`Không tìm thấy tồn kho với id ${id}`);
    }
    return stock;
  }

  async findByWarehouse(
    warehouseId: string,
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<IStockResponse> {
    const [data, count] = await this.stockRepository.findStocksByWarehouse(
      warehouseId,
      page,
      pageSize,
      searchText,
    );
    return new IStockResponse(data, count);
  }

  async findByProduct(
    productId: string,
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<IStockResponse> {
    const [data, count] = await this.stockRepository.findStocksByProduct(
      productId,
      page,
      pageSize,
      searchText,
    );
    return new IStockResponse(data, count);
  }

  async getLowStock(
    page = 1,
    pageSize = 30,
    searchText = '',
  ): Promise<IStockResponse> {
    const [data, count] = await this.stockRepository.findLowStocks(
      page,
      pageSize,
      searchText,
    );
    return new IStockResponse(data, count);
  }

  async getStockSummary(): Promise<StockSummaryResponse> {
    const summary = await this.stockRepository.getStockSummary();
    return summary as StockSummaryResponse;
  }

  async update(updateStockDto: UpdateStockDto) {
    const existingStock = await this.stockRepository.findStockById(
      updateStockDto.Id,
    );
    if (!existingStock) {
      throw new NotFoundException(`Không tìm thấy tồn kho`);
    }

    const updateData: Partial<UpdateStockDto> = {};
    if (updateStockDto.QtyOnHand !== undefined) {
      updateData.QtyOnHand = updateStockDto.QtyOnHand;
    }
    if (updateStockDto.QtyReserved !== undefined) {
      updateData.QtyReserved = updateStockDto.QtyReserved;
    }
    if (updateStockDto.SafetyStock !== undefined) {
      updateData.SafetyStock = updateStockDto.SafetyStock;
    }
    if (updateStockDto.ReorderPoint !== undefined) {
      updateData.ReorderPoint = updateStockDto.ReorderPoint;
    }
    if (updateStockDto.MinQty !== undefined) {
      updateData.MinQty = updateStockDto.MinQty;
    }

    const updatedStock = await this.stockRepository.updateStock(
      updateStockDto.Id,
      updateData,
    );
    return updatedStock;
  }

  async resetStock(resetStockDto: ResetStockDto) {
    const existingStock = await this.stockRepository.findStockById(
      resetStockDto.Id,
    );
    if (!existingStock) {
      throw new NotFoundException(`Không tìm thấy tồn kho`);
    }

    const resetStock = await this.stockRepository.resetStock(
      resetStockDto.Id,
      resetStockDto.QtyOnHand,
    );
    return resetStock;
  }

  async remove(id: string) {
    const existingStock = await this.stockRepository.findStockById(id);
    if (!existingStock) {
      throw new NotFoundException(`Không tìm thấy tồn kho với id ${id}`);
    }

    await this.stockRepository.deleteStock(id);
    return { message: 'Xóa tồn kho thành công' };
  }

  async importExcel(buffer: Buffer) {
    const { data } = parseStockExcel(buffer);
    return {
      Data: data,
      ErrorDetail: {},
    };
  }

  async insertMany(items: unknown[][]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Danh sách tồn kho trống');
    }

    const validRows: ImportStockDto[] = [];
    const invalidRows: {
      RowIndex: number;
      ErrorMessage: string;
      ErrorCells: number[];
      CellValues: unknown[];
    }[] = [];

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const dto: ImportStockDto = {
        WarehouseId: String(row[0] || ''),
        ProductId: String(row[1] || ''),
        QtyOnHand: row[2] !== undefined && row[2] !== null ? Number(row[2]) : 0,
        QtyReserved:
          row[3] !== undefined && row[3] !== null ? Number(row[3]) : 0,
        SafetyStock:
          row[4] !== undefined && row[4] !== null ? Number(row[4]) : 0,
        ReorderPoint:
          row[5] !== undefined && row[5] !== null ? Number(row[5]) : 0,
        MinQty: row[6] !== undefined && row[6] !== null ? Number(row[6]) : 0,
      };

      let errorList = validateStockDto(
        dto as unknown as Record<string, unknown>,
      );
      const uniqueErrors = await checkStockUniqueFields(
        dto,
        this.stockRepository,
      );
      errorList = errorList.concat(uniqueErrors);
      errorList = errorList.filter(
        (e) =>
          e &&
          e.Message &&
          e.Message !== 'an unknown value was passed to the validate function',
      );

      if (errorList.length > 0) {
        const errorCells: number[] = [];
        const errorMsgs: string[] = [];

        for (const err of errorList) {
          const idx = [
            'WarehouseId',
            'ProductId',
            'QtyOnHand',
            'QtyReserved',
            'SafetyStock',
            'ReorderPoint',
            'MinQty',
          ].indexOf(err.Property);
          if (idx !== -1) errorCells.push(idx);
          errorMsgs.push(err.Message);
        }

        invalidRows.push({
          RowIndex: i,
          ErrorMessage: errorMsgs.length > 0 ? errorMsgs.join(', ') + '.' : '',
          ErrorCells: errorCells,
          CellValues: row,
        });
      } else {
        validRows.push(dto);
      }
    }

    let inserted = 0;
    if (validRows.length > 0) {
      await this.stockRepository.bulkImport(validRows);
      inserted = validRows.length;
    }

    return {
      InsertedCount: inserted,
      InvalidStocks: invalidRows,
    };
  }

  async exportSampleExcel(filePath: string) {
    await exportFullStockSampleExcelStyled(filePath);
    return filePath;
  }

  async exportToExcel(): Promise<Buffer> {
    const [stocks] = await this.stockRepository.findAllStocks(1, 10000, '');

    const exportData = stocks.map((stock) => ({
      ID: stock.Id,
      'Tên kho': stock.Warehouse.Name,
      'Tên sản phẩm': stock.Product.Name,
      'Số lượng tồn': stock.QtyOnHand,
      'Số lượng đặt trước': stock.QtyReserved,
      'Mức tồn an toàn': stock.SafetyStock,
      'Điểm đặt hàng lại': stock.ReorderPoint,
      'Số lượng tối thiểu': stock.MinQty,
      'Có sẵn': stock.QtyOnHand - stock.QtyReserved,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tồn kho');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }
}
