import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Avatar } from "@/components/Avatar";
import { StatCard } from "@/components/StatCard";
import {
  ArrowRightIcon,
  BookOpenIcon,
  BuildingIcon,
  GraduationCapIcon,
  UsersIcon,
} from "@/components/icons";
import { SERVICE_COLORS, SERVICE_ICONS, type ServiceType } from "@/lib/buyer/types";
import { CreateBuyerForm } from "./CreateBuyerForm";

export default async function BuyersPage() {
  const buyers = await prisma.buyer.findMany({
    orderBy: { createdAt: "desc" },
    include: { services: true },
  });

  const totals = { organization: 0, school: 0, course: 0 };
  for (const buyer of buyers) {
    for (const service of buyer.services) {
      const type = service.serviceType as ServiceType;
      if (type in totals) totals[type as keyof typeof totals] += 1;
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buyers</h1>
          <p className="mt-1 text-sm text-slate-500">
            Customers who&apos;ve purchased Shagan services.
          </p>
        </div>
        <CreateBuyerForm />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total buyers"
          value={buyers.length}
          icon={<UsersIcon className="h-5 w-5 text-indigo-600" />}
          accent="bg-indigo-50"
        />
        <StatCard
          label="Organizations"
          value={totals.organization}
          icon={<BuildingIcon className="h-5 w-5 text-blue-600" />}
          accent="bg-blue-50"
        />
        <StatCard
          label="Schools"
          value={totals.school}
          icon={<GraduationCapIcon className="h-5 w-5 text-violet-600" />}
          accent="bg-violet-50"
        />
        <StatCard
          label="Courses"
          value={totals.course}
          icon={<BookOpenIcon className="h-5 w-5 text-amber-600" />}
          accent="bg-amber-50"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Buyer</th>
              <th className="px-5 py-3.5">Company</th>
              <th className="px-5 py-3.5">Services</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {buyers.map((buyer) => {
              const types = Array.from(
                new Set(buyer.services.map((s) => s.serviceType)),
              ) as ServiceType[];

              return (
                <tr
                  key={buyer.id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={buyer.name} />
                      <div>
                        <p className="font-medium text-slate-900">
                          {buyer.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {buyer.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {buyer.company ?? "—"}
                  </td>
                  <td className="px-5 py-4">
                    {types.length === 0 ? (
                      <span className="text-slate-400">No services yet</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {types.map((type) => {
                          const Icon = SERVICE_ICONS[type];
                          return (
                            <span
                              key={type}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SERVICE_COLORS[type].badge}`}
                            >
                              <Icon className="h-3 w-3" />
                              {
                                buyer.services.filter(
                                  (s) => s.serviceType === type,
                                ).length
                              }
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/buyers/${buyer.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      View
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
            {buyers.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-slate-500"
                >
                  No buyers yet. Create your first buyer to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
