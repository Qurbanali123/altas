"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { LogOutIcon } from "lucide-react";
import { logout } from "@/utils/auth";
import { usePermissions } from "@/context/PermissionsContext";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Megaphone,
  BarChart2,
  UserCheck,
  Settings,
  Shield,
  X,
  CalendarClock,
  FileText,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, module: "dashboard" },
  { label: "Appointments", href: "/dashboard/Appointments", icon: CalendarDays, module: "appointments" },
  { label: "Patients", href: "/dashboard/Patients", icon: Users, module: "patients" },
  { label: "Admin Management", href: "/dashboard/Admin_Management", icon: Shield, module: "admin_management" },
  { label: "Booking Slot", href: "/dashboard/Booking_Slots", icon: CalendarClock, module: "booking_slots" },
  { label: "Marketing", href: "/dashboard/Marketing", icon: Megaphone, module: "marketing" },
  { label: "Analytics", href: "/dashboard/Analytics", icon: BarChart2, module: "analytics" },
  { label: "Subscribers", href: "/dashboard/Subcribers", icon: UserCheck, module: "subscribers" },
];

const accueilSectionItems = [
  { label: "Header section", href: "/dashboard/Pages/accueil/header" },
  { label: "Hero section", href: "/dashboard/Pages/accueil/hero" },
  { label: "Stats section", href: "/dashboard/Pages/accueil/stats" },
  { label: "About section", href: "/dashboard/Pages/accueil/about" },
  { label: "Reviews section", href: "/dashboard/Pages/accueil/reviews" },
  { label: "Blog section", href: "/dashboard/Pages/accueil/blogs" },
  { label: "FAQ section", href: "/dashboard/Pages/accueil/faq" },
  { label: "Video section", href: "/dashboard/Pages/accueil/video" },
  { label: "Footer section", href: "/dashboard/Pages/accueil/footer" },
];

const pageMenuItems = [
  { label: "Notre centre", href: "/dashboard/Pages/notre-centre", enabled: true, module: "pages" },
  { label: "Nos spécialités", href: "/dashboard/Specialities", enabled: true, module: "specialities" },
  { label: "Notre équipe", href: "/dashboard/Staffs", enabled: true, module: "staffs" },
  { label: "Avant/Après", href: "/dashboard/Pages/avant-apres", enabled: true, module: "pages" },
  { label: "Contact", href: "/dashboard/Pages/contact", enabled: true, module: "pages" },
  { label: "Rendez-vous", href: "/dashboard/Pages/appointment", enabled: true, module: "pages" },
  { label: "CTA section", href: "/dashboard/Pages/cta", enabled: true, module: "pages" },
  { label: "Blogs", href: "/dashboard/Blogs", enabled: true, module: "blogs" },
  { label: "Privacy Policy", href: "/dashboard/Pages/privacy", enabled: true, module: "pages" },
  { label: "Terms", href: "/dashboard/Pages/terms", enabled: true, module: "pages" },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

function scrollSidebarBlockIntoView(selector: string) {
  requestAnimationFrame(() => {
    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Skip hidden instances (e.g. closed mobile drawer)
      if (rect.width === 0 && rect.height === 0) return;
      el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    });
  });
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { canViewModule } = usePermissions();
  const visibleNavItems = navItems.filter((item) => canViewModule(item.module));
  const pagesVisible =
    canViewModule("pages") ||
    canViewModule("specialities") ||
    canViewModule("staffs") ||
    canViewModule("blogs");
  const pageHrefs = pageMenuItems.filter((i) => i.enabled).map((i) => i.href);
  const accueilActive = pathname.startsWith("/dashboard/Pages/accueil");
  const pagesActive =
    pathname.startsWith("/dashboard/Pages") ||
    pageHrefs.some(
      (href) => pathname === href || pathname.startsWith(`${href}/`)
    );
  // Closed until the user clicks — then open + scroll into view
  const [pagesOpen, setPagesOpen] = useState(false);
  const [accueilOpen, setAccueilOpen] = useState(false);
  const pagesUserToggled = useRef(false);
  const accueilUserToggled = useRef(false);

  useEffect(() => {
    if (!pagesOpen || !pagesUserToggled.current) return;
    pagesUserToggled.current = false;
    scrollSidebarBlockIntoView("[data-sidebar-pages]");
  }, [pagesOpen]);

  useEffect(() => {
    if (!accueilOpen || !accueilUserToggled.current) return;
    accueilUserToggled.current = false;
    scrollSidebarBlockIntoView("[data-sidebar-accueil]");
  }, [accueilOpen]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const sidebarBg = isDark ? "bg-[#FFFFFF] text-[#711C31]" : "bg-[#711C31] text-[#FFFFFF]";
  const dividerColor = isDark ? "bg-[#5C1A30]" : "bg-[#D4B896]";

  const logoEl = (
    <div className="flex flex-col ml-2 gap-2 pt-2 pb-6 shrink-0">
      <div className="overflow-hidden rounded-full">
        <Image
          src="/images/logo1.png"
          alt="Atlas Dental Center"
          width={180}
          height={180}
          className={`object-contain transition-all duration-300 hover:scale-110 ${
            isDark ? "brightness-0 sepia hue-rotate-[320deg] saturate-100" : ""
          }`}
        />
      </div>
    </div>
  );

  const settingsVisible = canViewModule("settings");

  const linkClass = (isActive: boolean) => `
    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
    transition-all duration-200 group
    ${
      isActive
        ? isDark
          ? "bg-[#D3D3D3D3] text-[#3d1023]"
          : "bg-[#3D0A1F] text-[#F5ECD7]"
        : isDark
          ? "text-[#711C31] hover:bg-[#D3D3D3D3]"
          : "text-[#F5ECD7] hover:bg-[#3D1023]"
    }
  `;

  const navLinks = (
    <>
      {visibleNavItems.map(({ label, href, icon: Icon }) => {
        const isActive =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href + "/"));

        return (
          <Link key={href} href={href} onClick={onClose} className={linkClass(isActive)}>
            <Icon
              size={17}
              className={`shrink-0 transition-colors duration-200 ${
                isActive
                  ? isDark
                    ? "text-[#591727]"
                    : "text-[#F2E5C5]"
                  : isDark
                    ? "text-[#591727]"
                    : "text-[#F2E5C5]"
              }`}
            />
            <span>{label}</span>
          </Link>
        );
      })}

      {pagesVisible && (
        <div
          className="flex flex-col gap-0.5"
          data-sidebar-pages
          style={{ overflowAnchor: "none" }}
        >
          <button
            type="button"
            onClick={() => {
              pagesUserToggled.current = true;
              setPagesOpen((v) => !v);
            }}
            className={`${linkClass(pagesActive)} w-full text-left`}
          >
            <FileText
              size={17}
              className={`shrink-0 ${isDark ? "text-[#591727]" : "text-[#F2E5C5]"}`}
            />
            <span className="flex-1">Pages</span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform ${pagesOpen ? "rotate-180" : ""}`}
            />
          </button>
          {pagesOpen && (
            <div className="ml-3 pl-2 border-l border-white/20 flex flex-col gap-0.5 pb-1">
              {canViewModule("pages") && (
                <div
                  className="flex flex-col gap-0.5"
                  data-sidebar-accueil
                  style={{ overflowAnchor: "none" }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      accueilUserToggled.current = true;
                      setAccueilOpen((v) => !v);
                    }}
                    className={`${linkClass(accueilActive)} w-full text-left`}
                  >
                    <span className="flex-1 text-xs sm:text-sm">Accueil</span>
                    <ChevronDown
                      size={14}
                      className={`shrink-0 transition-transform ${
                        accueilOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {accueilOpen && (
                    <div className="ml-3 pl-2 border-l border-white/15 flex flex-col gap-0.5">
                      {accueilSectionItems.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={linkClass(isActive)}
                          >
                            <span className="text-xs sm:text-sm">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {pageMenuItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                if (!item.enabled) {
                  return (
                    <span
                      key={item.href}
                      className={`px-3 py-2 rounded-lg text-xs ${
                        isDark ? "text-[#711C31]/60" : "text-[#F5ECD7]/55"
                      }`}
                      title="Coming soon"
                    >
                      {item.label}
                      <span className="ml-1 opacity-70">(soon)</span>
                    </span>
                  );
                }
                if (!canViewModule(item.module)) return null;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={linkClass(isActive)}
                  >
                    <span className="text-xs sm:text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );

  const settingsLink = settingsVisible ? (
    <Link
      href="/dashboard/Settings"
      onClick={onClose}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200
        ${
          pathname === "/admin/settings"
            ? isDark
              ? "bg-[#D4A574] text-[#3D0A1F]"
              : "bg-[#3D0A1F] text-[#F5ECD7]"
            : isDark
              ? "text-[#711C31] hover:bg-[#5C1A30] hover:text-white"
              : "text-[#F5ECD7] hover:bg-[#3D1023] hover:text-white"
        }
      `}
    >
      <Settings size={17} className="shrink-0" />
      <span style={{ fontFamily: "var(--font-body, 'Lato', sans-serif)" }}>Settings</span>
    </Link>
  ) : null;

  const logoutButton = (
    <button
      onClick={handleLogout}
      className={`
      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
      transition-all duration-200
      ${
        isDark
          ? "text-[#711C31] hover:bg-[#D3D3D3D3]"
          : "text-[#F5ECD7] hover:bg-[#3D1023]"
      }
    `}
    >
      <LogOutIcon size={17} className="shrink-0" />
      <span>Logout</span>
    </button>
  );

  const navClassName =
    "flex-1 min-h-0 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] [overflow-anchor:none]";

  return (
    <>
      <div className="hidden lg:block fixed m-2 mt-3 left-0 top-0 z-40 h-[calc(100vh-20px)] w-[260px]">
        <aside
          className={`flex flex-col h-full w-[260px] rounded-2xl transition-colors duration-300 ${sidebarBg}`}
        >
          {logoEl}
          <nav className={navClassName}>{navLinks}</nav>
          <div className={`mx-4 my-3 h-px shrink-0 ${dividerColor}`} />
          <div className="px-3 pb-2 shrink-0">{settingsLink}</div>
          <div className="px-3 pb-6 shrink-0">{logoutButton}</div>
        </aside>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden" onClick={onClose}>
          <div className="absolute inset-0 bg-black/40" />
          <aside
            className={`absolute top-0 left-0 h-full w-[260px] flex flex-col transition-colors duration-300 ${sidebarBg}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end px-3 pt-3 shrink-0">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark ? "text-[#711C31] hover:bg-[#D3D3D3D3]" : "text-white hover:bg-[#3D1023]"
                }`}
              >
                <X size={20} />
              </button>
            </div>
            {logoEl}
            <nav className={navClassName}>{navLinks}</nav>
            <div className={`mx-4 my-3 h-px shrink-0 ${dividerColor}`} />
            <div className="px-3 pb-2 shrink-0">{settingsLink}</div>
            <div className="px-3 pb-6 shrink-0">{logoutButton}</div>
          </aside>
        </div>
      )}
    </>
  );
}
