"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import * as backend from "@/lib/backend/client";
import { errorMessage, type ActionState } from "@/lib/action-state";

export async function addOrganizationServiceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const buyer_id = String(formData.get("buyer_id") ?? "");
  const organization_name = String(formData.get("organization_name") ?? "");
  const owner_email = String(formData.get("owner_email") ?? "");
  const owner_password = String(formData.get("owner_password") ?? "");
  const service_center_email = String(
    formData.get("service_center_email") ?? "",
  );
  const service_center_password = String(
    formData.get("service_center_password") ?? "",
  );

  try {
    const result = await backend.createOrganization({
      organization_name,
      owner_email,
      owner_password,
      service_center_email,
      service_center_password,
    });

    await prisma.buyerService.create({
      data: {
        buyerId: buyer_id,
        serviceType: "organization",
        externalId: result.organization.id,
        label: result.organization.name,
        status: result.organization.status,
      },
    });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/buyers/${buyer_id}`);
  return { success: true };
}
