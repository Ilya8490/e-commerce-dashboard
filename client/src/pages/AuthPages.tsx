import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

function AuthShell({
  children,
  title,
  subtitle
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-background shadow-sm lg:grid-cols-[1fr_420px]">
        <div className="hidden bg-card p-10 lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">E-Commerce Analytics</p>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight">
              Store performance, organized for daily review.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
              Sign in to inspect revenue, products, funnel, traffic, and customer workspaces.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-border pt-8">
            {[
              ["50", "Orders"],
              ["90", "Days"],
              ["5", "Views"]
            ].map(([value, label]) => (
              <div className="rounded-md bg-muted px-4 py-3" key={label}>
                <dt className="text-2xl font-semibold">{value}</dt>
                <dd className="mt-1 text-xs text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              {children}
              <div className="mt-6 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Demo credentials</p>
                <p className="mt-1">Email: demo@demo.com</p>
                <p>Password: demo1234</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

export function LoginPage() {
  const { login, authError } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await login({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    });
  }

  return (
    <AuthShell title="Sign in" subtitle="Use the demo account or your registered store profile.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input autoComplete="email" defaultValue="demo@demo.com" id="email" name="email" type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="current-password"
            defaultValue="demo1234"
            id="password"
            name="password"
            type="password"
          />
        </div>
        {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
        <Button className="w-full" type="submit">
          Sign in
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New store profile?{" "}
        <Link className="font-medium text-primary hover:underline" to="/register">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register, authError } = useAuth();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    await register({
      storeName: String(formData.get("storeName") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    });
  }

  return (
    <AuthShell title="Create account" subtitle="Start a protected dashboard session for your store.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="storeName">Store name</Label>
          <Input autoComplete="organization" id="storeName" name="storeName" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input autoComplete="email" id="email" name="email" type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input autoComplete="new-password" id="password" name="password" type="password" />
        </div>
        {authError ? <p className="text-sm text-destructive">{authError}</p> : null}
        <Button className="w-full" type="submit">
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link className="font-medium text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
