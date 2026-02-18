import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a past timestamp as "Xm ago" / "Xh Ym ago" / "Just now". */
export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}

/** Format time remaining until a future timestamp; returns "Expired" if in the past. Optional suffix (e.g. " left") is appended when not expired. */
export function formatTimeRemaining(dateStr: string, suffix = ""): string {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return "Expired"
  const mins = Math.floor(diff / 60_000)
  const part = mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`
  return part + suffix
}
