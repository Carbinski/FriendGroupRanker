"use client";

export function DashboardLoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        Loading…
      </div>
    </div>
  );
}
