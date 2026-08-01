import { NavLink } from "react-router-dom";
import { Home, Server, Receipt, User, Plus } from "lucide-react";
import { useQuickActions } from "@/context/QuickActionsContext";

const NavItem = ({ to, label, icon: Icon, testid }) => (
  <NavLink
    to={to}
    end={to === "/"}
    data-testid={testid}
    className={({ isActive }) =>
      `flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
        isActive ? "text-brand" : "text-slate-400"
      }`
    }
  >
    <Icon className="h-5 w-5" />
    {label}
  </NavLink>
);

export default function BottomNav() {
  const { openSheet } = useQuickActions();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-[72px] items-stretch border-t border-slate-100 bg-white px-2 md:hidden">
      <NavItem to="/" label="Beranda" icon={Home} testid="nav-beranda" />
      <NavItem to="/layanan" label="Layanan" icon={Server} testid="nav-layanan" />

      <div className="flex w-16 items-start justify-center">
        <button
          onClick={openSheet}
          data-testid="fab-button"
          aria-label="Quick Actions"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_25px_rgba(22,109,180,0.45)] ring-4 ring-white transition-transform active:scale-90"
        >
          <Plus className="h-7 w-7" />
        </button>
      </div>

      <NavItem to="/tagihan" label="Tagihan" icon={Receipt} testid="nav-tagihan" />
      <NavItem to="/profil" label="Profil" icon={User} testid="nav-profil" />
    </nav>
  );
}
