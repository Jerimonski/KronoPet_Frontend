import {
  BellRing,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  PawPrint,
  Stethoscope,
  Syringe,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router";
import { useAuth } from "../../features/auth/context/AuthContext";
import { cn } from "../../lib/utils";
import { Avatar } from "../components/Avatar";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/tutores", label: "Tutores", icon: Users },
  { to: "/dashboard/mascotas", label: "Mascotas", icon: PawPrint },
  { to: "/dashboard/historial", label: "Historial clínico", icon: ClipboardList },
  { to: "/dashboard/vacunas", label: "Vacunas", icon: Syringe },
  { to: "/dashboard/recordatorios", label: "Recordatorios", icon: BellRing },
  { to: "/dashboard/equipo", label: "Equipo veterinario", icon: Stethoscope, adminOnly: true },
  { to: "/dashboard/auditoria", label: "Auditoría", icon: History, adminOnly: true },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapsed, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-primary-950 text-primary-100">
      {/* Marca */}
      <div className={cn("flex h-16 items-center gap-2.5 px-4", collapsed && "justify-center px-0")}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-500 text-primary-950">
          <PawPrint className="h-5 w-5" />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-display text-lg font-bold text-white">KronoPet</p>
            <p className="text-[11px] text-primary-300">Panel clínico</p>
          </div>
        )}
      </div>

      {/* Módulos */}
      <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Módulos">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-medium tracking-wider text-primary-400 uppercase">
            Módulos
          </p>
        )}
        {NAV_ITEMS.filter((item) => !item.adminOnly || user?.role === "administrador").map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition",
                collapsed && "justify-center px-0",
                isActive
                  ? "bg-primary-500 text-primary-950 shadow-(--shadow-soft)"
                  : "text-primary-200 hover:bg-white/5 hover:text-white",
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Usuario y acciones */}
      <div className="space-y-1 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            "hidden h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-primary-200 transition hover:bg-white/5 hover:text-white lg:flex",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Expandir menú" : undefined}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          {!collapsed && <span>Contraer menú</span>}
        </button>
        <button
          type="button"
          onClick={logout}
          className={cn(
            "flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-primary-200 transition hover:bg-white/5 hover:text-accent-300",
            collapsed && "justify-center px-0",
          )}
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
        {user && (
          <div className={cn("mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-2", collapsed && "justify-center bg-transparent p-0")}>
            <Avatar name={user.name} className="bg-primary-500 text-primary-950" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-primary-300">{user.specialty}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
