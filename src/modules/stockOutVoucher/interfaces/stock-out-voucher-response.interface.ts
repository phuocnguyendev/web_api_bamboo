import { StockOutItem, StockOutVoucher } from './stock-out-voucher.interface';

export interface StockOutVoucherListResponse {
  ListModel: StockOutVoucher[];
  Count: number;
}

export interface StockOutVoucherDetailResponse extends StockOutVoucher {
  Items: StockOutItem[];
}
