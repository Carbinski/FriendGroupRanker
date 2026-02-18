"use client";

import { UserChip } from "@/components/dashboard/user-chip";
import { ActiveUsersDropdown } from "@/components/dashboard/active-users-dropdown";
import type { ClockInPublic } from "@/types";

interface DashboardTopBarProps {
  displayName: string;
  clockIns: ClockInPublic[];
  showActiveList: boolean;
  onToggleActiveList: () => void;
  onCloseActiveList: () => void;
  onSelectActiveUser: (lat: number, lng: number) => void;
  onLogout: () => void;
}

export function DashboardTopBar({
  displayName,
  clockIns,
  showActiveList,
  onToggleActiveList,
  onCloseActiveList,
  onSelectActiveUser,
  onLogout,
}: DashboardTopBarProps) {
  return (
    <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between pointer-events-none">
      <UserChip displayName={displayName} onLogout={onLogout} />
      <ActiveUsersDropdown
        clockIns={clockIns}
        isOpen={showActiveList}
        onToggle={onToggleActiveList}
        onClose={onCloseActiveList}
        onSelectUser={onSelectActiveUser}
      />
    </div>
  );
}
