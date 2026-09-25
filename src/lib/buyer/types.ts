import {
  BookOpenIcon,
  BuildingIcon,
  GraduationCapIcon,
} from "@/components/icons";

export type ServiceType = "organization" | "school" | "course";

export const SERVICE_LABELS: Record<ServiceType, string> = {
  organization: "Organization (POS)",
  school: "School (Management)",
  course: "Course",
};

export const SERVICE_ICONS: Record<ServiceType, typeof BuildingIcon> = {
  organization: BuildingIcon,
  school: GraduationCapIcon,
  course: BookOpenIcon,
};

// Soft "pill" colors per service type, and a matching outline-button style
// for the "Add X" actions. Keeps organization/school/course visually
// distinct throughout the buyer flow.
export const SERVICE_COLORS: Record<
  ServiceType,
  { badge: string; button: string; icon: string; solid: string }
> = {
  organization: {
    badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20",
    button:
      "border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50",
    icon: "text-blue-600",
    solid: "bg-blue-600",
  },
  school: {
    badge: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/20",
    button:
      "border-violet-200 text-violet-700 hover:border-violet-300 hover:bg-violet-50",
    icon: "text-violet-600",
    solid: "bg-violet-600",
  },
  course: {
    badge: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/20",
    button:
      "border-amber-200 text-amber-800 hover:border-amber-300 hover:bg-amber-50",
    icon: "text-amber-600",
    solid: "bg-amber-500",
  },
};

// School and Course don't have a real backend yet - these services are
// mocked entirely in this app's own Prisma DB so the buyer flow can be
// demonstrated end-to-end. Only "organization" calls the real Go backend.
export const MOCKED_SERVICE_TYPES: ServiceType[] = ["school", "course"];
