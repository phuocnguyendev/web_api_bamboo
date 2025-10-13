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
    const receipts: CreateReceiptDto[] = data.map((row) => {
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
        Items: [],
      } as CreateReceiptDto;
    });

    const errors = await this.receiptValidator.validateImportRows(receipts);
    if (errors.length > 0) {
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
    const filePath = path.join(__dirname, 'exported_receipts.xlsx');
    await exportReceiptExcelSample(filePath);
    return filePath;
  }
}
