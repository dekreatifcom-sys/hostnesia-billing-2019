import { useNavigate } from "react-router-dom";
import { useServices, useInvoices, useWallet, useDomains } from "@/lib/queries";
import { useAuth } from "@/context/AuthContext";
import BannerSlider from "@/components/BannerSlider";
import DomainSearchWidget from "@/components/DomainSearchWidget";
import ServiceListRow from "@/components/ServiceListRow";
import NotificationBell from "@/components/NotificationBell";
import TopupDialog from "@/components/TopupDialog";
import { idr } from "@/lib/format";
import { Server, Globe, Receipt, ShoppingCart, Loader2, AlertTriangle, CheckCircle2, ArrowRight, Wallet, Plus } from "lucide-react";

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 19) return "Selamat sore";
  return "Selamat malam";
}

function StatCard({ value, label, icon: Icon, valueClass, onClick, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className="relative flex flex-col items-start overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-card"
    >
      <Icon className="absolute right-4 top-4 h-6 w-6 text-slate-100" />
      <span className={`font-heading text-3xl font-extrabold sm:text-4xl ${valueClass}`}>{value}</span>
      <span className="mt-1 text-sm font-medium text-slate-500">{label}</span>
    </button>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: services = [], isLoading: sl } = useServices();
  const { data: invoices = [] } = useInvoices();
  const { data: wallet } = useWallet();
  const { data: domains = [] } = useDomains();

  const hosting = services.filter((s) => (s.category || "hosting") === "hosting");
  const active = hosting.filter((s) => s.status === "Active");
  const unpaid = invoices.filter((i) => i.status === "Unpaid");
  const unpaidTotal = unpaid.reduce((a, i) => a + i.jumlah_tagihan, 0);

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">{greeting()},</p>
          <h1 className="font-heading text-2xl font-extrabold text-slate-800 md:text-3xl">{user?.nama} 👋</h1>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-1.5" data-testid="mobile-saldo">
            <Wallet className="h-4 w-4 text-brand" />
            <span className="text-xs font-bold text-slate-800">{idr(wallet?.saldo_kredit)}</span>
            <TopupDialog>
              <button data-testid="mobile-topup-button" aria-label="Top-up saldo" className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </TopupDialog>
          </div>
          <NotificationBell />
        </div>
      </div>

      <BannerSlider />

      <DomainSearchWidget />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard value={active.length} label="Layanan" icon={Server} valueClass="text-brand" onClick={() => navigate("/layanan")} testid="stat-layanan" />
        <StatCard value={domains.length} label="Domain" icon={Globe} valueClass="text-slate-800" onClick={() => navigate("/domain")} testid="stat-domain" />
        <StatCard value={unpaid.length} label="Tagihan" icon={Receipt} valueClass="text-red-500" onClick={() => navigate("/tagihan")} testid="stat-tagihan" />
        <button
          onClick={() => navigate("/checkout")}
          data-testid="stat-order"
          className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-brand bg-brand p-5 text-white transition-transform hover:-translate-y-0.5"
        >
          <ShoppingCart className="h-8 w-8" />
          <span className="text-sm font-bold">Order Layanan</span>
        </button>
      </div>

      <div>
        {unpaid.length > 0 ? (
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center" data-testid="unpaid-alert">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600"><AlertTriangle className="h-5 w-5" /></span>
              <div>
                <p className="font-heading text-sm font-bold text-amber-900">{unpaid.length} Tagihan Belum Dibayar</p>
                <p className="text-sm text-amber-700">Total <span className="font-bold">{idr(unpaidTotal)}</span> menunggu pembayaran.</p>
              </div>
            </div>
            <button onClick={() => navigate("/tagihan")} data-testid="unpaid-pay-button" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600">
              Bayar Sekarang <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5" data-testid="all-paid-card">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-5 w-5" /></span>
            <div>
              <p className="font-heading text-sm font-bold text-emerald-900">Semua tagihan lunas</p>
              <p className="text-sm text-emerald-700">Tidak ada tagihan yang menunggu pembayaran.</p>
            </div>
          </div>
        )}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-slate-800">Produk / Layanan Aktif Anda</h2>
          <button onClick={() => navigate("/layanan")} className="text-sm font-semibold text-brand hover:underline">Lihat semua</button>
        </div>
        {sl ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
        ) : hosting.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <Server className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Belum ada layanan aktif.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            {hosting.map((s) => (
              <ServiceListRow key={s.id} service={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
