import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { useTlds } from "@/lib/queries";
import { idr } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle2, XCircle, Loader2, ShoppingCart } from "lucide-react";

export default function DomainSearchWidget() {
  const { data: tlds = [] } = useTlds();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);

  const check = useMutation({
    mutationFn: () => api.post("/domains/check", { query: q }),
    onSuccess: (r) => setResults(r.data.results),
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  const popular = tlds.filter((t) => t.popular);

  return (
    <div className="space-y-3" data-testid="domain-search-widget">
      <div className="rounded-2xl bg-gradient-to-r from-brand to-brand-dark p-6 text-white shadow-soft">
        <h2 className="font-heading text-lg font-bold sm:text-xl">Cek Domain & Beli Harga Murah</h2>
        <p className="mt-1 text-sm text-white/80">Cek ketersediaan nama domain untuk identitas digital Anda.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) check.mutate(); }} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input data-testid="domain-search-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ketik nama domain..." className="border-0 bg-white pl-9 text-slate-800" />
          </div>
          <Button type="submit" data-testid="domain-search-button" disabled={check.isPending} className="rounded-xl bg-white text-brand hover:bg-white/90">
            {check.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cari"}
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {popular.map((t) => (
            <span key={t.tld} className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">
              <b>{t.tld}</b><span className="text-white/70">{idr(t.price)}/thn</span>
            </span>
          ))}
        </div>
      </div>

      {results && (
        <div className="space-y-2" data-testid="domain-results">
          <p className="text-sm font-semibold text-slate-600">Hasil pencarian</p>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {results.map((r) => (
              <div key={r.domain} className="flex items-center gap-3 border-b border-slate-50 p-4 last:border-0">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${r.available ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  {r.available ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">{r.domain}</p>
                  <p className="text-xs text-slate-400">{r.available ? "Tersedia" : "Sudah terdaftar"}</p>
                </div>
                <span className="text-sm font-bold text-slate-800">{idr(r.price)}</span>
                {r.available && (
                  <button onClick={() => toast.success(`${r.domain} ditambahkan ke keranjang (simulasi)`)} className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
                    <ShoppingCart className="h-3.5 w-3.5" /> Beli
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
