export interface Receipt {
  Id: string;
  Code: string;
  SupplierId: string;
  WarehouseId: string;
  Status?: string;
  ReceivedAt: Date;
  FreightCost?: number;
  HandlingCost?: number;
  OtherCost?: number;
  Note?: string;
  CreatedAt: Date;
  UpdatedAt: Date;
  Items: ReceiptItem[];
}

export interface ReceiptItem {
  Id: string;
  ReceiptId: string;
  ProductId: string;
  Qty: number;
  UnitCost: number;
  VatRate?: number;
  Note?: string;
}
