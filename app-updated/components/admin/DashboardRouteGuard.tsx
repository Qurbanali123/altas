"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissions } from "@/context/PermissionsContext";
import {
  firstAllowedDashboardPath,
  getModuleForPath,
} from "@/utils/permissions";

export default function DashboardRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading, canViewModule } = usePermissions();

  const allowed = useMemo(() => {
    if (loading || !session) return null;

    const moduleKey = getModuleForPath(pathname);
    if (!moduleKey) return true;

    return canViewModule(moduleKey);
  }, [loading, session, pathname, canViewModule]);

  useEffect(() => {
    if (allowed !== false || !session) return;

    const fallback = firstAllowedDashboardPath(
      session.permissions,
      session.isSuperAdmin,
    );
    router.replace(fallback);
  }, [allowed, session, router]);

  if (loading && !session) {
    return (
      <div style={{ minHeight: "40vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#591727" }}>Checking access...</p>
      </div>
    );
  }

  if (allowed === false) {
    return null;
  }

  return <>{children}</>;
}
