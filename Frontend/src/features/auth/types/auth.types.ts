export type LoginMethod = "credentials" | "pin";

export type CredentialsLoginRequest = {
  method: "credentials";
  username: string;
  password: string;
  remember: boolean;
};

export type PinLoginRequest = {
  method: "pin";
  pin: string;
};

export type LoginRequest = CredentialsLoginRequest | PinLoginRequest;

export type AuthUser = {
  id: string;
  name: string;
  username: string;
  email?: string;
  department?: string | null;
  status?: string;
  role: string;
  roles?: { id: string; name: string; code?: string | null }[];
  permissions?: string[];
  createdAt?: string;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    hireDate: string;
    status: string;
    departmentId?: string | null;
    isDepartmentLeader?: boolean;
    position?: { name: string } | null;
    department?: { name: string } | null;
    devicePeople?: {
      id: string;
      employeeNo: string;
      device: { id: string; name: string };
    }[];
  } | null;
};

export type LoginResponse = {
  user: AuthUser;
};
