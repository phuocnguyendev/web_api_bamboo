export interface StockOutItem {
  Id: string;
  StockOutVoucherId: string;
  ProductId: string;
  Qty: number;
  UnitCostSnapshot: number;
  Note?: string;
}

export interface StockOutItemReport {
  ProductId: string;
  ProductName: string;
  TotalQty: number;
  TotalValue: number;
  MinUnitCost: number;
  MaxUnitCost: number;
  AvgUnitCost: number;
}
