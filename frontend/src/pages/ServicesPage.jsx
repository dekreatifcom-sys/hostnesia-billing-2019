import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useServices } from "@/lib/queries";
import ServiceListRow from "@/components/ServiceListRow";
import StatusBadge from "@/components/StatusBadge";
import { Loader2, Plus, Server, Briefcase } from "lucide-react";

const TABS = [
  { to: "/layanan", label: "Layanan Saya" },
  { to: "/layanan/jasa", label: "Layanan Jasa" },
];

function JasaRow({ s }) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center" data-testid={`jasa-row-${s.id}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand"><Briefcase className="h-5 w-5" /></span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold text-slate-800">{s.nama_produk}</p>
          <p className="truncate text-xs text-slate-400">{s.deskripsi || s.domain}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <StatusBadge status={s.status} />
        <button onClick={() => toast.success("Tim kami akan segera menghubungi Anda")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          Hubungi Tim
        </button>
      </div>
    </div>
  );
}

export default function ServicesPage({ category = "hosting" }) {
  const { data: all = [], isLoading } = useServices();
  const location = useLocation();
  const list = all.filter((s) => (s.category || "hosting") === category);

  return (
    <div className="space-y-6" data-testid="services-page">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-800">Layanan</h1>
          <p className="text-sm text-slate-400">Kelola paket hosting, VPS & jasa Anda.</p>
        </div>
        <a
          href="https://hostnesia.id/layanan"
          data-testid="services-order-button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-dark"
        >
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Order Layanan Baru</span>
        </a>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => {
          const active = location.pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              data-testid={`services-tab-${t.to === "/layanan" ? "saya" : "jasa"}`}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${active ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Server className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Belum ada layanan pada kategori ini.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          {list.map((s) => (category === "jasa" ? <JasaRow key={s.id} s={s} /> : <ServiceListRow key={s.id} service={s} />))}
        </div>
      )}
    </div>
  );
}
