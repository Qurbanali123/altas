export interface ModulePermission {
  view: boolean;
  edit: boolean;
}

export type PermissionsMap = Record<string, ModulePermission>;

export const DASHBOARD_ROUTE_MODULES: Record<string, string> = {
  "/dashboard": "dashboard",
  "/dashboard/Appointments": "appointments",
  "/dashboard/Patients": "patients",
  "/dashboard/Staffs": "staffs",
  "/dashboard/Admin_Management": "admin_management",
  "/dashboard/Booking_Slots": "booking_slots",
  "/dashboard/Marketing": "marketing",
  "/dashboard/Analytics": "analytics",
  "/dashboard/Blogs": "blogs",
  "/dashboard/Subcribers": "subscribers",
  "/dashboard/Specialities": "specialities",
  "/dashboard/Pages": "pages",
  "/dashboard/Settings": "settings",
  "/dashboard/Clinical_Notes": "patients",
};

export function getModuleForPath(pathname: string): string | null {
  if (DASHBOARD_ROUTE_MODULES[pathname]) {
    return DASHBOARD_ROUTE_MODULES[pathname];
  }

  const match = Object.entries(DASHBOARD_ROUTE_MODULES).find(([route]) =>
    route !== "/dashboard" && pathname.startsWith(`${route}/`)
  );

  return match ? match[1] : null;
}

/** Content editors can access Pages CMS even before RBAC is updated for `pages`. */
function hasContentCmsAccess(
  permissions: PermissionsMap | undefined,
  action: "view" | "edit"
): boolean {
  if (permissions?.pages?.[action]) return true;
  const related = ["specialities", "staffs", "blogs"] as const;
  return related.some((key) => {
    const perm = permissions?.[key];
    if (!perm?.view) return false;
    return action === "view" ? true : Boolean(perm.edit);
  });
}

export function canView(
  permissions: PermissionsMap | undefined,
  moduleKey: string,
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  if (moduleKey === "pages") {
    return hasContentCmsAccess(permissions, "view");
  }
  return Boolean(permissions?.[moduleKey]?.view);
}

export function canEdit(
  permissions: PermissionsMap | undefined,
  moduleKey: string,
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  if (moduleKey === "pages") {
    return hasContentCmsAccess(permissions, "edit");
  }
  const perm = permissions?.[moduleKey];
  return Boolean(perm?.view && perm?.edit);
}

export function firstAllowedDashboardPath(
  permissions: PermissionsMap | undefined,
  isSuperAdmin = false
): string {
  if (isSuperAdmin) return "/dashboard";

  const order = [
    "/dashboard",
    "/dashboard/Appointments",
    "/dashboard/Patients",
    "/dashboard/Staffs",
    "/dashboard/Admin_Management",
    "/dashboard/Booking_Slots",
    "/dashboard/Marketing",
    "/dashboard/Analytics",
    "/dashboard/Blogs",
    "/dashboard/Subcribers",
    "/dashboard/Specialities",
    "/dashboard/Pages",
    "/dashboard/Settings",
  ];

  for (const path of order) {
    const moduleKey = DASHBOARD_ROUTE_MODULES[path];
    if (moduleKey && canView(permissions, moduleKey, isSuperAdmin)) {
      return path;
    }
  }

  return "/unauthorized";
}
