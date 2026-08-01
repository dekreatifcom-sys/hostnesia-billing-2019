import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Server, Globe, Receipt, Users, User, Zap, ChevronDown, Package, Briefcase, PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuickActions } from "@/context/QuickActionsContext";

export default function Sidebar() {
  const { user } = useAuth();
  const { openForm } = useQuickActions();
  const location = useLocation();
  const layananActive = location.pathname.startsWith("/layanan");
  const [open, setOpen] = useState(true);

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
      isActive ? "bg-brand-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
    }`;
  const subCls = ({ isActive }) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "text-brand" : "text-slate-500 hover:text-slate-800"
    }`;

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

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <NavLink to="/" end className={linkCls} data-testid="sidebar-beranda"><Home className="h-5 w-5" /> Beranda</NavLink>

        <button
          onClick={() => setOpen((o) => !o)}
          data-testid="sidebar-layanan"
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
            layananActive ? "bg-brand-light text-brand" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          <Server className="h-5 w-5" /> Layanan
          <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="ml-4 space-y-0.5 border-l border-slate-100 pl-3">
            <NavLink to="/layanan" end className={subCls} data-testid="sidebar-layanan-saya"><Package className="h-4 w-4" /> Layanan Saya</NavLink>
            <NavLink to="/layanan/jasa" className={subCls} data-testid="sidebar-layanan-jasa"><Briefcase className="h-4 w-4" /> Layanan Jasa</NavLink>
            <button onClick={() => openForm("order")} data-testid="sidebar-order-baru" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800">
              <PlusCircle className="h-4 w-4" /> Order Layanan Baru
            </button>
          </div>
        )}

        <NavLink to="/domain" className={linkCls} data-testid="sidebar-domain"><Globe className="h-5 w-5" /> Domain</NavLink>
        <NavLink to="/tagihan" className={linkCls} data-testid="sidebar-tagihan"><Receipt className="h-5 w-5" /> Tagihan & Dompet</NavLink>
        <NavLink to="/afiliasi" className={linkCls} data-testid="sidebar-afiliasi"><Users className="h-5 w-5" /> Afiliasi</NavLink>
        <NavLink to="/profil" className={linkCls} data-testid="sidebar-profil"><User className="h-5 w-5" /> Profil</NavLink>
      </nav>

      <div className="m-3 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs text-slate-400">Masuk sebagai</p>
        <p className="truncate text-sm font-semibold text-slate-800">{user?.nama}</p>
        <p className="truncate text-xs text-slate-400">{user?.email}</p>
      </div>
    </aside>
  );
}
