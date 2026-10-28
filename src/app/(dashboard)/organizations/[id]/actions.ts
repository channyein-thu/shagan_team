"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import * as backend from "@/lib/backend/client";
import { prisma } from "@/lib/prisma";
import type { OrgStatus, PlanCode } from "@/lib/backend/types";
import { errorMessage, type ActionState } from "@/lib/action-state";

export type { ActionState };

async function revalidateOwningBuyer(orgId: string) {
  const service = await prisma.buyerService.findFirst({
    where: { serviceType: "organization", externalId: orgId },
  });
  if (service) {
    revalidatePath(`/buyers/${service.buyerId}`);
  }
}

export async function createBranchAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const org_id = String(formData.get("org_id") ?? "");
  const name = String(formData.get("name") ?? "");
  const address = String(formData.get("address") ?? "");
  const phone = String(formData.get("phone") ?? "");

  try {
    await backend.createBranch({
      org_id,
      name,
      status: "active",
      address,
      phone,
    });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/organizations/${org_id}`);
  return { success: true };
}

export async function createDeviceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const org_id = String(formData.get("org_id") ?? "");
  const branch_id = String(formData.get("branch_id") ?? "");
  const name = String(formData.get("name") ?? "");

  if (!branch_id) {
    return { error: "Select a branch for this device." };
  }

  try {
    await backend.createDevice({ org_id, branch_id, name, status: "active" });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/organizations/${org_id}`);
  return { success: true };
}

export async function createPosAccountAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const org_id = String(formData.get("org_id") ?? "");
  const device_id = String(formData.get("device_id") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!device_id) {
    return { error: "Select a device for this POS account." };
  }

  try {
    await backend.createPosAccount({ org_id, device_id, email, password });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/organizations/${org_id}`);
  return { success: true };
}

export async function setOrganizationStatusAction(
  orgId: string,
  status: OrgStatus,
) {
  await backend.setOrganizationStatus(orgId, status);
  revalidatePath(`/organizations/${orgId}`);
  await revalidateOwningBuyer(orgId);
}

export async function setPosAccountStatusAction(
  accountId: string,
  orgId: string,
  status: OrgStatus,
) {
  await backend.setPosAccountStatus(accountId, status);
  revalidatePath(`/organizations/${orgId}`);
}

export async function resetPosPasswordAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const account_id = String(formData.get("account_id") ?? "");
  const org_id = String(formData.get("org_id") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  try {
    await backend.resetPosPassword(account_id, password);
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/organizations/${org_id}`);
  return { success: true };
}

// Subscription writes record who made them (changed_by); the internal API has
// no user of its own, so it's the signed-in admin's email.
async function adminEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    throw new Error("You need to be signed in.");
  }
  return email;
}

const PLAN_CODES: PlanCode[] = ["basic", "pro", "enterprise"];

/** A whole number >= 0 from a form field, or null if it isn't one. */
function count(value: FormDataEntryValue | null): number | null {
  const text = String(value ?? "").trim();
  if (text === "") return 0;
  const n = Number(text);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export async function updateSubscriptionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const org_id = String(formData.get("org_id") ?? "");
  const plan = String(formData.get("plan") ?? "") as PlanCode;
  // A date input; blank = no end date. The plan runs to the end of that day
  // in Myanmar time.
  const endDate = String(formData.get("expires_on") ?? "").trim();
  const extra_branches = count(formData.get("extra_branches"));
  const extra_devices = count(formData.get("extra_devices"));
  const note = String(formData.get("note") ?? "").trim();

  if (!PLAN_CODES.includes(plan)) {
    return { error: "Choose a tier." };
  }
  if (extra_branches === null || extra_devices === null) {
    return { error: "Extra branches and devices must be whole numbers, 0 or more." };
  }

  try {
    await backend.updateSubscription(org_id, {
      plan,
      expires_at: endDate ? `${endDate}T23:59:59+06:30` : null,
      trial: formData.get("trial") === "on",
      extra_branches,
      extra_devices,
      note,
      changed_by: await adminEmail(),
    });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/organizations/${org_id}`);
  await revalidateOwningBuyer(org_id);
  return { success: true };
}

/** "default" removes the override, so the plan decides again. */
export async function setFeatureOverrideAction(
  orgId: string,
  feature: string,
  mode: "on" | "off" | "default",
) {
  const changedBy = await adminEmail();
  if (mode === "default") {
    await backend.clearFeatureOverride(orgId, feature, changedBy);
  } else {
    await backend.setFeatureOverride(orgId, feature, mode === "on", changedBy);
  }
  revalidatePath(`/organizations/${orgId}`);
}
