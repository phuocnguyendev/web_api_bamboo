import {
  StockMovementType,
  StockMovementRefType,
  StockMovementResponse,
  StockMovementStats,
} from '../interfaces/stock_movement.interface';
import * as XLSX from 'xlsx';

/**
 * Stock Movement Helper Functions
 */
export class StockMovementHelper {
  /**
   * Get Vietnamese text for movement type
   */
  static getMovementTypeText(type: StockMovementType): string {
    const typeMap = {
      [StockMovementType.IN]: 'Nhập kho',
      [StockMovementType.OUT]: 'Xuất kho',
      [StockMovementType.TRANSFER]: 'Chuyển kho',
      [StockMovementType.ADJUST]: 'Điều chỉnh tồn kho',
      [StockMovementType.RETURN]: 'Trả hàng',
      [StockMovementType.LOSS]: 'Hao hụt',
    };
    return typeMap[type] || type;
  }

  /**
   * Get Vietnamese text for reference type
   */
  static getRefTypeText(refType: StockMovementRefType): string {
    const refTypeMap = {
      [StockMovementRefType.RECEIPT]: 'Phiếu nhập',
      [StockMovementRefType.STOCK_OUT]: 'Phiếu xuất',
      [StockMovementRefType.TRANSFER]: 'Chuyển kho',
      [StockMovementRefType.ADJUSTMENT]: 'Điều chỉnh',
      [StockMovementRefType.MANUAL]: 'Thao tác thủ công',
    };
    return refTypeMap[refType] || refType;
  }

  /**
   * Get movement type color for UI
   */
  static getMovementTypeColor(type: StockMovementType): string {
    const colorMap = {
      [StockMovementType.IN]: '#52c41a', // Green
      [StockMovementType.OUT]: '#f5222d', // Red
      [StockMovementType.TRANSFER]: '#1890ff', // Blue
      [StockMovementType.ADJUST]: '#faad14', // Orange
      [StockMovementType.RETURN]: '#722ed1', // Purple
      [StockMovementType.LOSS]: '#8c8c8c', // Gray
    };
    return colorMap[type] || '#000000';
  }

  /**
   * Calculate total value of a movement
   */
  static calculateTotalValue(qty: number, unitCost?: number): number {
    if (!unitCost) return 0;
    return qty * unitCost;
  }

  /**
   * Format movement display text
   */
  static formatMovementDisplay(movement: StockMovementResponse): string {
    const typeText = this.getMovementTypeText(movement.Type);
    const warehouseText =
      movement.Type === StockMovementType.TRANSFER
        ? `${movement.Warehouse.Name} → ${movement.WarehouseTo?.Name || 'N/A'}`
        : movement.Warehouse.Name;

    return `${typeText} - ${warehouseText} - ${movement.Product.Name} (${movement.Qty})`;
  }

  /**
   * Group movements by type
   */
  static groupMovementsByType(
    movements: StockMovementResponse[],
  ): Record<StockMovementType, StockMovementResponse[]> {
    return movements.reduce(
      (groups, movement) => {
        if (!groups[movement.Type]) {
          groups[movement.Type] = [];
        }
        groups[movement.Type].push(movement);
        return groups;
      },
      {} as Record<StockMovementType, StockMovementResponse[]>,
    );
  }

  /**
   * Group movements by warehouse
   */
  static groupMovementsByWarehouse(
    movements: StockMovementResponse[],
  ): Record<string, StockMovementResponse[]> {
    return movements.reduce(
      (groups, movement) => {
        const warehouseId = movement.WarehouseId;
        if (!groups[warehouseId]) {
          groups[warehouseId] = [];
        }
        groups[warehouseId].push(movement);
        return groups;
      },
      {} as Record<string, StockMovementResponse[]>,
    );
  }

  /**
   * Group movements by product
   */
  static groupMovementsByProduct(
    movements: StockMovementResponse[],
  ): Record<string, StockMovementResponse[]> {
    return movements.reduce(
      (groups, movement) => {
        const productId = movement.ProductId;
        if (!groups[productId]) {
          groups[productId] = [];
        }
        groups[productId].push(movement);
        return groups;
      },
      {} as Record<string, StockMovementResponse[]>,
    );
  }

  /**
   * Calculate summary statistics from movements
   */
  static calculateSummaryStats(movements: StockMovementResponse[]): {
    totalMovements: number;
    totalValue: number;
    inCount: number;
    outCount: number;
    transferCount: number;
    adjustCount: number;
    returnCount: number;
    lossCount: number;
  } {
    const stats = {
      totalMovements: movements.length,
      totalValue: 0,
      inCount: 0,
      outCount: 0,
      transferCount: 0,
      adjustCount: 0,
      returnCount: 0,
      lossCount: 0,
    };

    movements.forEach((movement) => {
      // Calculate total value
      if (movement.UnitCost) {
        stats.totalValue += movement.Qty * movement.UnitCost;
      }

      // Count by type
      switch (movement.Type) {
        case StockMovementType.IN:
          stats.inCount++;
          break;
        case StockMovementType.OUT:
          stats.outCount++;
          break;
        case StockMovementType.TRANSFER:
          stats.transferCount++;
          break;
        case StockMovementType.ADJUST:
          stats.adjustCount++;
          break;
        case StockMovementType.RETURN:
          stats.returnCount++;
          break;
        case StockMovementType.LOSS:
          stats.lossCount++;
          break;
      }
    });

    return stats;
  }

  /**
   * Generate Excel filename with timestamp
   */
  static generateExcelFilename(
    prefix: string = 'lich-su-di-chuyen-kho',
  ): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `${prefix}-${dateStr}-${timeStr}.xlsx`;
  }

  /**
   * Format date for display
   */
  static formatDate(
    date: Date,
    format: 'short' | 'long' | 'datetime' = 'datetime',
  ): string {
    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case 'short':
        options.year = 'numeric';
        options.month = '2-digit';
        options.day = '2-digit';
        break;
      case 'long':
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'datetime':
        options.year = 'numeric';
        options.month = '2-digit';
        options.day = '2-digit';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.second = '2-digit';
        break;
    }

    return date.toLocaleDateString('vi-VN', options);
  }

  /**
   * Format currency for display
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  /**
   * Format number with thousand separators
   */
  static formatNumber(num: number, decimals: number = 0): string {
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  /**
   * Check if movement affects stock positively or negatively
   */
  static getStockImpact(
    type: StockMovementType,
    warehouseId: string,
    movementWarehouseId: string,
    movementWarehouseToId?: string,
  ): 'positive' | 'negative' | 'neutral' {
    switch (type) {
      case StockMovementType.IN:
      case StockMovementType.RETURN:
        return warehouseId === movementWarehouseId ? 'positive' : 'neutral';

      case StockMovementType.OUT:
      case StockMovementType.LOSS:
        return warehouseId === movementWarehouseId ? 'negative' : 'neutral';

      case StockMovementType.TRANSFER:
        if (warehouseId === movementWarehouseId) return 'negative';
        if (warehouseId === movementWarehouseToId) return 'positive';
        return 'neutral';

      case StockMovementType.ADJUST:
        // For adjustments, we'd need to check the actual qty change
        return 'neutral';

      default:
        return 'neutral';
    }
  }

  /**
   * Validate if movement type is valid for the operation
   */
  static isValidMovementType(type: string): type is StockMovementType {
    return Object.values(StockMovementType).includes(type as StockMovementType);
  }

  /**
   * Validate if reference type is valid
   */
  static isValidRefType(refType: string): refType is StockMovementRefType {
    return Object.values(StockMovementRefType).includes(
      refType as StockMovementRefType,
    );
  }

  /**
   * Generate movement code/reference
   */
  static generateMovementCode(
    type: StockMovementType,
    sequence?: number,
  ): string {
    const prefixMap = {
      [StockMovementType.IN]: 'NK',
      [StockMovementType.OUT]: 'XK',
      [StockMovementType.TRANSFER]: 'CK',
      [StockMovementType.ADJUST]: 'DC',
      [StockMovementType.RETURN]: 'TH',
      [StockMovementType.LOSS]: 'HH',
    };

    const prefix = prefixMap[type] || 'SM';
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seqStr = sequence
      ? sequence.toString().padStart(4, '0')
      : Math.floor(Math.random() * 9999)
          .toString()
          .padStart(4, '0');

    return `${prefix}${dateStr}${seqStr}`;
  }

  /**
   * Create chart data from statistics
   */
  static createChartData(stats: StockMovementStats) {
    return {
      pieChart: stats.byType.map((item) => ({
        name: this.getMovementTypeText(item.type),
        value: item.count,
        color: this.getMovementTypeColor(item.type),
      })),
      barChart: stats.byWarehouse.map((item) => ({
        name: item.warehouseName,
        inCount: item.inCount,
        outCount: item.outCount,
        transferIn: item.transferInCount,
        transferOut: item.transferOutCount,
      })),
      lineChart: stats.byDateRange.map((item) => ({
        date: item.date,
        inCount: item.inCount,
        outCount: item.outCount,
        transferCount: item.transferCount,
        totalValue: item.totalValue,
      })),
    };
  }

  /**
   * Export stock movements to Excel buffer
   */
  static exportMovementsToExcel(movements: StockMovementResponse[]): Buffer {
    // Prepare data for Excel
    const excelData = movements.map((movement, index) => ({
      STT: index + 1,
      'Mã phiếu': movement.Id,
      Loại: this.getMovementTypeText(movement.Type),
      'Loại tham chiếu': movement.RefType
        ? this.getRefTypeText(movement.RefType)
        : '',
      'Mã tham chiếu': movement.RefId || '',
      'Kho xuất phát': movement.Warehouse.Name,
      'Kho đích': movement.WarehouseTo?.Name || '',
      'Sản phẩm': movement.Product.Name,
      'Mã sản phẩm': movement.Product.Code,
      SKU: movement.Product.Sku || '',
      'Số lượng': movement.Qty,
      'Đơn giá': movement.UnitCost
        ? this.formatNumber(movement.UnitCost, 2)
        : '',
      'Thành tiền': movement.UnitCost
        ? this.formatNumber(movement.Qty * movement.UnitCost, 2)
        : '',
      'Lý do': movement.Reason || '',
      'Thời gian xảy ra': this.formatDate(movement.OccurredAt, 'datetime'),
      'Người tạo': movement.CreatedBy,
      'Ngày tạo': this.formatDate(movement.CreatedAt, 'datetime'),
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = [
      { wch: 5 }, // STT
      { wch: 20 }, // Mã phiếu
      { wch: 15 }, // Loại
      { wch: 15 }, // Loại tham chiếu
      { wch: 20 }, // Mã tham chiếu
      { wch: 25 }, // Kho xuất phát
      { wch: 25 }, // Kho đích
      { wch: 30 }, // Sản phẩm
      { wch: 15 }, // Mã sản phẩm
      { wch: 15 }, // SKU
      { wch: 10 }, // Số lượng
      { wch: 15 }, // Đơn giá
      { wch: 15 }, // Thành tiền
      { wch: 30 }, // Lý do
      { wch: 20 }, // Thời gian xảy ra
      { wch: 15 }, // Người tạo
      { wch: 20 }, // Ngày tạo
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Lịch sử di chuyển kho');

    // Generate buffer
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Create Excel template for stock movement import
   */
  static createImportTemplate(): Buffer {
    const templateData = [
      {
        'Loại di chuyển *': 'IN',
        'ID Kho xuất phát *': 'b12f7a0c-6d54-4a6f-b4d7-84c9e9f8d123',
        'ID Kho đích': 'c84f5a77-cc9c-4c2d-a313-5a46d2c1e2aa',
        'ID Sản phẩm *': 'a123b456-7890-1234-5678-90abcdef1234',
        'Số lượng *': 100,
        'Đơn giá': 50000,
        'Lý do': 'Nhập hàng từ nhà cung cấp',
        'Thời gian xảy ra *': '2024-01-15T10:30:00Z',
        'Người tạo *': 'admin@company.com',
      },
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Auto-size columns
    const colWidths = [
      { wch: 18 }, // Loại di chuyển
      { wch: 40 }, // ID Kho xuất phát
      { wch: 40 }, // ID Kho đích
      { wch: 40 }, // ID Sản phẩm
      { wch: 12 }, // Số lượng
      { wch: 12 }, // Đơn giá
      { wch: 30 }, // Lý do
      { wch: 25 }, // Thời gian xảy ra
      { wch: 20 }, // Người tạo
    ];
    ws['!cols'] = colWidths;

    // Add notes sheet
    const notesData = [
      ['Hướng dẫn sử dụng template import Stock Movement'],
      [''],
      ['1. Các trường có dấu (*) là bắt buộc'],
      ['2. Loại di chuyển: IN, OUT, TRANSFER, ADJUST, RETURN, LOSS'],
      ['3. ID phải là UUID hợp lệ'],
      ['4. Số lượng phải là số nguyên dương'],
      ['5. Đơn giá phải là số dương (có thể có phần thập phân)'],
      ['6. Thời gian xảy ra phải theo định dạng ISO 8601'],
      ['7. Với TRANSFER, cần có cả ID Kho xuất phát và ID Kho đích'],
      ['8. Với các loại khác, ID Kho đích để trống'],
      [''],
      ['Ví dụ các loại di chuyển:'],
      ['- IN: Nhập kho từ nhà cung cấp'],
      ['- OUT: Xuất kho bán hàng'],
      ['- TRANSFER: Chuyển hàng giữa các kho'],
      ['- ADJUST: Điều chỉnh tồn kho'],
      ['- RETURN: Trả hàng từ khách'],
      ['- LOSS: Hao hụt, mất mát'],
    ];

    const notesWs = XLSX.utils.aoa_to_sheet(notesData);
    notesWs['!cols'] = [{ wch: 60 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.utils.book_append_sheet(wb, notesWs, 'Hướng dẫn');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Parse Excel file and validate stock movement data
   */
  static parseMovementExcel(buffer: Buffer): {
    validMovements: any[];
    invalidMovements: Array<{
      row: number;
      data: any;
      errors: string[];
    }>;
  } {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    const validMovements: any[] = [];
    const invalidMovements: Array<{
      row: number;
      data: any;
      errors: string[];
    }> = [];

    jsonData.forEach((row: any, index) => {
      const errors: string[] = [];
      const rowNumber = index + 2; // +2 because Excel rows start at 1 and we skip header

      // Validate required fields
      if (!row['Loại di chuyển *']) {
        errors.push('Loại di chuyển là bắt buộc');
      } else if (!this.isValidMovementType(row['Loại di chuyển *'])) {
        errors.push('Loại di chuyển không hợp lệ');
      }

      if (!row['ID Kho xuất phát *']) {
        errors.push('ID Kho xuất phát là bắt buộc');
      }

      if (!row['ID Sản phẩm *']) {
        errors.push('ID Sản phẩm là bắt buộc');
      }

      if (!row['Số lượng *'] || row['Số lượng *'] <= 0) {
        errors.push('Số lượng phải là số dương');
      }

      if (!row['Thời gian xảy ra *']) {
        errors.push('Thời gian xảy ra là bắt buộc');
      }

      if (!row['Người tạo *']) {
        errors.push('Người tạo là bắt buộc');
      }

      // Validate TRANSFER specific rules
      if (row['Loại di chuyển *'] === 'TRANSFER' && !row['ID Kho đích']) {
        errors.push('Chuyển kho phải có ID Kho đích');
      }

      if (row['Loại di chuyển *'] !== 'TRANSFER' && row['ID Kho đích']) {
        errors.push('Chỉ chuyển kho mới có ID Kho đích');
      }

      if (errors.length > 0) {
        invalidMovements.push({
          row: rowNumber,
          data: row,
          errors,
        });
      } else {
        validMovements.push({
          Type: row['Loại di chuyển *'],
          WarehouseId: row['ID Kho xuất phát *'],
          WarehouseToId: row['ID Kho đích'] || undefined,
          ProductId: row['ID Sản phẩm *'],
          Qty: parseInt(row['Số lượng *']),
          UnitCost: row['Đơn giá'] ? parseFloat(row['Đơn giá']) : undefined,
          Reason: row['Lý do'] || undefined,
          OccurredAt: new Date(row['Thời gian xảy ra *']),
          CreatedBy: row['Người tạo *'],
        });
      }
    });

    return { validMovements, invalidMovements };
  }
}
