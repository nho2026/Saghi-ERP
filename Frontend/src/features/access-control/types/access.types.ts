export type UserStatus = "active" | "inactive";
export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string | null;
  department: string | null;
  warehouseId?: string | null;
  warehouse?: { id: string; name: string } | null;
  status: UserStatus;
  roles?: { id: string; name: string; code?: string | null }[];
};
export type Role = {
  code?: string | null;
  id: string;
  name: string;
  description: string;
  users: number;
  permissions: number;
  permissionItems?: Permission[];
};
export type Permission = {
  id: string;
  key: string;
  name: string;
  module: string;
};
