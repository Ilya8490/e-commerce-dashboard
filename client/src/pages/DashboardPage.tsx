import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowDownRight, ArrowUpRight, DollarSign, PackageCheck, Percent, Receipt } from "lucide-react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { apiClient } from "../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/app-store";
import { cn } from "../utils/cn";
import { formatCurrency, formatNumber, formatPercent, formatShortDate } from "../utils/formatters";

interface RevenuePoint {
  date: string;
  revenue: number;
}

interface OrderStatusPoint {
  status: string;
  count: number;
}

interface OverviewResponse {
  revenue: number;
  orders: number;
  cvr: number;
  aov: number;
  revenueDelta: number;
  ordersDelta: number;
  revenueChart: RevenuePoint[];
  orderStatusChart: OrderStatusPoint[];
}

interface TooltipPayload {
  value: number;
  payload?: RevenuePoint;
}

interface StatusTooltipPayload {
  payload?: OrderStatusPoint;
}

const statusColors = ["#0f766e", "#2563eb", "#7c3aed", "#f59e0b", "#dc2626"];

function useOverviewQuery() {
  const dateRange = useAppStore((state) => state.dateRange);

  return useQuery({
    queryKey: ["dashboard", "overview", dateRange],
    queryFn: async () => {
      const response = await apiClient.get<OverviewResponse>("/dashboard/overview", {
        params: dateRange
      });
      return response.data;
    }
  });
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function DeltaBadge({ value }: { value?: number }) {
  if (value === undefined) {
    return null;
  }

  const isPositive = value >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
        isPositive ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-destructive/10 text-destructive"
      )}
    >
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {formatPercent(Math.abs(value))}
    </span>
  );
}

function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  isLoading,
  isError
}: {
  title: string;
  value: string;
  delta?: number;
  icon: typeof DollarSign;
  isLoading: boolean;
  isError: boolean;
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
          <div className="mt-5 space-y-3">
            <SkeletonBlock className="h-8 w-28" />
            <SkeletonBlock className="h-5 w-20" />
          </div>
        ) : isError ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            Unavailable
          </div>
        ) : (
          <div className="mt-5 flex items-end justify-between gap-3">
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <DeltaBadge value={delta} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RevenueTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.[0]) {
    return null;
  }

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">
      <p className="font-medium">{formatShortDate(payload[0].payload?.date ?? "")}</p>
      <p className="text-muted-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function ChartError() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-md bg-muted/40 text-sm text-muted-foreground">
      Chart data could not be loaded.
    </div>
  );
}

function ChartLoading() {
  return <SkeletonBlock className="h-[320px] w-full" />;
}

function humanizeStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DashboardPage() {
  const { data, isLoading, isError } = useOverviewQuery();

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Overview of revenue, orders, conversion rate, and average order value.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          delta={data?.revenueDelta}
          icon={DollarSign}
          isError={isError}
          isLoading={isLoading}
          title="Total Revenue"
          value={formatCurrency(data?.revenue ?? 0)}
        />
        <KpiCard
          delta={data?.ordersDelta}
          icon={Receipt}
          isError={isError}
          isLoading={isLoading}
          title="Total Orders"
          value={formatNumber(data?.orders ?? 0)}
        />
        <KpiCard
          icon={Percent}
          isError={isError}
          isLoading={isLoading}
          title="Conversion Rate"
          value={formatPercent(data?.cvr ?? 0)}
        />
        <KpiCard
          icon={PackageCheck}
          isError={isError}
          isLoading={isLoading}
          title="Average Order Value"
          value={formatCurrency(data?.aov ?? 0)}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Daily revenue across the selected date range.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartLoading />
            ) : isError ? (
              <ChartError />
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={data?.revenueChart ?? []} margin={{ left: 8, right: 16, top: 12 }}>
                    <XAxis
                      axisLine={false}
                      dataKey="date"
                      minTickGap={28}
                      tickFormatter={formatShortDate}
                      tickLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickFormatter={(value: number) => formatCurrency(value)}
                      tickLine={false}
                      tickMargin={10}
                      width={72}
                    />
                    <Tooltip content={<RevenueTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
                    <Line
                      dataKey="revenue"
                      dot={false}
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      type="monotone"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
            <CardDescription>Status mix for orders in the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartLoading />
            ) : isError ? (
              <ChartError />
            ) : (
              <div className="grid gap-4 lg:grid-cols-[180px_1fr] xl:grid-cols-1">
                <div className="h-[220px]">
                  <ResponsiveContainer height="100%" width="100%">
                    <PieChart>
                      <Pie
                        cx="50%"
                        cy="50%"
                        data={data?.orderStatusChart ?? []}
                        dataKey="count"
                        innerRadius={58}
                        outerRadius={86}
                        paddingAngle={2}
                      >
                        {(data?.orderStatusChart ?? []).map((entry, index) => (
                          <Cell fill={statusColors[index % statusColors.length]} key={entry.status} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }: { active?: boolean; payload?: StatusTooltipPayload[] }) => {
                          const point = payload?.[0]?.payload;

                          if (!active || !point) {
                            return null;
                          }

                          return (
                            <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">
                              <p className="font-medium">{humanizeStatus(point.status)}</p>
                              <p className="text-muted-foreground">{formatNumber(point.count)} orders</p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {(data?.orderStatusChart ?? []).map((point, index) => (
                    <div className="flex items-center justify-between gap-4 text-sm" key={point.status}>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: statusColors[index % statusColors.length] }}
                        />
                        <span>{humanizeStatus(point.status)}</span>
                      </div>
                      <span className="font-medium">{formatNumber(point.count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
