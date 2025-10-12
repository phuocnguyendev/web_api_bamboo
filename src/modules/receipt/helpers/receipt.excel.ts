import * as ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

export function parseReceiptExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
  const [header, ...data] = rows;
  return { header, data };
}

export async function exportInvalidReceiptsExcel(
  invalidRows: Array<{
    RowIndex: number;
    ErrorMessage: string;
    ErrorCells: number[];
    CellValues: any[];
  }>,
  filePath: string,
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('InvalidReceipts', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const columns = [
    { key: 'Code', title: 'Mã phiếu nhập *', width: 20 },
    { key: 'SupplierId', title: 'ID Nhà cung cấp *', width: 36 },
    { key: 'WarehouseId', title: 'ID Kho *', width: 36 },
    { key: 'Status', title: 'Trạng thái', width: 16 },
    { key: 'ReceivedAt', title: 'Ngày nhập *', width: 22 },
    { key: 'FreightCost', title: 'Phí vận chuyển', width: 18 },
    { key: 'HandlingCost', title: 'Phí bốc dỡ', width: 18 },
    { key: 'OtherCost', title: 'Chi phí khác', width: 18 },
    { key: 'Note', title: 'Ghi chú', width: 24 },
    { key: 'ErrorContent', title: 'Nội dung lỗi', width: 38 },
  ];

  // Header
  const headerRow = ws.addRow(columns.map((c) => c.title));
  headerRow.height = 24;
  headerRow.eachCell((cell, colNumber) => {
    const col = columns[colNumber - 1];
    const idx = (col.title as string).indexOf('*');
    if (idx !== -1) {
      cell.value = {
        richText: [
          {
            text: (col.title as string).slice(0, idx).trim() + ' ',
            font: {
              name: 'Calibri',
              size: 11,
              bold: true,
              color: { argb: '000000' },
            },
          },
          {
            text: '*',
            font: {
              name: 'Calibri',
              size: 11,
              bold: true,
              color: { argb: 'FF2900' },
            },
          },
        ],
      };
    } else {
      cell.value = col.title;
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: '000000' },
      };
    }
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.fill = {
      type: 'pattern' as const,
      pattern: 'solid' as const,
      fgColor: { argb: 'FFFFF2CC' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Red fill for error
  const redFill = {
    type: 'pattern' as const,
    pattern: 'solid' as const,
    fgColor: { argb: 'FFFF9999' },
  };

  // Ghi từng dòng lỗi
  for (const rowObj of invalidRows) {
    const rowData = [...(rowObj.CellValues || [])];
    // Thêm cột nội dung lỗi
    rowData[columns.length - 1] = rowObj.ErrorMessage || '';
    const row = ws.addRow(rowData);
    row.height = 22;

    // Bôi đỏ các ô lỗi
    if (Array.isArray(rowObj.ErrorCells)) {
      for (const colIdx of rowObj.ErrorCells) {
        row.getCell(colIdx + 1).fill = redFill;
      }
      // Bôi đỏ cột nội dung lỗi
      row.getCell(columns.length).fill = redFill;
    }

    row.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11 };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'left',
        wrapText: true,
      };
    });
  }

  // Auto fit width cho từng cột
  ws.columns.forEach((column, i) => {
    let maxLength = 12;
    ws.eachRow((row, rowNumber) => {
      const cell = row.getCell(i + 1);
      let cellValue = '';
      if (cell.value) {
        if (typeof cell.value === 'object' && 'richText' in cell.value) {
          cellValue = cell.value.richText.map((r: any) => r.text).join('');
        } else {
          cellValue = String(cell.value);
        }
      }
      if (cellValue.length > maxLength) {
        maxLength = cellValue.length;
      }
    });
    column.width = maxLength + 2;
  });

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  await wb.xlsx.writeFile(filePath);
}

// Export sample receipt Excel
export async function exportReceiptExcelSample(filePath: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Receipts', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { key: 'Code', width: 20 },
    { key: 'SupplierId', width: 36 },
    { key: 'WarehouseId', width: 36 },
    { key: 'Status', width: 16 },
    { key: 'ReceivedAt', width: 22 },
    { key: 'FreightCost', width: 18 },
    { key: 'HandlingCost', width: 18 },
    { key: 'OtherCost', width: 18 },
    { key: 'Note', width: 24 },
  ];

  const yellow = { argb: 'FFFFF2CC' };
  const red = { argb: 'FFFF0000' };
  const fontDefault = { name: 'Calibri', size: 11 };

  const req = (label: string): ExcelJS.CellRichTextValue => ({
    richText: [
      { text: label + ' ', font: { ...fontDefault, bold: true } },
      {
        text: '*',
        font: { ...fontDefault, bold: true, color: red },
      },
    ],
  });

  const headerLabels: (string | ExcelJS.CellRichTextValue)[] = [
    req('Mã phiếu nhập'),
    req('ID Nhà cung cấp'),
    req('ID Kho'),
    'Trạng thái',
    req('Ngày nhập'),
    'Phí vận chuyển',
    'Phí bốc dỡ',
    'Chi phí khác',
    'Ghi chú',
  ];

  // Tạo row header trống, sau đó set từng ô bằng RichText hoặc string
  const header = ws.addRow(Array(headerLabels.length).fill(''));
  header.height = 24;

  headerLabels.forEach((val, colIdx) => {
    const cell = header.getCell(colIdx + 1);
    if (typeof val === 'object' && 'richText' in val) {
      cell.value = val;
    } else {
      cell.value = val;
      cell.font = { ...fontDefault, bold: true };
    }

    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };

    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: yellow };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // AutoFilter
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: headerLabels.length },
  };

  // Sample row
  const sampleRow = ws.addRow([
    'PN001', // Code
    'SUP001', // SupplierId
    'WH001', // WarehouseId
    'pending', // Status
    '2025-10-12T00:00:00.000Z', // ReceivedAt
    10000, // FreightCost
    5000, // HandlingCost
    2000, // OtherCost
    'Ghi chú mẫu', // Note
  ]);

  sampleRow.eachCell((cell) => {
    cell.font = fontDefault;
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  await wb.xlsx.writeFile(filePath);
}
