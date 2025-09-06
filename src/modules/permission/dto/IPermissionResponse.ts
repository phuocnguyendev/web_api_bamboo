import { BaseResponse } from 'src/common/dto/base-response.dto';
import { PermissionData } from 'src/interfaces';

export class IPermissionResponse extends BaseResponse<PermissionData> {
  constructor(data: PermissionData[], total: number) {
    super(data, total);
  }
}
