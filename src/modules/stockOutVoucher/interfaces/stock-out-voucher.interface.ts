export interface StockOutVoucher {
  Id: string;
  Code: string;
  WarehouseId: string;
  WarehouseToId?: string;
  Type: string;
  Reason?: string;
  IssuedAt: Date;
  Status: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  Items: StockOutItem[];
}

export interface StockOutItem {
  Id: string;
  StockOutVoucherId: string;
  ProductId: string;
  Qty: number;
  UnitCostSnapshot: number;
  Note?: string;
}
