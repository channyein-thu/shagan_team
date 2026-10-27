export type OrgStatus = "active" | "suspended";
export type AccountType = "owner" | "service_center" | "pos";
export type AccountStatus = "active" | "suspended";

export interface Organization {
  id: string;
  name: string;
  status: OrgStatus;
  created_at: string;
  updated_at: string;
  // Subscription block as stored (see Subscription for what it means today).
  plan: PlanCode;
  plan_expires_at: string | null;
  plan_trial: boolean;
  extra_branches: number;
  extra_devices: number;
  // The plan after expiry and grace, and whether the org has more active
  // branches/devices than that plan allows (e.g. after a downgrade).
  effective_plan: PlanCode;
  over_limit: boolean;
}

// Subscription tiers (shagan_pos recommendation #24, WORKFLOWS "Subscription
// tiers"). The tiers themselves are defined in the backend; GET /internal/plans.
export type PlanCode = "basic" | "pro" | "enterprise";

/** A null limit is unlimited. */
export interface PlanLimits {
  branches: number | null;
  devices: number | null;
}

export interface Plan {
  code: PlanCode;
  name: string;
  features: string[];
  limits: PlanLimits;
}

export interface PlanCatalog {
  plans: Plan[];
  /** Every feature code, in display order. */
  features: string[];
}

export interface Entitlements {
  /** The effective plan (after expiry and grace). */
  plan: PlanCode;
  trial: boolean;
  expires_at: string | null;
  /** A paid plan past its end date, still working for the grace period. */
  in_grace: boolean;
  /** The stored plan lapsed; the org is on Basic now. */
  expired: boolean;
  features: string[];
  limits: PlanLimits;
  usage: { branches: number; devices: number };
}

export interface FeatureOverride {
  id: string;
  org_id: string;
  feature: string;
  enabled: boolean;
  updated_at: string;
}

export interface PlanChange {
  id: string;
  org_id: string;
  from_plan: PlanCode | "";
  to_plan: PlanCode;
  expires_at: string | null;
  trial: boolean;
  extra_branches: number;
  extra_devices: number;
  note: string;
  changed_by: string;
  created_at: string;
}

export interface Subscription {
  organization_id: string;
  effective: Entitlements;
  /** The stored plan fields. */
  raw: {
    plan: PlanCode;
    expires_at: string | null;
    trial: boolean;
    extra_branches: number;
    extra_devices: number;
  };
  over_limit: boolean;
  overrides: FeatureOverride[];
  /** Newest first, at most 100. */
  history: PlanChange[];
}

/** PATCH body: omitted fields are unchanged; expires_at null clears it. */
export interface UpdateSubscriptionInput {
  plan?: PlanCode;
  expires_at?: string | null;
  trial?: boolean;
  extra_branches?: number;
  extra_devices?: number;
  note?: string;
  changed_by: string;
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
