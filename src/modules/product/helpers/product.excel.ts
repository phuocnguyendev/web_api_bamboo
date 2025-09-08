import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';

export async function exportFullProductSampleExcelStyled(filePath: string) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Products', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { key: 'Code', width: 20 }, // A
    { key: 'Sku', width: 16 }, // B
    { key: 'Name', width: 24 }, // C
    { key: 'Material', width: 16 }, // D
    { key: 'SpecText', width: 28 }, // E
    { key: 'Uom', width: 20 }, // F
    { key: 'BaseCost', width: 14 }, // G
    { key: 'Status', width: 16 }, // H
    { key: 'Note', width: 20 }, // I
    { key: 'Barcode', width: 22 }, // J
    { key: 'HSCode', width: 12 }, // K
    { key: 'CountryOfOrigin', width: 14 }, // L
    { key: 'WeightKg', width: 20 }, // M
    { key: 'LengthCm', width: 14 }, // N
    { key: 'WidthCm', width: 14 }, // O
    { key: 'HeightCm', width: 14 }, // P
    { key: 'ImageUrl', width: 38 }, // Q
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
    req('Mã sản phẩm'),
    'SKU',
    req('Tên sản phẩm'),
    'Chất liệu',
    'Mô tả kỹ thuật',
    req('Đơn vị tính'),
    'Giá vốn',
    'Kích hoạt',
    'Ghi chú',
    'Mã vạch (Barcode)',
    'Mã HS',
    'Xuất xứ',
    'Khối lượng (kg)',
    'Dài (cm)',
    'Rộng (cm)',
    'Cao (cm)',
    'Ảnh chính (URL)',
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
    'SP001',
    'SKU001',
    'Sản phẩm mẫu',
    'Tre đan',
    'Quai rộng, phủ sơn bóng',
    'Cái',
    10000,
    true,
    'Ghi chú mẫu',
    '8934567890123',
    '4602.99',
    'Việt Nam',
    0.5,
    20,
    10,
    5,
    'https://example.com/image.jpg',
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

export function parseProductExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
  const [header, ...data] = rows;
  return { header, data };
}
