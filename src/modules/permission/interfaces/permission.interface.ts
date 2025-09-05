import { RoleResponse } from '../../role/interfaces/role.interface';

export interface PermissionData {
  Id: string;
  Code: string;
  Name: string;
}

export interface PermissionResponse extends PermissionData {
  Role?: {
    Id: string;
    Name: string;
  };
}

export interface PermissionCreateData
  extends Pick<PermissionData, 'Code' | 'Name'> {}

export interface PermissionUpdateData extends PermissionCreateData {}

export interface PermissionWithRole extends PermissionData {
  Role?: RoleResponse;
}
export interface RolePermissionWithPermission {
  Permission: Permissions;
}
