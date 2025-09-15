export interface Stock {
  Id: string;
  WarehouseId: string;
  ProductId: string;
  QtyOnHand: number;
  QtyReserved: number;
  SafetyStock: number;
  ReorderPoint: number;
  MinQty: number;
}

export interface StockCreateData
  extends Pick<
    Stock,
    | 'WarehouseId'
    | 'ProductId'
    | 'QtyOnHand'
    | 'SafetyStock'
    | 'ReorderPoint'
    | 'MinQty'
  > {}

export interface StockUpdateData extends Required<Stock> {}

export interface StockResponse
  extends Omit<Stock, 'WarehouseId' | 'ProductId'> {
  Warehouse: {
    Id: string;
    Name: string;
  };
  Product: {
    Id: string;
    Name: string;
  };
}
export interface StockWithRelation {
  Id: string;
  WarehouseId: string;
  ProductId: string;
  QtyOnHand: number;
  QtyReserved: number;
  SafetyStock: number;
  ReorderPoint: number;
  MinQty: number;
  Warehouse?: { Id: string; Name: string };
  Product?: { Id: string; Name: string };
}
