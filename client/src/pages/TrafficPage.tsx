import { useQuery } from "@tanstack/react-query";
import { AlertCircle, MousePointerClick, RadioTower, Trophy } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { apiClient } from "../api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAppStore } from "../store/app-store";
import { cn } from "../utils/cn";
import { formatNumber, formatPercent } from "../utils/formatters";

interface TrafficSource {
  source: "organic" | "paid" | "direct" | "social" | "email";
  visits: number;
  percentage: number;
}

interface TrafficResponse {
  sources: TrafficSource[];
}

interface TrafficTooltipPayload {
  payload?: TrafficSource;
}

const sourceColors = ["#0f766e", "#2563eb", "#7c3aed", "#f59e0b", "#dc2626"];

function useTrafficQuery() {
  const dateRange = useAppStore((state) => state.dateRange);

  return useQuery({
    queryKey: ["traffic", dateRange],
    queryFn: async () => {
      const response = await apiClient.get<TrafficResponse>("/traffic", {
        params: dateRange
      });
      return response.data;
    }
  });
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

function sourceLabel(source: string) {
  return source.charAt(0).toUpperCase() + source.slice(1);
}

function EmptyState() {
  return (
    <div className="flex h-[300px] flex-col items-center justify-center rounded-md bg-muted/40 text-center text-sm text-muted-foreground">
      <RadioTower className="mb-3 h-8 w-8" />
      <p className="font-medium text-foreground">No traffic sources</p>
      <p className="mt-1">Traffic will appear when session data exists for the selected range.</p>
    </div>
  );
}

export function TrafficPage() {
  const { data, isLoading, isError } = useTrafficQuery();
  const sources = data?.sources ?? [];
  const isEmpty = !isLoading && !isError && sources.length === 0;
  const totalVisits = sources.reduce((sum, source) => sum + source.visits, 0);
  const topSource = sources[0];

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Traffic</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Visit distribution by source across the selected date range.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total visits</p>
            {isLoading ? <SkeletonBlock className="mt-4 h-8 w-28" /> : <p className="mt-4 text-3xl font-semibold">{formatNumber(totalVisits)}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Top source</p>
            {isLoading ? (
              <SkeletonBlock className="mt-4 h-8 w-24" />
            ) : (
              <p className="mt-4 text-3xl font-semibold">{topSource ? sourceLabel(topSource.source) : "None"}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Top source share</p>
            {isLoading ? (
              <SkeletonBlock className="mt-4 h-8 w-24" />
            ) : (
              <p className="mt-4 text-3xl font-semibold">{formatPercent(topSource?.percentage ?? 0)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Traffic mix</CardTitle>
            <CardDescription>Source share by visits.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <SkeletonBlock className="h-[300px] w-full" />
            ) : isError ? (
              <div className="flex h-[300px] items-center justify-center rounded-md bg-muted/40 text-sm text-muted-foreground">
                Traffic chart could not be loaded.
              </div>
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer height="100%" width="100%">
                  <PieChart>
                    <Pie
                      cx="50%"
                      cy="50%"
                      data={sources}
                      dataKey="visits"
                      innerRadius={72}
                      outerRadius={108}
                      paddingAngle={2}
                    >
                      {sources.map((source, index) => (
                        <Cell fill={sourceColors[index % sourceColors.length]} key={source.source} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }: { active?: boolean; payload?: TrafficTooltipPayload[] }) => {
                        const source = payload?.[0]?.payload;

                        if (!active || !source) {
                          return null;
                        }

                        return (
                          <div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">
                            <p className="font-medium">{sourceLabel(source.source)}</p>
                            <p className="text-muted-foreground">{formatNumber(source.visits)} visits</p>
                            <p className="text-muted-foreground">{formatPercent(source.percentage)} share</p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source performance</CardTitle>
            <CardDescription>Visits and percentage share by source.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, index) => (
                  <SkeletonBlock className="h-12 w-full" key={index} />
                ))}
              </div>
            ) : isError ? (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Traffic source table unavailable.
              </div>
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {sources.map((source, index) => (
                  <div className="rounded-md border border-border p-3" key={source.source}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: sourceColors[index % sourceColors.length] }}
                        />
                        <div>
                          <p className="font-medium">{sourceLabel(source.source)}</p>
                          <p className="text-xs text-muted-foreground">{formatPercent(source.percentage)} of traffic</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 font-semibold">
                        {index === 0 ? <Trophy className="h-4 w-4 text-primary" /> : <MousePointerClick className="h-4 w-4 text-muted-foreground" />}
                        {formatNumber(source.visits)}
                      </div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${Math.min(100, source.percentage)}%` }}
                      />
                    </div>
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
