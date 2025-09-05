export interface RoleData {
  Id: string;
  Code: string;
  Name: string;
}

export interface RoleCreateData extends Pick<RoleData, 'Name'> {}

export interface RoleUpdateData extends Required<RoleData> {}

export interface RoleResponse extends RoleData {}

export type RoleField = keyof RoleData;
export type RoleOptional = Partial<RoleData>;
