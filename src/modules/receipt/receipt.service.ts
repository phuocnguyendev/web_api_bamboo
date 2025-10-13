import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
// ...existing code...
import { IReceiptResponse } from './dto/response.dto';
import * as path from 'path';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { ExportReceiptDto } from './dto/export-receipt.dto';
import { FilterReceiptDto } from './dto/filter-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import {
  exportInvalidReceiptsExcel,
  exportReceiptExcelSample,
  parseReceiptExcel,
} from './helpers/receipt.excel';
import { ReceiptItemRepository } from './repositories/receipt-item.repository';
import { ReceiptRepository } from './repositories/receipt.repository';
import { ReceiptValidator } from './validators/receipt.validator';

@Injectable()
export class ReceiptService {
  /**
   * Batch insert receipts from array of arrays (rows), similar to ProductService.insertMany
   * @param items Array of rows, each row is an array of receipt fields
   */
  async insertMany(items: any[][]) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new BadRequestException('Danh sách phiếu nhập trống');
    }
    const validRows: CreateReceiptDto[] = [];
    const invalidRows: any[] = [];
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const dto: any = {
        Code: row[0],
        SupplierId: row[1],
        WarehouseId: row[2],
        Status: row[3],
        ReceivedAt: row[4],
        FreightCost: row[5] ? Number(row[5]) : undefined,
        HandlingCost: row[6] ? Number(row[6]) : undefined,
        OtherCost: row[7] ? Number(row[7]) : undefined,
        Note: row[8],
        Items: [],
      };
      // Validate using validator
      let errorList: string[] = [];
      const validationErrors = await this.receiptValidator.validateImportRows([
        dto,
      ]);
      if (validationErrors.length > 0) {
        errorList = validationErrors;
      }
      // Check unique code
      const existing = await this.receiptRepository.findByCode(dto.Code);
      if (existing) {
        errorList.push('Mã phiếu nhập đã tồn tại: ' + dto.Code);
      }
      if (errorList.length > 0) {
        // Map error to errorCells (column indices)
        const errorCells: number[] = [];
        const errorMsgs: string[] = errorList;
        // For simplicity, mark all columns as error if any error
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
      // Insert receipts one by one (could be optimized to true bulk if needed)
      for (const dto of validRows) {
        await this.receiptRepository.create(dto);
      }
      inserted = validRows.length;
    }
    return {
      InsertedCount: inserted,
      InvalidReceipts: invalidRows,
    };
  }
  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptValidator: ReceiptValidator,
  ) {}

  async create(createReceiptDto: CreateReceiptDto) {
    const existing = await this.receiptRepository.findByCode(
      createReceiptDto.Code,
    );
    if (existing) {
      throw new ConflictException('Receipt with this code already exists');
    }
    return this.receiptRepository.create(createReceiptDto);
  }

  async update(id: string, updateReceiptDto: UpdateReceiptDto) {
    const current = await this.receiptRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Receipt not found');
    }
    if (updateReceiptDto.Code && updateReceiptDto.Code !== current.Code) {
      const duplicate = await this.receiptRepository.findByCode(
        updateReceiptDto.Code,
      );
      if (duplicate && duplicate.Id !== id) {
        throw new ConflictException('Receipt with this code already exists');
      }
    }
    return this.receiptRepository.update(id, updateReceiptDto);
  }

  async remove(id: string) {
    const current = await this.receiptRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Receipt not found');
    }
    return this.receiptRepository.delete(id);
  }

  async findAll(filter: FilterReceiptDto): Promise<IReceiptResponse> {
    const { ListModel, Count } = await this.receiptRepository.findAll(filter);
    return new IReceiptResponse(ListModel, Count);
  }

  async findOne(id: string) {
    const receipt = await this.receiptRepository.findById(id);
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async getItems(id: string) {
    return this.receiptRepository.getItems(id);
  }

  async importExcel(buffer: Buffer) {
    const { data } = parseReceiptExcel(buffer);
    const result = await this.insertMany(data);
    if (result.InvalidReceipts && result.InvalidReceipts.length > 0) {
      const filePath = path.join(__dirname, 'InvalidReceipt.xlsx');
      await exportInvalidReceiptsExcel(result.InvalidReceipts, filePath);
      throw new BadRequestException({
        message: 'Dữ liệu import không hợp lệ',
        errorFile: filePath,
        errors: result.InvalidReceipts,
      });
    }
    return { imported: result.InsertedCount };
  }

  async exportExcel(dto: ExportReceiptDto): Promise<string> {
    const filePath = path.join(__dirname, 'exported_receipts.xlsx');
    await exportReceiptExcelSample(filePath);
    return filePath;
  }
}
