import { toast } from "sonner";
import { useAffiliate } from "@/lib/queries";
import { idr, dateID } from "@/lib/format";
import { Copy, Users, MousePointerClick, TrendingUp, Wallet, Loader2 } from "lucide-react";

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon className="h-6 w-6 text-brand" />
      <p className="mt-3 font-heading text-2xl font-extrabold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export default function AffiliatePage() {
  const { data, isLoading } = useAffiliate();
  if (isLoading || !data) return <div className="flex h-60 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;
  const s = data.stats;
  const copy = () => { navigator.clipboard?.writeText(data.link); toast.success("Link afiliasi disalin"); };

  return (
    <div className="space-y-6" data-testid="affiliate-page">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-800">Program Afiliasi</h1>
        <p className="text-sm text-slate-400">Ajak teman & dapatkan komisi dari setiap transaksi.</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-brand to-brand-dark p-6 text-white shadow-soft">
        <p className="text-sm text-white/80">Saldo Komisi</p>
        <p className="font-heading text-3xl font-extrabold tracking-tight" data-testid="affiliate-balance">{idr(data.balance)}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 truncate rounded-xl bg-white/15 px-4 py-2.5 font-mono text-sm">{data.link}</div>
          <button onClick={copy} data-testid="affiliate-copy" className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand transition-transform active:scale-95">
            <Copy className="h-4 w-4" /> Salin Link
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={MousePointerClick} label="Klik" value={s.clicks} />
        <Stat icon={Users} label="Pendaftar" value={s.signups} />
        <Stat icon={TrendingUp} label="Konversi" value={`${s.conversion}%`} />
        <Stat icon={Wallet} label="Menunggu" value={idr(s.pending)} />
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-slate-800">Riwayat Referral</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
          {data.referrals.map((r, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-slate-50 p-4 last:border-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-400">{dateID(r.date)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "Konversi" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{r.status}</span>
              <span className="font-bold text-slate-800">{idr(r.commission)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
