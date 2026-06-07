import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";
import { Button } from "../components/ui/button";
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
    <main className="grid min-h-screen bg-background lg:grid-cols-[1fr_480px]">
      <section className="hidden border-r border-border bg-muted/50 p-10 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">E-Commerce Analytics</p>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight">
            Daily store performance, organized for fast decisions.
          </h1>
        </div>
        <dl className="grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-8">
          {[
            ["50", "Orders"],
            ["90", "Days tracked"],
            ["5", "Views"]
          ].map(([value, label]) => (
            <div key={label}>
              <dt className="text-2xl font-semibold">{value}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
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
      <p className="mt-6 text-sm text-muted-foreground">
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
      <p className="mt-6 text-sm text-muted-foreground">
        Already registered?{" "}
        <Link className="font-medium text-primary hover:underline" to="/login">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
