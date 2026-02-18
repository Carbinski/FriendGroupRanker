"use client";

interface AuthPageBackgroundProps {
  children: React.ReactNode;
}

export function AuthPageBackground({ children }: AuthPageBackgroundProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/campus.jpg)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-slate-900/70" aria-hidden />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
