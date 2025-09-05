import { RoleResponse } from '../../role/interfaces/role.interface';

export interface UserData {
  Id: string;
  Name: string;
  Email: string;
  Password: string;
  Avatar_url?: string | null;
  RoleId: string;
  Status: boolean;
  Phone?: string | null;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

export interface UserWithRole extends UserData {
  Role?: RoleResponse;
}

export interface UserResponse
  extends Pick<
    UserData,
    'Id' | 'Name' | 'Email' | 'Avatar_url' | 'Status' | 'Phone'
  > {}

export interface UserCreateData
  extends Pick<
    UserData,
    'Name' | 'Email' | 'RoleId' | 'Status' | 'Avatar_url' | 'Phone'
  > {
  Password: string;
}

export interface UserUpdateData
  extends Partial<
    Pick<UserData, 'Name' | 'Email' | 'Avatar_url' | 'Status' | 'Phone'>
  > {}

// Utility types
export type UserPublicData = Omit<UserData, 'Password'>;
export type UserSafeResponse = Omit<UserResponse, 'Password'>;
