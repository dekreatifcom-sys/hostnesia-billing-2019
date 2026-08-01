import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuickActions } from "@/context/QuickActionsContext";
import { useWallet } from "@/lib/queries";
import { idr } from "@/lib/format";
import { Mail, Phone, Wallet, KeyRound, LogOut, ChevronRight, ShieldCheck, Globe, Users, Briefcase } from "lucide-react";

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { runSso } = useQuickActions();
  const { data: wallet } = useWallet();
  const navigate = useNavigate();
  const initials = (user?.nama || "U").split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6" data-testid="profile-page">
      <h1 className="font-heading text-2xl font-extrabold text-slate-800">Profil & Pengaturan</h1>

      <div className="flex items-center gap-4 rounded-3xl bg-brand p-6 text-white shadow-card">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold uppercase">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-heading text-xl font-bold">{user?.nama}</p>
          <p className="truncate text-sm text-white/80">{user?.email}</p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
        <Row icon={Mail} label="Email" value={user?.email} />
        <Row icon={Phone} label="Telepon" value={user?.phone || "-"} />
        <Row icon={Wallet} label="Saldo Kredit" value={idr(wallet?.saldo_kredit)} />
      </div>

      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Menu</p>
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <button onClick={() => navigate("/domain")} data-testid="profile-nav-domain" className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand"><Globe className="h-5 w-5" /></span>
            <span className="flex-1 text-sm font-semibold text-slate-800">Domain Saya</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
          <button onClick={() => navigate("/layanan/jasa")} data-testid="profile-nav-jasa" className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand"><Briefcase className="h-5 w-5" /></span>
            <span className="flex-1 text-sm font-semibold text-slate-800">Layanan Jasa</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
          <button onClick={() => navigate("/afiliasi")} data-testid="profile-nav-afiliasi" className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-light text-brand"><Users className="h-5 w-5" /></span>
            <span className="flex-1 text-sm font-semibold text-slate-800">Program Afiliasi</span>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Akses Tingkat Lanjut
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <button
            onClick={() => runSso("cPanel")}
            data-testid="profile-cpanel-button"
            className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <KeyRound className="h-4.5 w-4.5" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">Login ke cPanel</p>
              <p className="text-xs text-slate-400">Katup pengaman untuk power user (SSO)</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        <ShieldCheck className="h-4 w-4" />
        Akun Anda terverifikasi & aman.
      </div>

      <button
        onClick={async () => {
          await logout();
          navigate("/login", { replace: true });
        }}
        data-testid="logout-button"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
      >
        <LogOut className="h-4 w-4" /> Keluar
      </button>
    </div>
  );
}
