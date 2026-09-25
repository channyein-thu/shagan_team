export type OrgStatus = "active" | "suspended";
export type AccountType = "owner" | "service_center" | "pos";
export type AccountStatus = "active" | "suspended";

export interface Organization {
  id: string;
  name: string;
  status: OrgStatus;
  created_at: string;
  updated_at: string;
}

export interface BackendUser {
  id: string;
  email: string;
  account_type: AccountType;
  status: AccountStatus;
  org_id?: string;
  branch_id?: string;
  device_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Branch {
  id: string;
  org_id: string;
  name: string;
  status: string;
  address: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface Device {
  id: string;
  org_id: string;
  branch_id: string;
  name: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAccountResponse {
  organization: Organization;
  owner: BackendUser;
  service_center: BackendUser;
}

export interface CreateAccountInput {
  organization_name: string;
  owner_email: string;
  owner_password: string;
  service_center_email: string;
  service_center_password: string;
}

export interface CreateBranchInput {
  org_id: string;
  name: string;
  status: string;
  address: string;
  phone: string;
}

export interface CreateDeviceInput {
  org_id: string;
  branch_id: string;
  name: string;
  status: string;
}

export interface CreatePosAccountInput {
  org_id: string;
  device_id: string;
  email: string;
  password: string;
}
