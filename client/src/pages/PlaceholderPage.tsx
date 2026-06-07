import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "../components/ui/card";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {["Primary metric", "Recent movement", "Next view"].map((label) => (
          <Card key={label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-2xl font-semibold">Phase 7</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-8">
        <p className="text-sm font-medium">Chart and table modules are reserved for the next phase.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          This route is protected and rendered inside the shared application layout.
        </p>
      </div>
    </section>
  );
}
