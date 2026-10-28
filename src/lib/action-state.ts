import { BackendError } from "@/lib/backend/client";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export function errorMessage(err: unknown): string {
  if (err instanceof BackendError) {
    if (err.code === "plan_limit_reached") {
      const devices = err.details.limit === "devices";
      const max = Number(err.details.max);
      const what = devices ? "device" : "branch";
      const whats = devices ? "devices" : "branches";
      return `This plan allows ${max} active ${max === 1 ? what : whats} (it has ${err.details.current}). Change the tier or add extra ${whats} first.`;
    }
    return err.message || `Backend request failed (${err.status})`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong";
}
