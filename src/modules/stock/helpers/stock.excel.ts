/**
 * Xuất file excel danh sách lỗi import stocks, bôi đỏ trường lỗi và thêm cột nội dung lỗi
 * @param invalidRows Danh sách stocks lỗi
 * @param filePath Đường dẫn file xuất
 */
import { Workbook } from 'exceljs';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';

export async function exportInvalidStocksExcel(
  invalidRows: Array<{
    RowIndex: number;
    ErrorMessage: string;
    ErrorCells: number[];
    CellValues: any[];
  }>,
  filePath: string,
) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('InvalidStocks', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  const columns = [
    { key: 'WarehouseId', title: 'ID Kho *', width: 40 },
    { key: 'ProductId', title: 'ID Sản phẩm *', width: 40 },
    { key: 'QtyOnHand', title: 'Số lượng tồn *', width: 18 },
    { key: 'QtyReserved', title: 'Số lượng đặt trước', width: 20 },
    { key: 'SafetyStock', title: 'Mức tồn an toàn', width: 18 },
    { key: 'ReorderPoint', title: 'Điểm đặt hàng lại', width: 20 },
    { key: 'MinQty', title: 'Số lượng tối thiểu', width: 20 },
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

export async function exportFullStockSampleExcelStyled(filePath: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Stocks', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { key: 'WarehouseId', width: 40 }, // A
    { key: 'ProductId', width: 40 }, // B
    { key: 'QtyOnHand', width: 18 }, // C
    { key: 'QtyReserved', width: 20 }, // D
    { key: 'SafetyStock', width: 18 }, // E
    { key: 'ReorderPoint', width: 20 }, // F
    { key: 'MinQty', width: 20 }, // G
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
    req('ID Kho'),
    req('ID Sản phẩm'),
    req('Số lượng tồn'),
    'Số lượng đặt trước',
    'Mức tồn an toàn',
    'Điểm đặt hàng lại',
    'Số lượng tối thiểu',
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
    'b12f7a0c-6d54-4a6f-b4d7-84c9e9f8d123', // WarehouseId
    'c84f5a77-cc9c-4c2d-a313-5a46d2c1e2aa', // ProductId
    100, // QtyOnHand
    10, // QtyReserved
    20, // SafetyStock
    50, // ReorderPoint
    5, // MinQty
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

export function parseStockExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
  const [header, ...data] = rows;
  return { header, data };
}
