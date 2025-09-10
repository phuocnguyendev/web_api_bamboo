export interface Warehouse {
  Id: string;
  Code: string;
  Name: string;
  Address?: string | null;
  Branch?: string | null;
  Status?: boolean | null;
  CreatedAt: Date;
  UpdatedAt: Date;
}
