import { Decimal } from '@prisma/client/runtime/library';

// Enums for StockMovement types
export enum StockMovementType {
  IN = 'IN', // Nhập kho
  OUT = 'OUT', // Xuất kho
  TRANSFER = 'TRANSFER', // Chuyển kho
  ADJUST = 'ADJUST', // Điều chỉnh tồn kho
  RETURN = 'RETURN', // Trả hàng
  LOSS = 'LOSS', // Hao hụt
}

export enum StockMovementRefType {
  RECEIPT = 'RECEIPT', // Phiếu nhập
  STOCK_OUT = 'STOCK_OUT', // Phiếu xuất
  TRANSFER = 'TRANSFER', // Chuyển kho
  ADJUSTMENT = 'ADJUSTMENT', // Điều chỉnh
  MANUAL = 'MANUAL', // Thao tác thủ công
}

export interface StockMovement {
  Id: string;
  Type: StockMovementType;
  RefType?: StockMovementRefType;
  RefId?: string;
  WarehouseId: string;
  WarehouseToId?: string;
  ProductId: string;
  Qty: number;
  UnitCost?: Decimal;
  Reason?: string;
  OccurredAt: Date;
  CreatedBy: string;
  CreatedAt: Date;
}

export interface StockMovementResponse {
  Id: string;
  Type: StockMovementType;
  RefType?: StockMovementRefType;
  RefId?: string;
  WarehouseId: string;
  WarehouseToId?: string;
  ProductId: string;
  Qty: number;
  UnitCost?: number;
  Reason?: string;
  OccurredAt: Date;
  CreatedBy: string;
  CreatedAt: Date;
  Warehouse: {
    Id: string;
    Name: string;
    Code: string;
  };
  WarehouseTo?: {
    Id: string;
    Name: string;
    Code: string;
  };
  Product: {
    Id: string;
    Name: string;
    Code: string;
    Sku?: string;
  };
}

export interface StockMovementCreateData {
  Type: StockMovementType;
  RefType?: StockMovementRefType;
  RefId?: string;
  WarehouseId: string;
  WarehouseToId?: string;
  ProductId: string;
  Qty: number;
  UnitCost?: Decimal;
  Reason?: string;
  OccurredAt: Date;
  CreatedBy: string;
}

export interface StockMovementUpdateData {
  Type?: StockMovementType;
  RefType?: StockMovementRefType;
  RefId?: string;
  WarehouseId?: string;
  WarehouseToId?: string;
  ProductId?: string;
  Qty?: number;
  UnitCost?: Decimal;
  Reason?: string;
  OccurredAt?: Date;
}

export interface StockMovementStats {
  totalMovements: number;
  inMovements: number;
  outMovements: number;
  transferMovements: number;
  totalValue: number;
  byType: {
    type: StockMovementType;
    count: number;
    totalQty: number;
    totalValue: number;
  }[];
  byWarehouse: {
    warehouseId: string;
    warehouseName: string;
    inCount: number;
    outCount: number;
    transferInCount: number;
    transferOutCount: number;
    totalValue: number;
  }[];
  byProduct: {
    productId: string;
    productName: string;
    totalIn: number;
    totalOut: number;
    totalTransfer: number;
    totalValue: number;
  }[];
  byDateRange: {
    date: string;
    inCount: number;
    outCount: number;
    transferCount: number;
    totalValue: number;
  }[];
}

export interface StockMovementFilter {
  type?: StockMovementType;
  refType?: StockMovementRefType;
  warehouseId?: string;
  warehouseToId?: string;
  productId?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
