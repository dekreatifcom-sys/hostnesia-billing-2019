import { useServices, useInvoices, useWallet } from "@/lib/queries";
import { useAuth } from "@/context/AuthContext";
import { useQuickActions } from "@/context/QuickActionsContext";
import WalletCard from "@/components/WalletCard";
import ServiceCard from "@/components/ServiceCard";
import UnpaidAlert from "@/components/UnpaidAlert";
import { Server, Plus, Loader2 } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { openSheet } = useQuickActions();
  const { data: services = [], isLoading: sl } = useServices();
  const { data: invoices = [] } = useInvoices();
  const { data: wallet, isLoading: wl } = useWallet();

  const active = services.filter((s) => s.status === "Active");

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <p className="text-sm text-slate-400">{greeting()},</p>
        <h1 className="font-heading text-2xl font-extrabold text-slate-800 md:text-3xl">
          {user?.nama} 👋
        </h1>
      </div>

      {wl ? (
        <div className="flex h-40 items-center justify-center rounded-3xl bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : (
        <WalletCard saldo={wallet?.saldo_kredit} />
      )}

      <UnpaidAlert invoices={invoices} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-slate-800">Layanan Aktif</h2>
          <span className="rounded-full bg-brand-light px-2.5 py-1 text-xs font-bold text-brand">
            {active.length} layanan
          </span>
        </div>

        {sl ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Server className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Belum ada layanan aktif.</p>
            <button
              onClick={openSheet}
              className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              <Plus className="h-4 w-4" /> Order Layanan
            </button>
          </div>
        ) : (
          <>
            {/* Mobile: swipeable carousel */}
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:hidden">
              {services.map((s) => (
                <div key={s.id} className="w-[85vw] shrink-0 snap-start">
                  <ServiceCard service={s} />
                </div>
              ))}
            </div>
            {/* Desktop: responsive grid */}
            <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
