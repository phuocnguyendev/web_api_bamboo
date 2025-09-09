/**
 * Xuất file excel danh sách lỗi import students, bôi đỏ trường lỗi và thêm cột nội dung lỗi
 * @param students Danh sách students lỗi (có trường Errors)
 * @param filePath Đường dẫn file xuất
 */
import { Workbook } from 'exceljs';
export async function exportInvalidStudentsExcel(
  students: any[],
  filePath: string,
) {
  const wb = new Workbook();
  const ws = wb.addWorksheet('InvalidStudents', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  // Header mapping: key - title
  const columns = [
    { key: 'Code', title: 'Mã định danh *', width: 22 },
    { key: 'Name', title: 'Họ và tên *', width: 22 },
    { key: 'Birthday', title: 'Ngày sinh', width: 22 },
    { key: 'Gender', title: 'Giới tính', width: 22 },
    { key: 'Grade', title: 'Khối *', width: 22 },
    { key: 'Class', title: 'Lớp *', width: 22 },
    { key: 'BirthPlace', title: 'Nơi sinh', width: 22 },
    { key: 'Address', title: 'Địa chỉ', width: 22 },
    { key: 'PhoneNumber', title: 'Số điện thoại', width: 22 },
    { key: 'Email', title: 'Email', width: 22 },
    { key: 'Password', title: 'Mật khẩu', width: 22 },
    { key: 'ErrorContent', title: 'Nội dung lỗi', width: 40 },
  ];
  ws.columns = columns.map((col) => ({ key: col.key, width: col.width }));

  // Header row
  const headerRow = ws.addRow(columns.map((c) => c.title));
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 11, bold: true };
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
    fgColor: { argb: 'FFFF0000' },
  };

  for (const student of students) {
    const rowData = columns.map((col) =>
      col.key === 'ErrorContent' ? '' : (student[col.key] ?? ''),
    );
    // Nội dung lỗi: nối các message
    const errorContent = Array.isArray(student.Errors)
      ? student.Errors.map((e: any) => e.Message).join('; ')
      : '';
    rowData[columns.length - 1] = errorContent;
    const row = ws.addRow(rowData);
    row.height = 22;
    // Bôi đỏ các trường có lỗi
    if (Array.isArray(student.Errors)) {
      for (const err of student.Errors) {
        const idx = columns.findIndex((c) => c.key === err.Property);
        if (idx >= 0) {
          const cell = row.getCell(idx + 1);
          cell.fill = redFill;
        }
      }
      // Bôi đỏ cột nội dung lỗi
      row.getCell(columns.length + 1).fill = redFill;
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

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length + 1 },
  };

  await wb.xlsx.writeFile(filePath);
}
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
