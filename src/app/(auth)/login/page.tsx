"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let json: { error?: string } = {};
      try {
        json = await res.json();
      } catch {
        // Server may have returned non-JSON (e.g. 500 error page)
      }

      if (!res.ok) {
        const message =
          res.status === 401
            ? json.error || "Invalid email or password"
            : json.error || "Login failed";
        setError(message);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      {/* Campus background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/campus.jpg)" }}
        aria-hidden
      />
      {/* Darkened overlay to match app color scheme (slate) */}
      <div className="absolute inset-0 bg-slate-900/70" aria-hidden />
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full border-slate-700 bg-slate-800/80 shadow-2xl backdrop-blur-sm">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
          <MapPin className="h-6 w-6 text-emerald-400" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-slate-400">
          Sign in to your Friend Group Ranker account
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-2">
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-6">
          <Button
            type="submit"
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
          <p className="text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
      </div>
    </div>
  );
}
