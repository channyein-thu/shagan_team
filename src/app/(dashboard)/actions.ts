"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { errorMessage, type ActionState } from "@/lib/action-state";

export type { ActionState };

export async function createBuyerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const billingAddress = String(formData.get("billingAddress") ?? "").trim();

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    await prisma.buyer.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        billingAddress: billingAddress || null,
      },
    });
  } catch (err) {
    return { error: errorMessage(err) };
  }

  revalidatePath("/");
  return { success: true };
}
