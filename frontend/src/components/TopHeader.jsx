import { useState } from "react";
import { Plus, Wallet, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWallet } from "@/lib/queries";
import { idr } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import QuickActionsPanel from "@/components/QuickActionsPanel";

export default function TopHeader() {
  const { user } = useAuth();
  const { data: wallet } = useWallet();
  const [open, setOpen] = useState(false);
  const initials = (user?.nama || "U").split(" ").map((n) => n[0]).slice(0, 2).join("");

  return (
    <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-slate-200 bg-white/90 px-8 py-4 backdrop-blur md:flex">
      <div>
        <p className="text-xs font-medium text-slate-400">Client Area</p>
        <h2 className="font-heading text-xl font-bold text-slate-800">Selamat datang kembali 👋</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2">
          <Wallet className="h-4 w-4 text-brand" />
          <span className="text-sm font-bold text-slate-800">{idr(wallet?.saldo_kredit)}</span>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              data-testid="quick-actions-dropdown-trigger"
              className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-dark"
            >
              <Plus className="h-4 w-4" />
              Quick Actions
              <ChevronDown className="h-4 w-4 opacity-80" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[360px] rounded-2xl p-4">
            <h3 className="mb-3 font-heading text-base font-bold text-slate-800">Quick Access</h3>
            <QuickActionsPanel onSelect={() => setOpen(false)} />
          </PopoverContent>
        </Popover>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-sm font-bold uppercase text-brand">
          {initials}
        </div>
      </div>
    </header>
  );
}
