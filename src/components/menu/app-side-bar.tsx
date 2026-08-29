import { useState } from "react";
import {
  IconBuilding,
  IconChevronDown,
  IconChevronRight,
  IconDashboard,
  IconFileAnalytics,
  IconFileDescription,
  IconFileText,
  IconList,
  IconLock,
  IconReportAnalytics,
  IconSettings,
  IconTools,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";

import {
  Badge,
  ScrollArea,
  Text,
  UnstyledButton,
} from "@mantine/core";

import {
  useLocation,
  useNavigate,
} from "react-router";

import { UserButton } from "./user-button";

/* =========================
   TYPES
========================= */

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  badge?: number;
}

/* =========================
   MAIN
========================= */

const mainMenus: MenuItem[] = [
  {
    label: "Dashboard",
    icon: IconDashboard,
    path: "/dashboard",
  },
  {
    label: "Détenus",
    icon: IconUser,
    path: "/inmates",
  },
  {
    label: "Visiteurs",
    icon: IconFileText,
    path: "/visits",
  },
];

/* =========================
   MASTER LIST
========================= */

const masterMenus: MenuItem[] = [
  {
    label: "Prisons",
    icon: IconBuilding,
    path: "/prisons",
  },
  {
    label: "Blocs de cellules",
    icon: IconLock,
    path: "/cells",
  },
  {
    label: "Infractions",
    icon: IconList,
    path: "/crimes",
  },
  // {
  //   label: "Action List",
  //   icon: IconActivity,
  //   path: "/actions",
  // },
];

/* =========================
   REPORTS
========================= */

const reportMenus: MenuItem[] = [
  {
    label: "Dossiers mensuels",
    icon: IconFileDescription,
    path: "/reports/record-history",
  },
  {
    label: "Visiteurs mensuels",
    icon: IconReportAnalytics,
    path: "/reports/visitor-report",
  },
];

/* =========================
   MAINTENANCE
========================= */

const maintenanceMenus: MenuItem[] = [
  {
    label: "Utilisateurs",
    icon: IconUsers,
    path: "/users",
  },
  {
    label: "Informations système",
    icon: IconTools,
    path: "/system-info",
  },
];

/* =========================
   MENU LINK
========================= */

interface MenuLinkProps {
  item: MenuItem;
  activePath: string;
  onNavigate: (path: string) => void;
  nested?: boolean;
}

function MenuLink({
  item,
  activePath,
  onNavigate,
  nested = false,
}: MenuLinkProps) {
  const Icon = item.icon;

  const active =
    item.path === activePath ||
    (item.path !== "/" &&
      activePath.startsWith(`${item.path}/`));

  return (
    <UnstyledButton 
      onClick={() => {
        if (item.path) {
          onNavigate(item.path);
        }
      }}
      className={`
        group flex min-h-9 w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${nested ? "pl-11" : ""}
        ${
          active
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
        }
      `}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <Icon
          size={19}
          stroke={1.7}
          className={`
            shrink-0
            ${
              active
                ? "text-white"
                : "text-slate-500 group-hover:text-slate-300"
            }
          `}
        />

        <span className="truncate">
          {item.label}
        </span>
      </div>

      {item.badge !== undefined && (
        <Badge
          size="sm"
          variant="filled"
          className="ml-auto"
        >
          {item.badge}
        </Badge>
      )}
    </UnstyledButton>
  );
}

/* =========================
   SECTION TITLE
========================= */

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Text
      size="xs"
      fw={600}
      className="
        mb-3
        px-3
        uppercase
        tracking-widest
        text-slate-500
      "
    >
      {children}
    </Text>
  );
}

/* =========================
   SIDEBAR
========================= */

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [reportsOpen, setReportsOpen] = useState(true);

  const activePath = location.pathname;

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  /*
   * Vérifie si une page du groupe Reports
   * est actuellement active.
   */
  const isReportActive = reportMenus.some(
    (item) =>
      item.path === activePath ||
      (item.path &&
        activePath.startsWith(`${item.path}/`))
  );

  
  return (
    <aside
      className="
        flex
        h-screen
        w-72
        shrink-0
        flex-col
        border-r
        border-slate-800
        bg-slate-950
        text-white
      "
    >

      {/* =========================
          BRAND
      ========================== */}

      <div
        className="
          flex
          h-16
          shrink-0
          items-center
          border-b
          border-slate-800
          px-4
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-blue-600
          "
        >
          <IconBuilding
            size={21}
            stroke={1.7}
          />
        </div>

        <div className="ml-3 min-w-0">
          <Text
            fw={600}
            className="truncate text-white"
          >
            Gestion pénitentiaire
          </Text>

          <Text
            size="xs"
            className="text-slate-500"
          >
            Administration
          </Text>
        </div>
      </div>

      {/* =========================
          USER
      ========================== */}

      <div
        className="
          shrink-0
          border-b
          border-slate-800
          p-3
        "
      >
        <UserButton />
      </div>

      {/* =========================
          MENU
      ========================== */}

      <ScrollArea
        className="flex-1"
        type="auto"
        scrollbarSize={6}
      >
        <nav className="p-3">

          {/* =====================
              MAIN
          ====================== */}

          <div className="mb-8">
            <SectionTitle>
              Main
            </SectionTitle>

            <div className="flex flex-col gap-1.5">
              {mainMenus.map((item) => (
                <MenuLink
                  key={item.label}
                  item={item}
                  activePath={activePath}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>

          {/* =====================
              MASTER LIST
          ====================== */}

          <div className="mb-8">
            <SectionTitle>
              Master List
            </SectionTitle>

            <div className="flex flex-col gap-1.5">
              {masterMenus.map((item) => (
                <MenuLink
                  key={item.label}
                  item={item}
                  activePath={activePath}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>

          {/* =====================
              REPORTS
          ====================== */}

          <div className="mb-8">

            <SectionTitle>
              Reports
            </SectionTitle>

            {/* Reports parent */}
            <UnstyledButton
              onClick={() =>
                setReportsOpen(
                  (value) => !value
                )
              }
              className={`
                group
                flex
                min-h-11
                w-full
                items-center
                justify-between
                rounded-lg
                px-3
                py-2.5
                text-sm
                transition-all
                duration-150

                ${
                  isReportActive
                    ? "text-white"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }
              `}
            >
              <div className="flex items-center gap-3.5">

                <IconFileAnalytics
                  size={19}
                  stroke={1.7}
                  className="
                    text-slate-500
                    group-hover:text-slate-300
                  "
                />

                <span>
                  Reports
                </span>

              </div>

              {reportsOpen ? (
                <IconChevronDown
                  size={17}
                  className="text-slate-500"
                />
              ) : (
                <IconChevronRight
                  size={17}
                  className="text-slate-500"
                />
              )}
            </UnstyledButton>

            {/* Reports children */}
            {reportsOpen && (
              <div className="mt-1.5 flex flex-col gap-1.5">
                {reportMenus.map((item) => (
                  <MenuLink
                    key={item.label}
                    item={item}
                    activePath={activePath}
                    onNavigate={handleNavigate}
                    nested
                  />
                ))}
              </div>
            )}

          </div>

          {/* =====================
              MAINTENANCE
          ====================== */}

          <div>
            <SectionTitle>
              Configuration
            </SectionTitle>

            <div className="flex flex-col gap-1.5">
              {maintenanceMenus.map((item) => (
                <MenuLink
                  key={item.label}
                  item={item}
                  activePath={activePath}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          </div>

        </nav>
      </ScrollArea>

      {/* =========================
          FOOTER
      ========================== */}

      <div
        className="
          shrink-0
          border-t
          border-slate-800
          p-3
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            rounded-lg
            px-3
            py-2.5
            text-slate-500
          "
        >
          <IconSettings size={17} />

          <span className="text-xs">
            Prison Management v1.0.0
          </span>
        </div>
      </div>

    </aside>
  );
}