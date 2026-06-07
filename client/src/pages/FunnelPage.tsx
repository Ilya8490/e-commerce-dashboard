import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, ShoppingCart, Waypoints } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { apiClient } from "../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/app-store";
import { cn } from "../utils/cn";
import { formatNumber, formatPercent } from "../utils/formatters";

interface FunnelStep {
  label: string;
  count: number;
  rate: number;
}

interface FunnelResponse {
  steps: FunnelStep[];
}

interface FunnelTooltipPayload {
  payload?: FunnelStep;
}

function useFunnelQuery() {
  const dateRange = useAppStore((state) => state.dateRange);

  return useQuery({
    queryKey: ["funnel", dateRange],
    queryFn: async () => {
      const response = await apiClient.get<FunnelResponse>("/funnel", {
        params: dateRange
      });
      return response.data;
    }
  });
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function ChartLoading() {
  return <SkeletonBlock className="h-[320px] w-full" />;
}

function ChartError() {
  return (
    <div className="flex h-[320px] items-center justify-center rounded-md bg-muted/40 text-sm text-muted-foreground">
      Funnel data could not be loaded.
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[320px] flex-col items-center justify-center rounded-md bg-muted/40 text-center text-sm text-muted-foreground">
      <Waypoints className="mb-3 h-8 w-8" />
      <p className="font-medium text-foreground">No funnel activity</p>
      <p className="mt-1">Try a wider date range when controls are available.</p>
    </div>
  );
}

export function FunnelPage() {
  const { data, isLoading, isError } = useFunnelQuery();
  const steps = data?.steps ?? [];
  const isEmpty = !isLoading && !isError && steps.every((step) => step.count === 0);
  const orderStep = steps.find((step) => step.label === "Order");
  const checkoutStep = steps.find((step) => step.label === "Checkout");

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Funnel</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Conversion from visit through order across the selected date range.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total visits</p>
            {isLoading ? <SkeletonBlock className="mt-4 h-8 w-28" /> : <p className="mt-4 text-3xl font-semibold">{formatNumber(steps[0]?.count ?? 0)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Checkout to order</p>
            {isLoading ? (
              <SkeletonBlock className="mt-4 h-8 w-24" />
            ) : (
              <p className="mt-4 text-3xl font-semibold">{formatPercent(orderStep?.rate ?? 0)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Checkout volume</p>
            {isLoading ? (
              <SkeletonBlock className="mt-4 h-8 w-24" />
            ) : (
              <p className="mt-4 text-3xl font-semibold">{formatNumber(checkoutStep?.count ?? 0)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Horizontal funnel</CardTitle>
            <CardDescription>Step volume with conversion rate from the previous step.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartLoading />
            ) : isError ? (
              <ChartError />
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <div className="h-[320px]">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={steps} layout="vertical" margin={{ bottom: 8, left: 20, right: 20, top: 8 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis axisLine={false} tickFormatter={(value: number) => formatNumber(value)} tickLine={false} type="number" />
                    <YAxis axisLine={false} dataKey="label" tickLine={false} type="category" width={110} />
                    <Tooltip
                      content={({ active, payload }: { active?: boolean; payload?: FunnelTooltipPayload[] }) => {
                        const step = payload?.[0]?.payload;

                        if (!active || !step) {
                          return null;
                        }

                        return (
                          <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">
                            <p className="font-medium">{step.label}</p>
                            <p className="text-muted-foreground">{formatNumber(step.count)} events</p>
                            <p className="text-muted-foreground">{formatPercent(step.rate)} from previous</p>
                          </div>
                        );
                      }}
                      cursor={{ fill: "hsl(var(--muted))" }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion table</CardTitle>
            <CardDescription>Step-by-step drop-off through the purchase path.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <SkeletonBlock className="h-10 w-full" key={index} />
                ))}
              </div>
            ) : isError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Funnel table unavailable.
              </div>
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3" key={step.label}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent text-accent-foreground">
                        {index === steps.length - 1 ? <ShoppingCart className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{step.label}</p>
                        <p className="text-xs text-muted-foreground">{formatPercent(step.rate)} from previous</p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatNumber(step.count)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
