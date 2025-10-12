import { Receipt, ReceiptItem } from './receipt.interface';

export interface ReceiptListResponse {
  ListModel: Receipt[];
  Count: number;
}

export interface ReceiptDetailResponse extends Receipt {
  Items: ReceiptItem[];
}
