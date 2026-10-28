import "server-only";
import type {
  BackendUser,
  Branch,
  CreateAccountInput,
  CreateAccountResponse,
  CreateBranchInput,
  CreateDeviceInput,
  CreatePosAccountInput,
  Device,
  OrgStatus,
  Organization,
  PlanCatalog,
  Subscription,
  UpdateSubscriptionInput,
} from "./types";

export class BackendError extends Error {
  status: number;
  /** Machine-readable reason, e.g. "plan_limit_reached". */
  code?: string;
  /** The rest of the error body (e.g. limit, max, current). */
  details: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    code?: string,
    details: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "BackendError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Error bodies look like {success:false, message, errors, code?, ...details}.
function toBackendError(status: number, text: string, fallback: string) {
  try {
    const body = JSON.parse(text) as Record<string, unknown>;
    if (typeof body.message === "string") {
      const { message, code, ...rest } = body;
      const details = { ...rest };
      delete details.success;
      return new BackendError(
        status,
        message,
        typeof code === "string" ? code : undefined,
        details,
      );
    }
  } catch {
    // Not JSON - fall through to the raw text.
  }
  return new BackendError(status, text || fallback);
}

function backendUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error("BACKEND_API_URL is not set");
  }
  return url;
}

function internalKey(): string {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) {
    throw new Error("INTERNAL_API_KEY is not set");
  }
  return key;
}

async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${backendUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Key": internalKey(),
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw toBackendError(res.status, text, res.statusText);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

// The Go backend may return numeric IDs (e.g. auto-increment integers)
// rather than strings/UUIDs. Route params and form inputs are always
// strings, so every id-like field is coerced to a string right after
// parsing to keep comparisons (`===`, Map lookups) consistent everywhere
// downstream.
function coerceIds<T extends object>(obj: T, keys: (keyof T)[]): T {
  const copy: Record<keyof T, unknown> = { ...obj };
  for (const key of keys) {
    const value = copy[key];
    if (value !== undefined && value !== null) {
      copy[key] = String(value);
    }
  }
  return copy as T;
}

function normalizeOrganization(org: Organization): Organization {
  return coerceIds(org, ["id"]);
}

function normalizeBranch(branch: Branch): Branch {
  return coerceIds(branch, ["id", "org_id"]);
}

function normalizeDevice(device: Device): Device {
  return coerceIds(device, ["id", "org_id", "branch_id"]);
}

function normalizeUser(user: BackendUser): BackendUser {
  return coerceIds(user, ["id", "org_id", "branch_id", "device_id"]);
}

// The backend's create endpoints expect id fields (org_id, branch_id,
// device_id) as JSON numbers (Go structs type them `uint`), not strings.
// Everywhere else in this app treats ids as strings (see coerceIds above),
// so convert back to a number right before it goes on the wire.
function numericId(value: string): number {
  const id = Number(value);
  if (!Number.isFinite(id)) {
    throw new Error(`Expected a numeric id, got "${value}"`);
  }
  return id;
}

// Organizations

export async function createOrganization(input: CreateAccountInput) {
  const result = await backendFetch<CreateAccountResponse>(
    "/internal/accounts",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return {
    organization: normalizeOrganization(result.organization),
    owner: normalizeUser(result.owner),
    service_center: normalizeUser(result.service_center),
  };
}

export async function listOrganizations() {
  const orgs = await backendFetch<Organization[]>("/internal/organizations");
  return orgs.map(normalizeOrganization);
}

export async function getOrganization(orgId: string) {
  const org = await backendFetch<Organization>(
    `/internal/organizations/${encodeURIComponent(orgId)}`,
  );
  return normalizeOrganization(org);
}

export function setOrganizationStatus(orgId: string, status: OrgStatus) {
  return backendFetch<void>(`/internal/organizations/${orgId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Branches

export async function createBranch(input: CreateBranchInput) {
  const branch = await backendFetch<Branch>("/internal/branches", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      org_id: numericId(input.org_id),
    }),
  });
  return normalizeBranch(branch);
}

export async function listBranches(orgId: string) {
  const branches = await backendFetch<Branch[]>(
    `/internal/branches?org_id=${encodeURIComponent(orgId)}`,
  );
  return branches.map(normalizeBranch);
}

// Devices

export async function createDevice(input: CreateDeviceInput) {
  const device = await backendFetch<Device>("/internal/devices", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      org_id: numericId(input.org_id),
      branch_id: numericId(input.branch_id),
    }),
  });
  return normalizeDevice(device);
}

export async function listDevices(orgId: string) {
  const devices = await backendFetch<Device[]>(
    `/internal/devices?org_id=${encodeURIComponent(orgId)}`,
  );
  return devices.map(normalizeDevice);
}

// POS accounts

export async function createPosAccount(input: CreatePosAccountInput) {
  const account = await backendFetch<BackendUser>("/internal/accounts/pos", {
    method: "POST",
    body: JSON.stringify({
      ...input,
      org_id: numericId(input.org_id),
      device_id: numericId(input.device_id),
    }),
  });
  return normalizeUser(account);
}

export async function listPosAccounts(orgId: string) {
  const accounts = await backendFetch<BackendUser[]>(
    `/internal/accounts/pos?org_id=${encodeURIComponent(orgId)}`,
  );
  return accounts.map(normalizeUser);
}

export function setPosAccountStatus(accountId: string, status: OrgStatus) {
  return backendFetch<void>(`/internal/accounts/pos/${accountId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function resetPosPassword(accountId: string, password: string) {
  return backendFetch<void>(
    `/internal/accounts/pos/${accountId}/reset-password`,
    {
      method: "POST",
      body: JSON.stringify({ password }),
    },
  );
}

// Subscription tiers

export function listPlans() {
  return backendFetch<PlanCatalog>("/internal/plans");
}

function normalizeSubscription(sub: Subscription): Subscription {
  return {
    ...coerceIds(sub, ["organization_id"]),
    overrides: sub.overrides.map((o) => coerceIds(o, ["id", "org_id"])),
    history: sub.history.map((h) => coerceIds(h, ["id", "org_id"])),
  };
}

export async function getSubscription(orgId: string) {
  const sub = await backendFetch<Subscription>(
    `/internal/organizations/${encodeURIComponent(orgId)}/subscription`,
  );
  return normalizeSubscription(sub);
}

export async function updateSubscription(
  orgId: string,
  input: UpdateSubscriptionInput,
) {
  const sub = await backendFetch<Subscription>(
    `/internal/organizations/${encodeURIComponent(orgId)}/subscription`,
    { method: "PATCH", body: JSON.stringify(input) },
  );
  return normalizeSubscription(sub);
}

export async function setFeatureOverride(
  orgId: string,
  feature: string,
  enabled: boolean,
  changedBy: string,
) {
  const sub = await backendFetch<Subscription>(
    `/internal/organizations/${encodeURIComponent(orgId)}/features/${encodeURIComponent(feature)}`,
    {
      method: "PUT",
      body: JSON.stringify({ enabled, changed_by: changedBy }),
    },
  );
  return normalizeSubscription(sub);
}

export async function clearFeatureOverride(
  orgId: string,
  feature: string,
  changedBy: string,
) {
  const sub = await backendFetch<Subscription>(
    `/internal/organizations/${encodeURIComponent(orgId)}/features/${encodeURIComponent(feature)}`,
    {
      method: "DELETE",
      body: JSON.stringify({ changed_by: changedBy }),
    },
  );
  return normalizeSubscription(sub);
}
