import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Crown, UserCheck, UserPlus, Users } from "lucide-react";

import { apiClient } from "../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/app-store";
import { cn } from "../utils/cn";
import { formatEuroCurrency, formatNumber } from "../utils/formatters";

interface TopCustomer {
  name: string;
  email: string;
  ltv: number;
}

interface CustomersResponse {
  newCount: number;
  returningCount: number;
  topByLtv: TopCustomer[];
}

function useCustomersQuery() {
  const dateRange = useAppStore((state) => state.dateRange);

  return useQuery({
    queryKey: ["customers", dateRange],
    queryFn: async () => {
      const response = await apiClient.get<CustomersResponse>("/customers", {
        params: dateRange
      });
      return response.data;
    }
  });
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  isLoading
}: {
  title: string;
  value: number;
  icon: typeof Users;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        {isLoading ? (
          <SkeletonBlock className="mt-5 h-8 w-20" />
        ) : (
          <p className="mt-5 text-3xl font-semibold tracking-tight">{formatNumber(value)}</p>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-muted/40 px-6 py-12 text-center text-sm text-muted-foreground">
      <Users className="mb-3 h-8 w-8" />
      <p className="font-medium text-foreground">No customers found</p>
      <p className="mt-1">Top customer LTV data will appear when customer records exist.</p>
    </div>
  );
}

export function CustomersPage() {
  const { data, isLoading, isError } = useCustomersQuery();
  const topCustomers = data?.topByLtv ?? [];
  const totalCustomers = (data?.newCount ?? 0) + (data?.returningCount ?? 0);

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            New, returning, and high lifetime value customers across the selected date range.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard icon={UserPlus} isLoading={isLoading} title="New Customers" value={data?.newCount ?? 0} />
        <SummaryCard
          icon={UserCheck}
          isLoading={isLoading}
          title="Returning Customers"
          value={data?.returningCount ?? 0}
        />
        <SummaryCard icon={Users} isLoading={isLoading} title="Total Customers" value={totalCustomers} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top customers by LTV</CardTitle>
          <CardDescription>Highest lifetime value customers in the demo store.</CardDescription>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              Customer data could not be loaded.
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <SkeletonBlock className="h-12 w-full" key={index} />
              ))}
            </div>
          ) : null}

          {!isLoading && !isError && topCustomers.length === 0 ? <EmptyState /> : null}

          {!isLoading && !isError && topCustomers.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 text-right font-medium">Lifetime Value</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((customer, index) => (
                    <tr className="border-b border-border last:border-0 hover:bg-muted/40" key={customer.email}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                            {index === 0 ? <Crown className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                          </div>
                          <span className="font-medium">{customer.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">{customer.email}</td>
                      <td className="px-4 py-4 text-right font-semibold">{formatEuroCurrency(customer.ltv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
