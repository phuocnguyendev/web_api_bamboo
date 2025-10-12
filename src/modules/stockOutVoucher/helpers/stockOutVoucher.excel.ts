import * as XLSX from 'xlsx';
import { ImportStockOutVoucherDto } from '../dto/import-stock-out-voucher.dto';

export class StockOutVoucherExcelHelper {
  static parseImportExcel(buffer: Buffer): ImportStockOutVoucherDto[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const json: ImportStockOutVoucherDto[] = XLSX.utils.sheet_to_json(
      worksheet,
      { defval: '' },
    );
    return json;
  }

  static exportSampleExcel(): Buffer {
    // Sample for import: array of vouchers
    const sample: ImportStockOutVoucherDto[] = [
      {
        vouchers: [
          {
            Code: 'PXK001',
            WarehouseId: 'WH001',
            Type: 'EXPORT',
            Reason: 'Xuất bán',
            IssuedAt: new Date().toISOString(),
            Status: 'DRAFT',
            Items: [
              {
                ProductId: 'SP001',
                Qty: 10,
                UnitCostSnapshot: 10000,
                Note: 'Ghi chú',
              },
            ],
          },
        ],
      },
    ];
    // Flatten for Excel sample (show one voucher row)
    const flatSample = sample[0].vouchers.map((v) => ({
      ...v,
      ...v.Items[0],
      Items: undefined,
    }));
    const worksheet = XLSX.utils.json_to_sheet(flatSample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'StockOutVoucher');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static exportInvalidExcel(invalidRows: ImportStockOutVoucherDto[]): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(invalidRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'InvalidStockOutVoucher');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
