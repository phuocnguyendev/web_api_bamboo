import { UserData } from '../../user/interfaces/user.interface';
import { RoleResponse } from '../../role/interfaces/role.interface';

export interface AuthUser
  extends Pick<
    UserData,
    | 'Id'
    | 'Email'
    | 'Name'
    | 'RoleId'
    | 'Status'
    | 'Phone'
    | 'Avatar_url'
    | 'CreatedAt'
    | 'UpdatedAt'
  > {
  Role?: RoleResponse;
}

export interface JwtPayload {
  sub: string;
  role?: string;
  iss: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
