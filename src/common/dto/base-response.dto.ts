export class BaseResponse<T> {
  ListModel: T[];
  Count: number;

  constructor(data: T[], total: number) {
    this.ListModel = data;
    this.Count = total;
  }
}
