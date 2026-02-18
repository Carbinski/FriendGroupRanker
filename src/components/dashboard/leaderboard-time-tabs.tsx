"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TimeRange } from "@/hooks/use-leaderboard";

const TAB_TRIGGER_CLASS =
  "flex-1 text-xs data-[state=active]:bg-emerald-600 data-[state=active]:text-white";

interface LeaderboardTimeTabsProps {
  value: TimeRange;
  onValueChange: (value: TimeRange) => void;
}

export function LeaderboardTimeTabs({
  value,
  onValueChange,
}: LeaderboardTimeTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onValueChange(v as TimeRange)}
      className="mt-2"
    >
      <TabsList className="w-full bg-slate-700/50">
        <TabsTrigger value="all" className={TAB_TRIGGER_CLASS}>
          All Time
        </TabsTrigger>
        <TabsTrigger value="month" className={TAB_TRIGGER_CLASS}>
          Month
        </TabsTrigger>
        <TabsTrigger value="week" className={TAB_TRIGGER_CLASS}>
          Week
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
