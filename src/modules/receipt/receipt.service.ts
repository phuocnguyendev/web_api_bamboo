import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  constructor(
    private readonly receiptRepository: ReceiptRepository,
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly receiptValidator: ReceiptValidator,
  ) {}

  async create(createReceiptDto: CreateReceiptDto) {
    return this.receiptRepository.create(createReceiptDto);
  }

  async update(id: string, updateReceiptDto: UpdateReceiptDto) {
    // Optionally: check existence
    return this.receiptRepository.update(id, updateReceiptDto);
  }

  async remove(id: string) {
    return this.receiptRepository.delete(id);
  }

  async findAll(filter: FilterReceiptDto) {
    return this.receiptRepository.findAll(filter);
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
    // Parse Excel and validate receipts in batch
    const { header, data } = parseReceiptExcel(buffer);
    const receipts: CreateReceiptDto[] = data.map((row) => {
      // Map row to DTO (assume order matches columns)
      const [
        Code,
        SupplierId,
        WarehouseId,
        Status,
        ReceivedAt,
        FreightCost,
        HandlingCost,
        OtherCost,
        Note,
      ] = row;
      return {
        Code,
        SupplierId,
        WarehouseId,
        Status,
        ReceivedAt,
        FreightCost: FreightCost ? Number(FreightCost) : undefined,
        HandlingCost: HandlingCost ? Number(HandlingCost) : undefined,
        OtherCost: OtherCost ? Number(OtherCost) : undefined,
        Note,
        Items: [], // Items import có thể làm riêng
      } as CreateReceiptDto;
    });

    const errors = await this.receiptValidator.validateImportRows(receipts);
    if (errors.length > 0) {
      // Build invalidRows for Excel export
      const invalidRows = receipts
        .map((r, idx) => ({
          RowIndex: idx + 2,
          ErrorMessage: errors[idx] || '',
          ErrorCells: [],
          CellValues: Object.values(r),
        }))
        .filter((r) => r.ErrorMessage);
      const filePath = path.join(__dirname, 'InvalidReceipt.xlsx');
      await exportInvalidReceiptsExcel(invalidRows, filePath);
      throw new BadRequestException({
        message: 'Dữ liệu import không hợp lệ',
        errorFile: filePath,
        errors,
      });
    }

    const results: Awaited<ReturnType<typeof this.create>>[] = [];
    for (const dto of receipts) {
      results.push(await this.create(dto));
    }
    return { imported: results.length };
  }

  async exportExcel(dto: ExportReceiptDto): Promise<string> {
    // Export receipts to Excel and return file path
    const filePath = path.join(__dirname, 'exported_receipts.xlsx');
    await exportReceiptExcelSample(filePath);
    return filePath;
  }
}
