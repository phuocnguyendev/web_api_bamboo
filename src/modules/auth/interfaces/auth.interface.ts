import { UserData } from '../../user/interfaces/user.interface';
import { RoleResponse } from '../../role/interfaces/role.interface';

export interface AuthUser extends Pick<UserData, 'user_id' | 'email' | 'username' | 'role_id' | 'center_id'> {
  role?: RoleResponse;
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
