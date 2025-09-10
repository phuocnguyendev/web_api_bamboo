import { WarehouseStatus } from '../constants/constant';

export interface Warehouse {
  Id: string;
  Code: string;
  Name: string;
  Address?: string | null;
  Branch?: string | null;
  Status?: WarehouseStatus;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface WarehouseResponse
  extends Pick<
    Warehouse,
    'Id' | 'Code' | 'Name' | 'Address' | 'Branch' | 'Status'
  > {}

export interface WarehouseCreateData
  extends Omit<Warehouse, 'Id' | 'CreatedAt' | 'UpdatedAt'> {}

export interface WarehouseUpdateData extends Partial<WarehouseCreateData> {
  Id: string;
}
