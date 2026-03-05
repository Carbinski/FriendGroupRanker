"use client";

import { UserChip } from "@/components/dashboard/user-chip";
import { ActiveUsersDropdown } from "@/components/dashboard/active-users-dropdown";
import type { ClockInPublic } from "@/types";

interface DashboardTopBarProps {
  displayName: string;
  isAdmin: boolean;
  clockIns: ClockInPublic[];
  showActiveList: boolean;
  onToggleActiveList: () => void;
  onCloseActiveList: () => void;
  onSelectActiveUser: (lat: number, lng: number) => void;
  onLogout: () => void;
  onToggleAdminToolbar: () => void;
}

export function DashboardTopBar({
  displayName,
  isAdmin,
  clockIns,
  showActiveList,
  onToggleActiveList,
  onCloseActiveList,
  onSelectActiveUser,
  onLogout,
  onToggleAdminToolbar,
}: DashboardTopBarProps) {
  return (
    <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between pointer-events-none">
      <UserChip
        displayName={displayName}
        isAdmin={isAdmin}
        onLogout={onLogout}
        onToggleAdminToolbar={onToggleAdminToolbar}
      />
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
