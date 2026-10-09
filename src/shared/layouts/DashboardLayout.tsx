import { Menu } from "lucide-react";
import { Suspense, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { useAutoReminders } from "../../features/reminders/reminderService";
import { cn } from "../../lib/utils";
import ErrorBoundary from "../components/ErrorBoundary";
import GlobalSearch from "./GlobalSearch";
import Sidebar from "./Sidebar";

const COLLAPSED_KEY = "kronopet:sidebar-collapsed";

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useAutoReminders();

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, value ? "0" : "1");
      } catch {
        // Preferencia no persistida; no afecta el funcionamiento.
      }
      return !value;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-100/70">
      {/* Sidebar escritorio */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 lg:block",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 animate-in bg-neutral-900/50 fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-72 animate-in slide-in-from-left">
            <Sidebar
              collapsed={false}
              onToggleCollapsed={toggleCollapsed}
              onNavigate={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-neutral-200/70 bg-white/85 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            className="btn-icon lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <GlobalSearch />
        </header>

        <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
          <ErrorBoundary key={location.pathname}>
            <Suspense
              fallback={
                <div className="grid min-h-[50vh] place-items-center">
                  <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary-200 border-t-primary-600" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
