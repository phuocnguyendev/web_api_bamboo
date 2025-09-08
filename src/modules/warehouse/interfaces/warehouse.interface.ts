export interface Warehouse {
  Id: string;
  Code: string;
  Name: string;
  Address?: string | null;
  Branch?: string | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}
