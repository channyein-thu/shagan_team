"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import * as backend from "@/lib/backend/client";
import { errorMessage, type ActionState } from "@/lib/action-state";
import type { ServiceType } from "@/lib/buyer/types";

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

export async function addMockServiceAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const buyer_id = String(formData.get("buyer_id") ?? "");
  const serviceType = String(formData.get("service_type") ?? "") as
    | "school"
    | "course";
  const name = String(formData.get("name") ?? "").trim();
  const contact_email = String(formData.get("contact_email") ?? "").trim();

  if (!name) {
    return { error: "Name is required." };
  }
  if (serviceType !== "school" && serviceType !== "course") {
    return { error: "Invalid service type." };
  }

  try {
    await prisma.buyerService.create({
      data: {
        buyerId: buyer_id,
        serviceType,
        externalId: `mock-${serviceType}-${randomUUID()}`,
        label: name,
        status: "active",
        metadata: JSON.stringify({ contactEmail: contact_email || null }),
      },
    });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/buyers/${buyer_id}`);
  return { success: true };
}

export async function toggleMockServiceStatusAction(
  serviceId: string,
  buyerId: string,
  nextStatus: "active" | "suspended",
) {
  const service = await prisma.buyerService.findUnique({
    where: { id: serviceId },
  });
  if (!service || service.buyerId !== buyerId) {
    throw new Error("Service not found.");
  }
  const mockedTypes: ServiceType[] = ["school", "course"];
  if (!mockedTypes.includes(service.serviceType as ServiceType)) {
    throw new Error("Only mocked services can be toggled here.");
  }

  await prisma.buyerService.update({
    where: { id: serviceId },
    data: { status: nextStatus },
  });
  revalidatePath(`/buyers/${buyerId}`);
  revalidatePath(`/buyers/${buyerId}/services/${serviceId}`);
}
