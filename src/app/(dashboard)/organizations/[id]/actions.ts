"use server";

import { revalidatePath } from "next/cache";
import * as backend from "@/lib/backend/client";
import { prisma } from "@/lib/prisma";
import type { OrgStatus } from "@/lib/backend/types";
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
