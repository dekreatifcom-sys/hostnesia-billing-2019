import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Wallet, ChevronDown, UserCog, FileText, Users, Phone, ShieldCheck, MailCheck, User, RefreshCw, KeyRound, Settings, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { useWallet } from "@/lib/queries";
import { idr } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import NotificationBell from "@/components/NotificationBell";
import TopupDialog from "@/components/TopupDialog";

export default function TopHeader() {
  const { user, logout } = useAuth();
  const { data: wallet } = useWallet();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const initials = (user?.nama || "U").split(" ").map((n) => n[0]).slice(0, 2).join("");
  const soon = (label) => toast.info(`${label} — segera hadir`);
  const doLogout = async () => { await logout(); navigate("/login", { replace: true }); };

  return (
    <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-slate-200 bg-white/90 px-8 py-4 backdrop-blur md:flex">
      <div>
        <p className="text-xs font-medium text-slate-400">Client Area</p>
        <h2 className="font-heading text-xl font-bold text-slate-800">Selamat datang kembali 👋</h2>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-4 pr-1.5" data-testid="header-saldo">
          <Wallet className="h-4 w-4 text-brand" />
          <span className="text-sm font-bold text-slate-800">{idr(wallet?.saldo_kredit)}</span>
          <TopupDialog>
            <button data-testid="header-topup-button" aria-label="Top-up saldo" className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white transition-transform hover:scale-105 active:scale-95">
              <Plus className="h-4 w-4" />
            </button>
          </TopupDialog>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button data-testid="quick-actions-dropdown-trigger" className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-dark">
              <Plus className="h-4 w-4" /> Quick Actions <ChevronDown className="h-4 w-4 opacity-80" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[360px] rounded-2xl p-4">
            <h3 className="mb-3 font-heading text-base font-bold text-slate-800">Quick Access</h3>
            <QuickActionsPanel onSelect={() => setOpen(false)} />
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="header-profile-trigger" className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5 transition-colors hover:bg-slate-50">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-xs font-bold uppercase text-brand">{initials}</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60 rounded-xl">
            <DropdownMenuLabel>
              <p className="text-sm font-bold text-slate-800">{user?.nama}</p>
              <p className="truncate text-xs font-normal text-slate-400">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profil")} data-testid="profile-menu-akun" className="cursor-pointer"><UserCog className="mr-2 h-4 w-4 text-brand" /> Detail Akun Saya</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("Informasi Pajak")} className="cursor-pointer"><FileText className="mr-2 h-4 w-4 text-brand" /> Informasi Pajak</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("User Management")} className="cursor-pointer"><Users className="mr-2 h-4 w-4 text-brand" /> User Management</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("Kontak")} className="cursor-pointer"><Phone className="mr-2 h-4 w-4 text-brand" /> Kontak</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("Keamanan Akun")} className="cursor-pointer"><ShieldCheck className="mr-2 h-4 w-4 text-brand" /> Keamanan Akun</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("Riwayat Email")} className="cursor-pointer"><MailCheck className="mr-2 h-4 w-4 text-brand" /> Riwayat Email</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profil")} className="cursor-pointer"><User className="mr-2 h-4 w-4" /> Profil Kamu</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("Switch Account")} className="cursor-pointer"><RefreshCw className="mr-2 h-4 w-4" /> Switch Account</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("Ganti Kata Sandi")} className="cursor-pointer"><KeyRound className="mr-2 h-4 w-4" /> Ganti Kata Sandi</DropdownMenuItem>
            <DropdownMenuItem onClick={() => soon("Pengaturan Keamanan")} className="cursor-pointer"><Settings className="mr-2 h-4 w-4" /> Pengaturan Keamanan</DropdownMenuItem>
            <DropdownMenuItem onClick={doLogout} data-testid="profile-menu-logout" className="cursor-pointer text-red-600 focus:text-red-600"><LogOut className="mr-2 h-4 w-4" /> Keluar / Log Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
