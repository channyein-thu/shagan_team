import { BackendError } from "@/lib/backend/client";

export interface ActionState {
  error?: string;
  success?: boolean;
}

export function errorMessage(err: unknown): string {
  if (err instanceof BackendError) {
    return err.message || `Backend request failed (${err.status})`;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong";
}
