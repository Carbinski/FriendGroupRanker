"use client";

import { MapPin } from "lucide-react";
import {
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface AuthCardHeaderProps {
  title: string;
  description: string;
}

export function AuthCardHeader({ title, description }: AuthCardHeaderProps) {
  return (
    <CardHeader className="space-y-2 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
        <MapPin className="h-6 w-6 text-emerald-400" />
      </div>
      <CardTitle className="text-2xl font-bold text-white">{title}</CardTitle>
      <CardDescription className="text-slate-400">{description}</CardDescription>
    </CardHeader>
  );
}
