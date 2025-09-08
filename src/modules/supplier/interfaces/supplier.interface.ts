// src/modules/supplier/supplier.interface.ts
export interface Supplier {
  Id: string;
  Name: string;
  TaxCode?: string | null;
  Phone?: string | null;
  Email?: string | null;
  Address?: string | null;
  Rating?: number | null;
  LeadTime?: number | null; // ngày
  CreatedAt: Date;
  UpdatedAt: Date;
}
