import { BaseResponse } from 'src/common/dto/base-response.dto';
import { UserResponse } from '../interfaces/user.interface';

export class IUserResponse extends BaseResponse<UserResponse> {
  constructor(data: UserResponse[], total: number) {
    super(data, total);
  }
}
