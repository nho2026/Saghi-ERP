import { buildingNavigation } from "@/features/building-expenses/building-navigation";
import {
  primaryNavigation,
  taskNavigation,
  attendanceNavigation,
  hrNavigation,
  laboratoryNavigation,
  icuNavigation,
  healthcareNavigation,
  crmNavigation,
  accountingNavigation,
  warehouseDashboardNavigation,
  buyNavigation,
  productNavigation,
  storageNavigation,
  warehouseExtraNavigation,
  warehouseDirectoryNavigation,
  warehouseGroups,
  inventoryNavigation,
  posNavigation,
  accessNavigation,
} from "@/app/navigations";
import { permissionForPath } from "@/features/auth/permission-policy";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/shared/components/ui/alert-dialog";
import { toast } from "sonner";
import { MeetingSessionHost } from "@/features/meetings/pages/MeetingSessionHost";
import { HeaderSearch } from "./HeaderSearch";
import { WorkspaceCard } from "./WorkspaceCard";
import { Input } from "@/shared/components/ui/input";
import {
  loadSettings,
  useSettings,
  settingsSnapshot,
} from "@/features/settings/settings";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  ChevronDown,
  CircleHelp,
  Clock3,
  ContactRound,
  Globe2,
  HeartPulse,
  FlaskConical,
  LayoutDashboard,
  Landmark,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserRound,
  UsersRound,
  X,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Barcode,
  Warehouse,
  Boxes,
  ShoppingCart,
  ListTodo,
  Lightbulb,
  Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/icons/logo.png";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/shared/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { getCurrentUser, logoutUser } from "@/features/auth/api/auth.api";
import { clearAuth, setAuthenticatedUser } from "@/features/auth/store/auth.slice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { useTheme } from "@/shared/hooks/useTheme";
import { WindowControls } from "@/shared/components/WindowControls";
import { hasPermission } from "@/features/auth/access";
import {
  notificationsApi,
  type NotificationItem,
} from "@/features/notifications/api/notifications.api";

function notificationRoute(notification: NotificationItem) {
  if (notification.route?.startsWith("/")) return notification.route;
  if (notification.task) return `/tasks/${notification.task.id}`;
  if (notification.meeting) return "/meetings";
  if (notification.warning) return "/hr/warnings";
  return undefined;
}

function notificationLabel(
  type: NotificationItem["type"],
  t: (key: string) => string,
) {
  if (type === "warning") return t("employeePortal.warnings");
  if (type === "meeting_created") return t("notificationCenter.meetingCreated");
  if (type === "task_review_requested")
    return t("notificationCenter.taskReviewRequested");
  if (type === "task_status_updated")
    return t("notificationCenter.taskStatusUpdated");
  return t("notificationCenter.taskAssigned");
}

function LiveDateTime({
  locale,
  banner = false,
}: {
  locale: string;
  banner?: boolean;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  if (banner)
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-white">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-200/10 text-teal-100">
          <Clock3 className="size-6 stroke-[1.5]" />
        </span>
        <div className="min-w-0 space-y-1">
          <time
            dateTime={now.toISOString()}
            className="block text-2xl font-semibold leading-tight tabular-nums"
          >
            {new Intl.DateTimeFormat(locale, {
              hour: "2-digit",
              minute: "2-digit",
            }).format(now)}
          </time>
          <span className="block text-xs leading-relaxed text-teal-100/80">
            {new Intl.DateTimeFormat(locale, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            }).format(now)}
          </span>
        </div>
      </div>
    );
  return (
    <div className="hidden h-10 items-center overflow-hidden rounded-xl border border-primary/15 bg-linear-to-r from-primary/8 via-card to-card shadow-sm lg:flex">
      <time
        className="flex h-full items-center gap-2 border-e border-primary/12 px-3"
        dateTime={now.toISOString()}
      >
        <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Clock3 className="size-3.5" />
        </span>
        <span className="text-sm font-bold tabular-nums tracking-tight text-foreground">
          {new Intl.DateTimeFormat(locale, {
            hour: "2-digit",
            minute: "2-digit",
          }).format(now)}
        </span>
      </time>
      <time
        className="flex h-full items-center gap-2 px-3 text-muted-foreground"
        dateTime={now.toISOString().slice(0, 10)}
      >
        <CalendarCheck className="size-3.5 text-primary" />
        <span className="text-[11px] font-medium whitespace-nowrap">
          {new Intl.DateTimeFormat(locale, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(now)}
        </span>
      </time>
    </div>
  );
}

export default function DashboardLayout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("nho-sidebar-collapsed") === "true",
  );
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const knownNotificationIds = useRef<Set<string> | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [navigationSearch, setNavigationSearch] = useState("");
  const [panelMode, setPanelMode] = useState(
    () => localStorage.getItem("nho-navigation-mode") === "panel",
  );
  const [showPanel, setShowPanel] = useState(
    () => localStorage.getItem("nho-navigation-mode") === "panel",
  );
  const [panelSearch, setPanelSearch] = useState("");
  const [panelGroup, setPanelGroup] = useState<string | null>(null);
  const [pageTabs, setPageTabs] = useState<{ to: string; title: string }[]>([]);

  const navigationSearchRef = useRef<HTMLInputElement>(null);
  const [hrExpanded, setHrExpanded] = useState(true);
  const [attendanceExpanded, setAttendanceExpanded] = useState(true);
  const [laboratoryExpanded, setLaboratoryExpanded] = useState(true);
  const [icuExpanded, setIcuExpanded] = useState(true);

  useEffect(() => {
    const preventControlDrag = (event: DragEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("a, button")
      ) {
        event.preventDefault();
      }
    };
    document.addEventListener("dragstart", preventControlDrag, true);
    return () =>
      document.removeEventListener("dragstart", preventControlDrag, true);
  }, []);
  const [healthcareExpanded, setHealthcareExpanded] = useState(true);
  const [crmExpanded, setCrmExpanded] = useState(true);
  const [accountingExpanded, setAccountingExpanded] = useState(true);
  const [buildingExpanded, setBuildingExpanded] = useState(true);
  const [warehouseGroupsExpanded, setWarehouseGroupsExpanded] = useState({
    cases: true,
    utilities: true,
    reports: true,
  });
  const [storageExpanded, setStorageExpanded] = useState(true);
  const [productExpanded, setProductExpanded] = useState(true);
  const [buyExpanded, setBuyExpanded] = useState(true);
  const [inventoryExpanded, setInventoryExpanded] = useState(true);
  const [posExpanded, setPosExpanded] = useState(true);
  const [tasksExpanded, setTasksExpanded] = useState(true);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const systemSettings = useSettings();
  useEffect(() => {
    void loadSettings().catch(() => {});
  }, []);
  const location = useLocation();

  useEffect(() => {
    void getCurrentUser()
      .then((current) => {
        dispatch(setAuthenticatedUser(current));
        sessionStorage.setItem("nho-current-user", JSON.stringify(current));
      })
      .catch(() => {
        if (!sessionStorage.getItem("nho-current-user"))
          navigate("/login", { replace: true });
      });
  }, [dispatch, navigate]);
  useEffect(() => {
    return window.electronWindow?.onNotificationClick((route) =>
      navigate(route),
    );
  }, [navigate]);
  useEffect(() => {
    let active = true;
    const loadNotifications = () =>
      notificationsApi
        .list()
        .then((result) => {
          if (!active) return;
          const previousIds = knownNotificationIds.current;
          if (previousIds) {
            result.items
              .filter(
                (notification) =>
                  !notification.readAt && !previousIds.has(notification.id),
              )
              .forEach((notification) => {
                toast.info(
                  notification.title ??
                    notification.warning?.title ??
                    notification.meeting?.title ??
                    notification.task?.title ??
                    notificationLabel(notification.type, t),
                  {
                    id: `notification-${notification.id}`,
                    description:
                      notification.body ?? notification.warning?.message,
                    action: {
                      label: t("notificationCenter.openNotification"),
                      onClick: () => {
                        const route = notificationRoute(notification);
                        if (route) navigate(route);
                      },
                    },
                  },
                );
                if (settingsSnapshot()?.notifications.desktopAlerts !== false)
                  window.electronWindow?.showNotification({
                    title:
                      notification.title ??
                      notification.warning?.title ??
                      notification.meeting?.title ??
                      notification.task?.title ??
                      (settingsSnapshot()?.organization.name || ""),
                    body:
                      notification.body ??
                      (notification.warning
                        ? notification.warning.message
                        : notificationLabel(notification.type, t)),
                    route: notificationRoute(notification),
                  });
              });
          }
          knownNotificationIds.current = new Set(
            result.items.map((notification) => notification.id),
          );
          setNotifications(result.items);
          setUnreadCount(result.unreadCount);
        })
        .catch(() => undefined);
    void loadNotifications();
    const timer = window.setInterval(loadNotifications, 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [t, navigate]);
  const openNotification = async (notification: NotificationItem) => {
    if (!notification.readAt) {
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id
            ? { ...item, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      await notificationsApi.markRead(notification.id).catch(() => undefined);
    }
    const route = notificationRoute(notification);
    if (route) navigate(route);
  };
  const markAllNotificationsRead = async () => {
    const readAt = new Date().toISOString();
    setNotifications((items) => items.map((item) => ({ ...item, readAt })));
    setUnreadCount(0);
    await notificationsApi.markAllRead().catch(() => undefined);
  };
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const logoutLock = useRef(false);
  const logout = async () => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    setLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      dispatch(clearAuth());
      sessionStorage.removeItem("nho-current-user");
      navigate("/login", { replace: true });
      setLoggingOut(false);
      setLogoutConfirmOpen(false);
      logoutLock.current = false;
    }
  };
  const toggle = () =>
    setCollapsed((value) => {
      localStorage.setItem("nho-sidebar-collapsed", String(!value));
      return !value;
    });
  const initials =
    user?.name
      ?.split(" ")
      .map((v) => v[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "QA";
  const pageTitle = (() => {
    const allItems = [
      ...primaryNavigation,
      ...buildingNavigation,
      ...taskNavigation,
      ...attendanceNavigation,
      ...hrNavigation,
      ...healthcareNavigation,
      ...laboratoryNavigation,
      ...crmNavigation,
      ...accountingNavigation,
      ...inventoryNavigation,
      ...warehouseDashboardNavigation,
      ...buyNavigation,
      ...productNavigation,
      ...storageNavigation,
      ...warehouseDirectoryNavigation,
      ...warehouseExtraNavigation,
      ...posNavigation,
      ...accessNavigation,
    ];
    const item = allItems.find(({ to }) => location.pathname === to);
    if (location.pathname === "/employee-portal")
      return t("employeePortal.title");
    if (/^\/crm\/patients\/[^/]+$/.test(location.pathname))
      return t("todayPatients.fullProfile");
    if (location.pathname === "/profile") return t("navigation.profile");
    if (location.pathname === "/settings") return t("navigation.settings");
    return item ? t(item.label) : systemSettings?.organization.name || "";
  })();
  const normalizedNavigationSearch = navigationSearch
    .trim()
    .toLocaleLowerCase(i18n.resolvedLanguage);
  const navItems = (items: typeof primaryNavigation) =>
    items
      .filter(
        ({ to, label }) =>
          hasPermission(user, permissionForPath(to)) &&
          (!normalizedNavigationSearch ||
            t(label)
              .toLocaleLowerCase(i18n.resolvedLanguage)
              .includes(normalizedNavigationSearch)),
      )
      .map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          title={collapsed ? t(label) : undefined}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            `group relative flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/25 ${collapsed ? "lg:justify-center lg:px-0" : ""} ${isActive ? "bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary)] rtl:shadow-[inset_-3px_0_0_var(--primary)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
          }
        >
          <Icon
            className={`size-4.5 shrink-0 stroke-[1.8] transition-transform group-hover:scale-105`}
          />
          <span className={collapsed ? "lg:hidden" : ""}>{t(label)}</span>
        </NavLink>
      ));
  const sectionButtonClass = (items: typeof primaryNavigation) =>
    `group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/25 ${items.some((item) => location.pathname === item.to) ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`;

  const panelGroups = [
    { key: "building", icon: Building2, items: buildingNavigation },
    {
      key: "warehouse",
      icon: Package,
      items: [
        ...warehouseDashboardNavigation,
        ...buyNavigation,
        ...productNavigation,
        ...storageNavigation,
        ...warehouseDirectoryNavigation,
        ...warehouseExtraNavigation,
        ...inventoryNavigation,
      ],
    },
    { key: "laboratory", icon: FlaskConical, items: laboratoryNavigation },
    { key: "icu", icon: HeartPulse, items: icuNavigation },
    { key: "healthcare", icon: HeartPulse, items: healthcareNavigation },
    { key: "hr", icon: UsersRound, items: hrNavigation },
    { key: "attendance", icon: CalendarCheck, items: attendanceNavigation },
    { key: "accounting", icon: Landmark, items: accountingNavigation },
    { key: "crm", icon: ContactRound, items: crmNavigation },
    { key: "tasks", icon: ListTodo, items: taskNavigation },
    { key: "pos", icon: Barcode, items: posNavigation },
    { key: "access", icon: ShieldCheck, items: accessNavigation },
    {
      key: "settings",
      icon: Settings,
      items: [
        { to: "/settings", label: "navigation.settings", icon: Settings },
      ],
    },
    { key: "general", icon: LayoutDashboard, items: primaryNavigation },
    {
      key: "portal",
      icon: Lightbulb,
      items: [
        {
          to: "/employee-portal",
          label: "employeePortal.title",
          icon: Lightbulb,
        },
        { to: "/profile", label: "navigation.profile", icon: UserRound },
      ],
    },
  ]
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item, index, items) =>
          items.findIndex((candidate) => candidate.to === item.to) === index &&
          hasPermission(user, permissionForPath(item.to)),
      ),
    }))
    .filter((group) => group.items.length);
  const pendingTabPath = useRef<string | null>(null);
  const openPanelPage = (to: string) => {
    pendingTabPath.current = to.split("?")[0];
    navigate(to);
    setShowPanel(false);
  };
  const activeTabPath = location.pathname;
  useEffect(() => {
    if (!panelMode || showPanel) return;
    if (pendingTabPath.current && pendingTabPath.current !== activeTabPath)
      return;
    pendingTabPath.current = null;
    setPageTabs((tabs) => {
      // Patient details share one workspace tab, even when the patient changes.
      const isPatientProfile = (path: string) =>
        /^\/crm\/patients\/[^/]+\/?$/.test(path);
      if (isPatientProfile(activeTabPath)) {
        const firstProfileIndex = tabs.findIndex((tab) =>
          isPatientProfile(tab.to),
        );
        const current = tabs[firstProfileIndex];
        const profileCount = tabs.filter((tab) =>
          isPatientProfile(tab.to),
        ).length;
        if (
          profileCount === 1 &&
          current?.to === activeTabPath &&
          current.title === pageTitle
        )
          return tabs;
        const remaining = tabs.filter((tab) => !isPatientProfile(tab.to));
        remaining.splice(
          firstProfileIndex < 0 ? remaining.length : firstProfileIndex,
          0,
          { to: activeTabPath, title: pageTitle },
        );
        return remaining;
      }
      const existing = tabs.find((tab) => tab.to === activeTabPath);
      if (existing?.title === pageTitle) return tabs;
      return existing
        ? tabs.map((tab) =>
            tab.to === activeTabPath ? { ...tab, title: pageTitle } : tab,
          )
        : [...tabs, { to: activeTabPath, title: pageTitle }];
    });
  }, [panelMode, showPanel, activeTabPath, pageTitle]);
  const closePageTab = (to: string) => {
    const index = pageTabs.findIndex((tab) => tab.to === to);
    const remaining = pageTabs.filter((tab) => tab.to !== to);
    setPageTabs(remaining);
    if (!showPanel && to === activeTabPath) {
      const next = remaining[Math.min(index, remaining.length - 1)];
      if (next) openPanelPage(next.to);
      else {
        setShowPanel(true);
        setPanelGroup(null);
        setPanelSearch("");
      }
    }
  };
  const panelTerm = panelSearch.trim().toLocaleLowerCase();
  const visibleGroups = panelGroups.filter(
    (group) =>
      t(`controlPanel.${group.key}`, {
        defaultValue:
          group.key === "building" ? t("buildingExpenses.title") : group.key,
      })
        .toLocaleLowerCase()
        .includes(panelTerm) ||
      group.items.some((item) =>
        t(item.label).toLocaleLowerCase().includes(panelTerm),
      ),
  );
  useEffect(() => {
    const update = () => {
      setPanelMode(localStorage.getItem("nho-navigation-mode") === "panel");
      setShowPanel(false);
      setOpen(false);
      setPanelGroup(null);
      setPanelSearch("");
    };
    window.addEventListener("nho-navigation-mode-changed", update);
    return () =>
      window.removeEventListener("nho-navigation-mode-changed", update);
  }, []);
  if (
    location.pathname === "/crm/today-patients" &&
    new URLSearchParams(location.search).get("tv") === "1"
  ) {
    return (
      <main className="min-h-svh w-full bg-muted/45 p-4 sm:p-6">
        <Outlet key={location.pathname + location.search} />
      </main>
    );
  }
  return (
    <div className="h-svh w-full overflow-hidden bg-muted/45">
      {!panelMode && (
        <aside
          className={`fixed inset-y-0 inset-s-0 z-50 flex w-71.5 flex-col border-e border-primary/10 bg-card px-3.75 shadow-[8px_0_30px_-25px_rgba(15,23,42,.45)] transition-[width,transform] duration-300 lg:translate-x-0! ${collapsed ? "lg:w-20 lg:px-3" : ""} ${open ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"}`}
        >
          <div
            className={`flex h-21.75 items-center gap-3 border-b border-primary/15 px-1 ${collapsed ? "lg:justify-center" : ""}`}
          >
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-primary/25 bg-card">
              <img
                className="block size-full object-contain"
                src={systemSettings?.organization.logo || logo}
                alt={systemSettings?.organization.name || ""}
              />
            </span>
            <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
              <strong className="block truncate text-[12px] font-bold leading-4 tracking-wide">
                {systemSettings?.organization.name || ""}
              </strong>
              <span className="mt-0.5 block truncate text-[9px] font-medium text-muted-foreground">
                Management system
              </span>
            </div>
            <Button
              className="ms-auto lg:hidden"
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <div className="py-3">
            <label className={`relative block ${collapsed ? "lg:hidden" : ""}`}>
              <Search className="absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={navigationSearchRef}
                className="h-10 w-full rounded-xl border border-primary/20 bg-primary/2.5 ps-9 pe-10 text-xs font-medium outline-none transition placeholder:text-muted-foreground/75 focus:border-primary/45 focus:bg-card focus:ring-3 focus:ring-primary/8 dark:bg-slate-950"
                placeholder={t("navigation.search")}
                value={navigationSearch}
                onChange={(event) => setNavigationSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setNavigationSearch("");
                    event.currentTarget.blur();
                  }
                }}
              />
              <kbd className="absolute inset-e-2 top-1/2 -translate-y-1/2 rounded border bg-white px-1 text-[9px] text-muted-foreground dark:bg-slate-900">
                ⌘K
              </kbd>
            </label>
            {collapsed && (
              <button
                className="hidden size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted lg:grid"
                title={t("navigation.search")}
                onClick={() => {
                  setCollapsed(false);
                  localStorage.setItem("nho-sidebar-collapsed", "false");
                  window.setTimeout(
                    () => navigationSearchRef.current?.focus(),
                    320,
                  );
                }}
              >
                <Search className="size-4.25" />
              </button>
            )}
          </div>
          <nav
            dir={i18n.resolvedLanguage?.startsWith("en") ? "ltr" : "rtl"}
            className="sidebar-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pe-0.5"
          >
            <div className="space-y-1 pt-1">
              <NavLink
                to="/employee-portal"
                className={({ isActive }) =>
                  `group flex h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold outline-none transition-all ${isActive ? "bg-primary/10 text-primary shadow-[inset_3px_0_0_var(--primary)] rtl:shadow-[inset_-3px_0_0_var(--primary)]" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`
                }
              >
                <Lightbulb className="size-4.5 stroke-[1.8] transition-transform group-hover:scale-105" />
                <span className={collapsed ? "lg:hidden" : ""}>
                  {t("employeePortal.title")}
                </span>
              </NavLink>
            </div>
            <div className="contents">
              <div className="space-y-1">{navItems(primaryNavigation)}</div>
              {buildingNavigation.some(({ to }) =>
                hasPermission(user, permissionForPath(to)),
              ) && (
                <div className="mt-2 space-y-1">
                  {collapsed ? (
                    <NavLink
                      to="/building-expenses"
                      title={t("buildingExpenses.title")}
                      className="flex h-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
                    >
                      <Building2 className="size-4.5" />
                    </NavLink>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        className={sectionButtonClass(buildingNavigation)}
                        aria-expanded={
                          buildingExpanded ||
                          Boolean(normalizedNavigationSearch)
                        }
                        onClick={() => setBuildingExpanded((value) => !value)}
                      >
                        <Building2 className="size-4.25 shrink-0" />
                        <span className="flex-1 text-start">
                          {t("buildingExpenses.title")}
                        </span>
                        <ChevronDown
                          className={`size-3.5 transition-transform ${buildingExpanded ? "rotate-180" : ""}`}
                        />
                      </Button>
                      {(buildingExpanded ||
                        Boolean(normalizedNavigationSearch)) && (
                        <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                          {navItems(buildingNavigation)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
              <div
                className={`mt-2 space-y-1 ${taskNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/tasks"
                    title={t("tasks.title")}
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 lg:flex ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <ListTodo className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(taskNavigation)}
                      onClick={() => setTasksExpanded((value) => !value)}
                    >
                      <ListTodo className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">
                        {t("tasks.title")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${tasksExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(tasksExpanded || Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(taskNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${attendanceNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/attendance/devices"
                    title={t("navigation.attendance")}
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 lg:flex ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <CalendarCheck className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(attendanceNavigation)}
                      onClick={() => setAttendanceExpanded((value) => !value)}
                    >
                      <CalendarCheck className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">
                        {t("navigation.attendance")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${attendanceExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(attendanceExpanded ||
                      Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(attendanceNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${[...inventoryNavigation, ...productNavigation, ...storageNavigation, ...buyNavigation, ...warehouseDirectoryNavigation, ...warehouseExtraNavigation].some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/warehouses"
                    title={t("warehouseModule.title")}
                    className="hidden h-9 items-center justify-center rounded-lg lg:flex"
                  >
                    <Warehouse className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass([
                        ...warehouseDashboardNavigation,
                        ...buyNavigation,
                        ...productNavigation,
                        ...storageNavigation,
                        ...inventoryNavigation,
                        ...warehouseDirectoryNavigation,
                        ...warehouseExtraNavigation,
                      ])}
                      aria-expanded={
                        inventoryExpanded || Boolean(normalizedNavigationSearch)
                      }
                      onClick={() => setInventoryExpanded((v) => !v)}
                    >
                      <Warehouse className="size-4.25" />
                      <span className="flex-1 text-start">
                        {t("warehouseModule.title")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 ${inventoryExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(inventoryExpanded ||
                      Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(warehouseDashboardNavigation)}
                        {hasPermission(user, "inventory.warehouses.view") && (
                          <>
                            <button
                              className={sectionButtonClass(buyNavigation)}
                              aria-expanded={
                                buyExpanded ||
                                Boolean(normalizedNavigationSearch)
                              }
                              aria-controls="warehouse-buy-navigation"
                              onClick={() => setBuyExpanded((value) => !value)}
                            >
                              <ShoppingCart className="size-4.25 shrink-0" />
                              <span className="flex-1 text-start">
                                {t("warehouseModule.buy")}
                              </span>
                              <ChevronDown
                                className={`size-3.5 transition-transform ${buyExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                            {(buyExpanded ||
                              Boolean(normalizedNavigationSearch)) && (
                              <div
                                id="warehouse-buy-navigation"
                                className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3"
                              >
                                {navItems(buyNavigation)}
                              </div>
                            )}
                          </>
                        )}
                        {productNavigation.some(({ to }) =>
                          hasPermission(user, permissionForPath(to)),
                        ) && (
                          <>
                            <button
                              className={sectionButtonClass(productNavigation)}
                              aria-expanded={
                                productExpanded ||
                                Boolean(normalizedNavigationSearch)
                              }
                              aria-controls="warehouse-product-navigation"
                              onClick={() =>
                                setProductExpanded((value) => !value)
                              }
                            >
                              <Package className="size-4.25 shrink-0" />
                              <span className="flex-1 text-start">
                                {t("warehouseModule.product")}
                              </span>
                              <ChevronDown
                                className={`size-3.5 transition-transform ${productExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                            {(productExpanded ||
                              Boolean(normalizedNavigationSearch)) && (
                              <div
                                id="warehouse-product-navigation"
                                className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3"
                              >
                                {navItems(productNavigation)}
                              </div>
                            )}
                          </>
                        )}
                        {storageNavigation.some(({ to }) =>
                          hasPermission(user, permissionForPath(to)),
                        ) && (
                          <>
                            <button
                              className={sectionButtonClass(storageNavigation)}
                              aria-expanded={
                                storageExpanded ||
                                Boolean(normalizedNavigationSearch)
                              }
                              aria-controls="warehouse-storage-navigation"
                              onClick={() =>
                                setStorageExpanded((value) => !value)
                              }
                            >
                              <Boxes className="size-4.25 shrink-0" />
                              <span className="flex-1 text-start">
                                {t("warehouseModule.storage")}
                              </span>
                              <ChevronDown
                                className={`size-3.5 transition-transform ${storageExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                            {(storageExpanded ||
                              Boolean(normalizedNavigationSearch)) && (
                              <div
                                id="warehouse-storage-navigation"
                                className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3"
                              >
                                {navItems(storageNavigation)}
                              </div>
                            )}
                          </>
                        )}
                        {navItems(warehouseDirectoryNavigation)}
                        {warehouseGroups.map(({ key, icon: Icon }) => {
                          const items = warehouseExtraNavigation.filter(
                            ({ to }) => to.startsWith(`/warehouses/${key}/`),
                          );
                          if (
                            !items.some(({ to }) =>
                              hasPermission(user, permissionForPath(to)),
                            )
                          )
                            return null;
                          const expanded =
                            warehouseGroupsExpanded[key] ||
                            Boolean(normalizedNavigationSearch);
                          return (
                            <div key={key}>
                              <button
                                className={sectionButtonClass(items)}
                                aria-expanded={expanded}
                                aria-controls={`warehouse-${key}-navigation`}
                                onClick={() =>
                                  setWarehouseGroupsExpanded((value) => ({
                                    ...value,
                                    [key]: !value[key],
                                  }))
                                }
                              >
                                <Icon className="size-4.25 shrink-0" />
                                <span className="flex-1 text-start">
                                  {t(`warehouseModule.${key}`)}
                                </span>
                                <ChevronDown
                                  className={`size-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                                />
                              </button>
                              {expanded && (
                                <div
                                  id={`warehouse-${key}-navigation`}
                                  className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3"
                                >
                                  {navItems(items)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {navItems(inventoryNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${posNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/pos/checkout"
                    title={t("navigation.pos")}
                    className="hidden h-9 items-center justify-center rounded-lg lg:flex"
                  >
                    <ShoppingCart className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(posNavigation)}
                      onClick={() => setPosExpanded((v) => !v)}
                    >
                      <ShoppingCart className="size-4.25" />
                      <span className="flex-1 text-start">
                        {t("navigation.pos")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 ${posExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(posExpanded || Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(posNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${laboratoryNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/laboratory"
                    title={t("laboratory.title")}
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 lg:flex ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <FlaskConical className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(laboratoryNavigation)}
                      onClick={() => setLaboratoryExpanded((value) => !value)}
                    >
                      <FlaskConical className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">
                        {t("laboratory.title")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${laboratoryExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(laboratoryExpanded ||
                      Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(laboratoryNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${icuNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/icu/dashboard"
                    title={t("controlPanel.icu")}
                    aria-label={t("controlPanel.icu")}
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 lg:flex ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <HeartPulse className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(icuNavigation)}
                      aria-expanded={icuExpanded}
                      onClick={() => setIcuExpanded((value) => !value)}
                    >
                      <HeartPulse className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">
                        {t("controlPanel.icu")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${icuExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(icuExpanded || Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(icuNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${healthcareNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/departments"
                    title={t("navigation.healthcare")}
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 lg:flex ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <Stethoscope className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(healthcareNavigation)}
                      onClick={() => setHealthcareExpanded((value) => !value)}
                    >
                      <Stethoscope className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">
                        {t("navigation.healthcare")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${healthcareExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(healthcareExpanded ||
                      Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(healthcareNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${crmNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/crm/leads"
                    title="CRM"
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors lg:flex ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <ContactRound className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(crmNavigation)}
                      onClick={() => setCrmExpanded((value) => !value)}
                    >
                      <ContactRound className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">CRM</span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${crmExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(crmExpanded || Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(crmNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${hrNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/employees"
                    title={t("navigation.humanResources")}
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 lg:flex ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <BriefcaseBusiness className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(hrNavigation)}
                      onClick={() => setHrExpanded((value) => !value)}
                    >
                      <BriefcaseBusiness className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">
                        {t("navigation.humanResources")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${hrExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(hrExpanded || Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(hrNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div
                className={`mt-2 space-y-1 ${accountingNavigation.some(({ to }) => hasPermission(user, permissionForPath(to))) ? "" : "hidden"}`}
              >
                {collapsed ? (
                  <NavLink
                    to="/accounting/accounts"
                    title={t("navigation.accounting")}
                    className={({ isActive }) =>
                      `hidden h-9 items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 lg:flex ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/7 hover:text-primary"}`
                    }
                  >
                    <Landmark className="size-4.25" />
                  </NavLink>
                ) : (
                  <>
                    <button
                      className={sectionButtonClass(accountingNavigation)}
                      onClick={() => setAccountingExpanded((value) => !value)}
                    >
                      <Landmark className="size-4.25 shrink-0" />
                      <span className="flex-1 text-start">
                        {t("navigation.accounting")}
                      </span>
                      <ChevronDown
                        className={`size-3.5 transition-transform ${accountingExpanded ? "rotate-180" : ""}`}
                      />
                    </button>
                    {(accountingExpanded ||
                      Boolean(normalizedNavigationSearch)) && (
                      <div className="ms-4.5 space-y-0.5 border-s border-primary/20 ps-3">
                        {navItems(accountingNavigation)}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="my-3 border-t" />
              <div
                className={`mb-1 flex h-6 items-center px-2 text-[10px] font-medium text-muted-foreground ${collapsed ? "lg:hidden" : ""}`}
              >
                {t("navigation.accessControl")}
              </div>
              <div className="space-y-1">{navItems(accessNavigation)}</div>
              <div className="mt-auto space-y-1 pb-3">
                {[
                  [Settings, "navigation.settings"],
                  [CircleHelp, "navigation.help"],
                ]
                  .filter(
                    ([, label]) =>
                      label !== "navigation.settings" ||
                      hasPermission(user, permissionForPath("/settings")),
                  )
                  .map(([Icon, label]) => (
                    <button
                      key={String(label)}
                      onClick={() => {
                        if (label === "navigation.settings")
                          navigate("/settings");
                      }}
                      className={`flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-primary/7 hover:text-primary ${collapsed ? "lg:justify-center lg:px-0" : ""}`}
                    >
                      <Icon className="size-4.25 stroke-[1.7]" />
                      <span className={collapsed ? "lg:hidden" : ""}>
                        {t(String(label))}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </nav>
          <div className="border-t border-primary/15 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={`flex w-full items-center gap-2.5 rounded-xl p-1.5 text-start transition-all hover:bg-muted ${collapsed ? "lg:justify-center" : ""}`}
                >
                  <Avatar className="size-9 shrink-0 border border-primary/15 shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-[10px] font-bold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}
                  >
                    <strong className="block truncate text-[11px] font-bold">
                      {user?.name ?? "Qasem Admin"}
                    </strong>
                    <small className="mt-0.5 block truncate text-[9px] text-muted-foreground">
                      @{user?.username ?? "admin"}
                    </small>
                  </span>
                  <ChevronDown
                    className={`size-3 text-muted-foreground ${collapsed ? "lg:hidden" : ""}`}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={collapsed ? "right" : "top"}
                align="start"
                sideOffset={8}
                className="z-10000 w-56 rounded-xl p-2"
              >
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs font-semibold">
                    {user?.name ?? "Qasem Admin"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    @{user?.username ?? "admin"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/profile")}>
                  <UserRound />
                  {t("navigation.profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={loggingOut}
                  onSelect={() => setLogoutConfirmOpen(true)}
                >
                  <LogOut />
                  {loggingOut
                    ? t("navigation.loggingOut")
                    : t("navigation.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>
      )}
      <div
        className={`flex h-svh min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ${panelMode ? "" : collapsed ? "lg:ps-20" : "lg:ps-71.5"}`}
      >
        <header className="electron-titlebar relative z-40 flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-card/92 px-3 py-2 backdrop-blur-xl sm:flex-nowrap sm:gap-3 md:px-6">
          {!panelMode && (
            <Button
              className="border lg:hidden"
              variant="outline"
              size="icon"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          )}
          {!panelMode && (
            <button
              className="hidden size-9 place-items-center rounded-lg border border-primary/15 bg-card text-muted-foreground shadow-sm transition-colors hover:bg-primary/8 hover:text-primary lg:grid"
              onClick={toggle}
              title={collapsed ? t("expandSidebar") : t("collapseSidebar")}
              aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
            >
              {collapsed ? (
                <PanelLeftOpen className="size-4.5" />
              ) : (
                <PanelLeftClose className="size-4.5" />
              )}
            </button>
          )}
          <div className="min-w-0 flex-1 lg:absolute lg:inset-s-1/2 lg:w-auto lg:-translate-x-1/2 lg:rtl:translate-x-1/2">
            <HeaderSearch
              menus={Array.from(
                new Map(
                  panelGroups
                    .flatMap((group) => group.items)
                    .map((item) => [item.to, item]),
                ).values(),
              )}
              onNavigate={(to) => {
                if (panelMode) openPanelPage(to);
                else navigate(to);
                setOpen(false);
              }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Select
              value={i18n.resolvedLanguage?.split("-")[0] ?? "en"}
              onValueChange={(v) => void i18n.changeLanguage(v)}
            >
              <SelectTrigger
                className="h-9 w-9 shrink-0 justify-center rounded-lg p-0 [&>svg:last-child]:hidden"
                aria-label={t("language.label")}
              >
                <Globe2 className="size-4" aria-hidden="true" />
              </SelectTrigger>
              <SelectContent className="z-10000">
                <SelectItem value="en">{t("language.english")}</SelectItem>
                <SelectItem value="ar">{t("language.arabic")}</SelectItem>
                <SelectItem value="ku">{t("language.kurdish")}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="size-9 shrink-0 rounded-lg"
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={theme === "dark" ? "Use light mode" : "Use dark mode"}
              aria-label={theme === "dark" ? "Use light mode" : "Use dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="size-9 shrink-0 rounded-lg"
                  variant="outline"
                  size="icon"
                  aria-label={t("navigation.profile")}
                  title={t("navigation.profile")}
                >
                  <UserRound className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-10000 w-56 rounded-xl p-2"
              >
                <DropdownMenuLabel className="font-normal">
                  <p className="truncate text-sm font-semibold">{user?.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    @{user?.username}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate("/profile")}>
                  <UserRound />
                  {t("navigation.profile")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  disabled={loggingOut}
                  onSelect={() => setLogoutConfirmOpen(true)}
                >
                  <LogOut />
                  {loggingOut
                    ? t("navigation.loggingOut")
                    : t("navigation.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="relative size-9 shrink-0 rounded-lg"
                  variant="outline"
                  size="icon"
                  aria-label={t("notificationCenter.title")}
                >
                  <Bell className="size-4 fill-red-500 text-red-500 dark:text-red-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -inset-e-1.5 -top-1.5 grid min-w-4.5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-10000 w-80 rounded-xl p-2"
              >
                <DropdownMenuLabel className="flex items-center justify-between gap-3">
                  <span>{t("notificationCenter.title")}</span>
                  {unreadCount > 0 && (
                    <button
                      className="text-xs font-normal text-primary hover:underline"
                      onClick={(event) => {
                        event.preventDefault();
                        void markAllNotificationsRead();
                      }}
                    >
                      {t("notificationCenter.markAllRead")}
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    {t("notificationCenter.empty")}
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className="items-start gap-2 rounded-lg py-2.5"
                      onSelect={() => void openNotification(notification)}
                    >
                      <span
                        className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.readAt ? "bg-muted" : "bg-primary"}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold">
                          {notification.title ??
                            notificationLabel(notification.type, t)}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {notification.warning?.title ??
                            notification.meeting?.title ??
                            notification.body ??
                            notification.task?.title ??
                            t("notificationCenter.deletedTask")}
                        </span>
                        <span className="mt-1 block text-[10px] text-muted-foreground">
                          {new Intl.DateTimeFormat(i18n.resolvedLanguage, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }).format(new Date(notification.createdAt))}
                        </span>
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <WindowControls />
          </div>
        </header>
        {panelMode && (
          <nav
            aria-label={t("controlPanel.openPages")}
            className="flex min-w-0 shrink-0 items-end gap-1 overflow-x-auto overscroll-x-contain border-b border-border/60 bg-muted/70 px-3 pt-2 md:px-6"
          >
            <Button
              variant="ghost"
              aria-current={showPanel ? "page" : undefined}
              className={`h-10 shrink-0 rounded-b-none rounded-t-xl border border-b-0 px-4 shadow-none ${showPanel ? "border-border/60 bg-card text-primary" : "border-transparent text-muted-foreground"}`}
              onClick={() => {
                setShowPanel(true);
                setPanelGroup(null);
                setPanelSearch("");
              }}
            >
              <LayoutDashboard className="size-4" />
              {t("controlPanel.title")}
            </Button>
            {pageTabs.map((tab) => {
              const active = !showPanel && tab.to === activeTabPath;
              const item = panelGroups
                .flatMap((group) => group.items)
                .find((item) => item.to === tab.to.split("?")[0]);
              const title = item ? t(item.label) : tab.title;
              return (
                <div
                  key={tab.to}
                  className={`flex h-10 shrink-0 items-center rounded-t-xl border border-b-0 pe-1 ${active ? "border-border/60 bg-card text-primary" : "border-transparent text-muted-foreground hover:bg-card/60"}`}
                >
                  <Button
                    variant="ghost"
                    aria-current={active ? "page" : undefined}
                    title={title}
                    className="h-full min-w-24 max-w-52 justify-start rounded-none px-3 shadow-none hover:bg-transparent"
                    onClick={() => openPanelPage(tab.to)}
                  >
                    <span className="truncate">{title}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 rounded-full shadow-none"
                    aria-label={t("controlPanel.closePage", { name: title })}
                    title={t("controlPanel.closePage", { name: title })}
                    onClick={() => closePageTab(tab.to)}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              );
            })}
          </nav>
        )}
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <main className="content-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scroll-smooth">
            <div
              className={
                location.pathname.replace(/\/$/, "") === "/tasks" &&
                (new URLSearchParams(location.search).has("department") ||
                  new URLSearchParams(location.search).has("project") ||
                  new URLSearchParams(location.search).get("view") ===
                    "review") &&
                !(panelMode && showPanel)
                  ? "flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-5 xl:p-6 [&>button]:shrink-0"
                  : "min-h-full p-3 md:p-5 xl:p-6"
              }
            >
              {panelMode && showPanel ? (
                <div
                  className="mx-auto max-w-7xl space-y-6 py-3 md:py-6"
                  dir={i18n.dir()}
                >
                  <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-teal-700 via-primary to-brand-bright p-4 text-white shadow-lg shadow-primary/10 md:px-6 md:py-5">
                    <div>
                      <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-teal-100">
                        {systemSettings?.organization.name || ""}
                      </p>
                      <h1 className="max-w-2xl warp-break-words text-lg font-bold leading-relaxed sm:text-xl md:text-2xl">
                        {t("controlPanel.welcome", { name: user?.name || "" })}
                      </h1>
                      <p className="mt-1 text-sm text-teal-100/85">
                        {t("controlPanel.description")}
                      </p>
                    </div>
                    <div className="w-full space-y-2 sm:w-72 lg:w-80">
                      <LiveDateTime
                        locale={i18n.resolvedLanguage ?? "en"}
                        banner
                      />
                      <div className="relative">
                        <Search className="pointer-events-none absolute inset-s-4 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          className="h-10 rounded-lg border-white/20 bg-background ps-11 pe-11 text-sm font-normal text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-teal-300 focus-visible:ring-2 focus-visible:ring-teal-300/30"
                          value={panelSearch}
                          onChange={(event) =>
                            setPanelSearch(event.target.value)
                          }
                          placeholder={t("controlPanel.search")}
                          aria-label={t("controlPanel.search")}
                        />
                        {panelSearch && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-e-2 top-1/2 size-8 -translate-y-1/2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            aria-label={t("controlPanel.clearSearch")}
                            onClick={() => setPanelSearch("")}
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {panelGroup
                        ? panelGroup === "building"
                          ? t("buildingExpenses.title")
                          : t(`controlPanel.${panelGroup}`)
                        : t("controlPanel.workspaces")}
                    </h2>
                  </div>
                  <div
                    key={panelGroup ? `workspace:${panelGroup}` : "workspaces"}
                    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {panelGroup
                      ? panelGroups
                          .find((group) => group.key === panelGroup)
                          ?.items.filter((item) =>
                            t(item.label)
                              .toLocaleLowerCase()
                              .includes(panelTerm),
                          )
                          .map((item) => (
                            <WorkspaceCard
                              key={`page:${panelGroup}:${item.to}`}
                              icon={item.icon}
                              title={t(item.label)}
                              description={t(
                                `controlPanel.descriptions.${panelGroup}`,
                                {
                                  defaultValue:
                                    panelGroup === "building"
                                      ? t("buildingExpenses.description")
                                      : "",
                                },
                              )}
                              meta={
                                panelGroup === "building"
                                  ? t("buildingExpenses.title")
                                  : t(`controlPanel.${panelGroup}`)
                              }
                              colorIndex={
                                panelGroups
                                  .find((group) => group.key === panelGroup)
                                  ?.items.findIndex(
                                    (entry) => entry.to === item.to,
                                  ) ?? 0
                              }
                              onClick={() => openPanelPage(item.to)}
                            />
                          ))
                      : visibleGroups.map((group) => (
                          <WorkspaceCard
                            key={`workspace:${group.key}`}
                            icon={group.icon}
                            title={t(`controlPanel.${group.key}`, {
                              defaultValue:
                                group.key === "building"
                                  ? t("buildingExpenses.title")
                                  : group.key,
                            })}
                            description={t(
                              `controlPanel.descriptions.${group.key}`,
                              {
                                defaultValue:
                                  group.key === "building"
                                    ? t("buildingExpenses.description")
                                    : "",
                              },
                            )}
                            meta={t("controlPanel.pages", {
                              count: group.items.length,
                            })}
                            colorIndex={panelGroups.findIndex(
                              (entry) => entry.key === group.key,
                            )}
                            onClick={() => {
                              setPanelGroup(group.key);
                              if (group.key === "settings")
                                openPanelPage(group.items[0].to);
                            }}
                          />
                        ))}
                  </div>
                  {!panelGroup && !visibleGroups.length && (
                    <p className="py-8 text-center text-muted-foreground">
                      {t("resourceState.notFound")}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {panelMode &&
                    !["/tasks", "/tasks/dashboard"].includes(
                      location.pathname.replace(/\/$/, ""),
                    ) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mb-4"
                        onClick={() => {
                          if (
                            /^\/crm\/patients\/[^/]+$/.test(
                              location.pathname,
                            ) &&
                            location.state?.from === "/crm/today-patients"
                          ) {
                            navigate("/crm/today-patients");
                            return;
                          }
                          if (panelMode) {
                            const workspace =
                              panelGroups.find((group) =>
                                group.items.some(
                                  (item) => item.to === location.pathname,
                                ),
                              ) ??
                              panelGroups.find((group) =>
                                group.items.some((item) =>
                                  location.pathname.startsWith(`${item.to}/`),
                                ),
                              );
                            setPanelGroup(
                              workspace?.key === "settings"
                                ? null
                                : (workspace?.key ?? null),
                            );
                            setPanelSearch("");
                            setShowPanel(true);
                          } else if (window.history.state?.idx > 0)
                            navigate(-1);
                          else navigate("/dashboard");
                        }}
                      >
                        <ArrowLeft className="size-4 rtl:rotate-180" />
                        {t("controlPanel.goBack")}
                      </Button>
                    )}
                  <Outlet key={location.pathname + location.search} />
                </>
              )}
              {hasPermission(user, "meetings.view") && (
                <MeetingSessionHost
                  visible={
                    location.pathname.replace(/\/$/, "") === "/meetings" &&
                    !(panelMode && showPanel)
                  }
                  onReturn={() => {
                    setShowPanel(false);
                    navigate("/meetings");
                  }}
                />
              )}
            </div>
          </main>
        </div>
      </div>
      <AlertDialog
        open={logoutConfirmOpen}
        onOpenChange={(value) => {
          if (!logoutLock.current) setLogoutConfirmOpen(value);
        }}
      >
        <AlertDialogContent dir={i18n.dir()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("navigation.confirmLogout")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("navigation.confirmLogoutDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700 hover:text-white"
              disabled={loggingOut}
              onClick={(event) => {
                event.preventDefault();
                void logout();
              }}
            >
              {t(loggingOut ? "navigation.loggingOut" : "navigation.logout")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {open && !panelMode && (
        <button
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
