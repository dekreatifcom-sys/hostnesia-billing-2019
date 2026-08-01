import { NavLink } from "react-router-dom";
import { Home, Server, Receipt, User, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const items = [
  { to: "/", label: "Beranda", icon: Home, testid: "sidebar-beranda" },
  { to: "/layanan", label: "Layanan", icon: Server, testid: "sidebar-layanan" },
  { to: "/tagihan", label: "Tagihan & Dompet", icon: Receipt, testid: "sidebar-tagihan" },
  { to: "/profil", label: "Profil", icon: User, testid: "sidebar-profil" },
];

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white shadow-card">
          <Zap className="h-5 w-5" fill="currentColor" />
        </div>
        <div>
          <p className="font-heading text-lg font-extrabold leading-none text-slate-800">HostNesia</p>
          <p className="text-xs text-slate-400">Client Area</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon, testid }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            data-testid={testid}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                isActive ? "bg-brand-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="m-3 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs text-slate-400">Masuk sebagai</p>
        <p className="truncate text-sm font-semibold text-slate-800">{user?.nama}</p>
        <p className="truncate text-xs text-slate-400">{user?.email}</p>
      </div>
    </aside>
  );
}
