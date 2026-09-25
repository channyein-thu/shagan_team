"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorMessage, type ActionState } from "@/lib/action-state";

export async function addMockStudentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const buyer_id = String(formData.get("buyer_id") ?? "");
  const service_id = String(formData.get("service_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    await prisma.mockStudent.create({
      data: { serviceId: service_id, name, email, status: "active" },
    });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath(`/buyers/${buyer_id}/services/${service_id}`);
  return { success: true };
}

export async function toggleMockStudentStatusAction(
  studentId: string,
  buyerId: string,
  serviceId: string,
  nextStatus: "active" | "suspended",
) {
  const student = await prisma.mockStudent.findUnique({
    where: { id: studentId },
  });
  if (!student || student.serviceId !== serviceId) {
    throw new Error("Student not found.");
  }

  await prisma.mockStudent.update({
    where: { id: studentId },
    data: { status: nextStatus },
  });
  revalidatePath(`/buyers/${buyerId}/services/${serviceId}`);
}
