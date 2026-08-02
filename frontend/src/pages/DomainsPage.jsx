import { useNavigate } from "react-router-dom";
import { useDomains } from "@/lib/queries";
import { dateID } from "@/lib/format";
import { Globe, Loader2, ChevronRight } from "lucide-react";

export default function DomainsPage() {
  const navigate = useNavigate();
  const { data: domains = [], isLoading } = useDomains();

  return (
    <div className="space-y-6" data-testid="domains-page">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-800">Domain</h1>
        <p className="text-sm text-slate-400">Kelola domain yang Anda miliki.</p>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-lg font-bold text-slate-800">Domain Saya</h2>
        {isLoading ? (
          <div className="flex h-24 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
        ) : domains.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            <Globe className="mx-auto mb-2 h-8 w-8 text-slate-300" />Belum ada domain.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
            {domains.map((d) => (
              <button key={d.id} onClick={() => navigate(`/domain/${d.id}`)} data-testid={`domain-row-${d.id}`} className="flex w-full items-center gap-3 border-b border-slate-50 p-4 text-left last:border-0 hover:bg-slate-50">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand"><Globe className="h-5 w-5" /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-bold text-slate-800">{d.domain}</p>
                  <p className="text-xs text-slate-400">Kedaluwarsa: {dateID(d.expiry_date)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${d.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{d.status === "Active" ? "Aktif" : "Kedaluwarsa"}</span>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
