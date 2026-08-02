import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { idr } from "@/lib/format";
import { Input } from "@/components/ui/input";
import {
  Server, Check, Globe, Tag, ShieldCheck, Zap, DatabaseBackup, MapPin,
  ArrowLeft, ChevronDown, Loader2, CreditCard, Lock, CheckCircle2, Search,
} from "lucide-react";

const CYCLES = [
  { id: "1m", label: "1 Bulan", months: 1, perMo: 99900, list: 109900, discount: 0 },
  { id: "1y", label: "1 Tahun", months: 12, perMo: 39900, list: 109900, discount: 64 },
  { id: "2y", label: "2 Tahun", months: 24, perMo: 24900, list: 109900, discount: 77 },
];
const ADDONS = [
  { id: "speed", label: "Peningkat Kecepatan", desc: "LiteSpeed + cache turbo", perMo: 15000, icon: Zap },
  { id: "backup", label: "Pencadangan Harian", desc: "Backup otomatis setiap hari", perMo: 10000, icon: DatabaseBackup },
  { id: "ssl", label: "SSL Positif", desc: "Sertifikat SSL premium", perMo: 20000, icon: ShieldCheck },
];
const LOCATIONS = [
  { id: "jakarta", label: "Jakarta", flag: "🇮🇩", note: "Latensi terendah di Indonesia" },
  { id: "singapura", label: "Singapura", flag: "🇸🇬", note: "Jangkauan Asia Tenggara" },
];
const DOMAIN_PRICE = 199900;
const COUPON_CODE = "HOSTNESIA10";

function SummaryBody({ calc, cycle, domain, freeDomain, addons, showCoupon, setShowCoupon, coupon, setCoupon, applied, applyCoupon }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2.5 text-sm">
        <div className="flex items-start justify-between gap-2">
          <span className="text-slate-500">Paket Premium<br /><span className="text-xs text-slate-400">Durasi {cycle.months} bulan</span></span>
          <span className="text-right">
            {cycle.discount > 0 && <span className="mr-1.5 text-xs text-slate-400 line-through">{idr(cycle.list * cycle.months)}</span>}
            <span className="font-bold text-slate-800">{idr(calc.base)}</span>
          </span>
        </div>
        {domain && (
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Domain ({domain})</span>
            <span className="text-right">
              {freeDomain && <span className="mr-1.5 text-xs text-slate-400 line-through">{idr(DOMAIN_PRICE)}</span>}
              <span className="font-bold text-slate-800">{freeDomain ? "Rp0" : idr(DOMAIN_PRICE)}</span>
            </span>
          </div>
        )}
        {ADDONS.filter((a) => addons[a.id]).map((a) => (
          <div key={a.id} className="flex items-center justify-between">
            <span className="text-slate-500">{a.label}</span>
            <span className="font-bold text-slate-800">{idr(a.perMo * cycle.months)}</span>
          </div>
        ))}
        {applied && (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Kupon {COUPON_CODE}</span>
            <span className="font-bold">- {idr(calc.couponDiscount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-500">Pajak (PPN 11%)</span>
          <span className="font-bold text-slate-800">{idr(calc.tax)}</span>
        </div>
      </div>

      <div>
        <button onClick={() => setShowCoupon((v) => !v)} data-testid="coupon-toggle" className="flex items-center gap-1.5 text-sm font-semibold text-brand">
          <Tag className="h-4 w-4" /> Punya Kode Kupon?
        </button>
        {showCoupon && (
          <div className="mt-2 flex gap-2">
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={COUPON_CODE} data-testid="coupon-input" className="h-10" />
            <button onClick={applyCoupon} data-testid="coupon-apply" className="rounded-xl bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-900">Pakai</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState("cart");
  const [cycleId, setCycleId] = useState("2y");
  const [location, setLocation] = useState("jakarta");
  const [addons, setAddons] = useState({ speed: false, backup: true, ssl: false });
  const [domain, setDomain] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [paying, setPaying] = useState(true);

  const cycle = CYCLES.find((c) => c.id === cycleId);
  const freeDomain = cycle.months >= 12 && !!domain;

  const calc = useMemo(() => {
    const base = cycle.perMo * cycle.months;
    const addonsTotal = ADDONS.reduce((s, a) => s + (addons[a.id] ? a.perMo * cycle.months : 0), 0);
    const domainCost = domain ? (freeDomain ? 0 : DOMAIN_PRICE) : 0;
    const subtotal = base + addonsTotal + domainCost;
    const couponDiscount = applied ? Math.round(subtotal * 0.1) : 0;
    const taxable = subtotal - couponDiscount;
    const tax = Math.round(taxable * 0.11);
    return { base, addonsTotal, domainCost, subtotal, couponDiscount, tax, total: taxable + tax };
  }, [cycle, addons, domain, freeDomain, applied]);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === COUPON_CODE) { setApplied(true); toast.success("Kupon diterapkan — hemat 10%!"); }
    else toast.error("Kode kupon tidak valid");
  };

  useEffect(() => {
    if (stage === "payment") {
      setPaying(true);
      const t = setTimeout(() => setPaying(false), 1900);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const summaryProps = { calc, cycle, domain, freeDomain, addons, showCoupon, setShowCoupon, coupon, setCoupon, applied, applyCoupon };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3.5 md:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white"><Zap className="h-5 w-5" fill="currentColor" /></div>
          <span className="font-heading text-lg font-extrabold text-slate-800">HostNesia</span>
        </div>
        <button onClick={() => navigate("/")} data-testid="checkout-back" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
      </header>

      <AnimatePresence mode="wait">
        {stage === "cart" ? (
          <motion.main
            key="cart"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
            className="mx-auto max-w-6xl px-4 pb-32 pt-6 md:px-8 md:pb-10"
            data-testid="checkout-cart"
          >
            <h1 className="mb-5 font-heading text-2xl font-extrabold text-slate-800">Keranjang Anda</h1>
            <div className="grid gap-5 md:grid-cols-3">
              {/* LEFT */}
              <div className="space-y-5 md:col-span-2">
                {/* Package header */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand"><Server className="h-5 w-5" /></span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-base font-bold text-slate-800">Nimbus Go — NVMe 15 GB</h2>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500" data-testid="product-id-badge">#PRD-1042</span>
                      </div>
                      <p className="text-xs text-slate-400">Paket Premium Cloud Hosting</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
                    <p className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Domain <b>GRATIS</b> selama 1 tahun {cycle.months >= 12 ? "(aktif untuk paket ini)" : "(pilih durasi 1 tahun)"}</p>
                    <p className="flex items-center gap-2 text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> 2 mailbox <b>GRATIS</b>, masing-masing 1 GB</p>
                  </div>
                </div>

                {/* Billing cycle */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 font-heading text-sm font-bold text-slate-800">Siklus Tagihan</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {CYCLES.map((c) => {
                      const on = c.id === cycleId;
                      return (
                        <button key={c.id} onClick={() => setCycleId(c.id)} data-testid={`cycle-${c.id}`}
                          className={`relative rounded-xl border-2 p-3 text-left transition-all ${on ? "border-brand bg-brand-light" : "border-slate-200 hover:border-slate-300"}`}>
                          {c.discount > 0 && <span className="absolute -top-2 right-2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">-{c.discount}%</span>}
                          <p className={`text-sm font-bold ${on ? "text-brand" : "text-slate-800"}`}>{c.label}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-700">{idr(c.perMo)}<span className="text-slate-400">/bln</span></p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Server location */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 font-heading text-sm font-bold text-slate-800">Lokasi Peladen</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {LOCATIONS.map((l) => {
                      const on = l.id === location;
                      return (
                        <button key={l.id} onClick={() => setLocation(l.id)} data-testid={`location-${l.id}`}
                          className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${on ? "border-brand bg-brand-light" : "border-slate-200 hover:border-slate-300"}`}>
                          <span className="text-2xl">{l.flag}</span>
                          <div>
                            <p className={`text-sm font-bold ${on ? "text-brand" : "text-slate-800"}`}>{l.label}</p>
                            <p className="text-[11px] text-slate-400">{l.note}</p>
                          </div>
                          {on && <MapPin className="ml-auto h-4 w-4 text-brand" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Addons */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="mb-3 font-heading text-sm font-bold text-slate-800">Tambahan Layanan</h3>
                  <div className="space-y-2.5">
                    {ADDONS.map((a) => {
                      const on = addons[a.id];
                      return (
                        <button key={a.id} onClick={() => setAddons((p) => ({ ...p, [a.id]: !p[a.id] }))} data-testid={`addon-${a.id}`}
                          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${on ? "border-brand bg-brand-light" : "border-slate-200 hover:bg-slate-50"}`}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${on ? "border-brand bg-brand text-white" : "border-slate-300"}`}>{on && <Check className="h-3.5 w-3.5" />}</span>
                          <a.icon className="h-5 w-5 text-brand" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800">{a.label}</p>
                            <p className="text-xs text-slate-400">{a.desc}</p>
                          </div>
                          <span className="text-sm font-bold text-slate-700">{idr(a.perMo)}<span className="text-xs text-slate-400">/bln</span></span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Domain */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="mb-1 flex items-center gap-2"><Globe className="h-5 w-5 text-brand" /><h3 className="font-heading text-sm font-bold text-slate-800">Nama Domain</h3></div>
                  <p className="mb-3 text-xs text-slate-400">Cari atau daftarkan domain. <span className="font-semibold text-emerald-600">Gratis 1 tahun untuk paket 1 tahun ke atas.</span></p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="cari nama domain..." data-testid="checkout-domain-input" className="pl-9" />
                  </div>
                  {domain && freeDomain && <p className="mt-2 text-xs font-semibold text-emerald-600">✓ {domain} akan GRATIS untuk tahun pertama.</p>}
                </div>

                {/* Mobile summary breakdown */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 md:hidden" data-testid="mobile-summary">
                  <h3 className="mb-3 font-heading text-base font-bold text-slate-800">Ringkasan Pesanan</h3>
                  <SummaryBody {...summaryProps} />
                </div>
              </div>

              {/* RIGHT sticky (desktop) */}
              <div className="hidden md:block">
                <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft" data-testid="order-summary">
                  <h3 className="mb-4 font-heading text-lg font-bold text-slate-800">Ringkasan Pesanan</h3>
                  <SummaryBody {...summaryProps} />
                  <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm font-semibold text-slate-500">Total</span>
                    <span className="font-heading text-2xl font-extrabold text-brand" data-testid="summary-total">{idr(calc.total)}</span>
                  </div>
                  <button onClick={() => setStage("payment")} data-testid="checkout-continue" className="mt-4 w-full rounded-xl bg-brand py-4 text-base font-bold text-white shadow-card transition-colors hover:bg-brand-dark">
                    Lanjutkan
                  </button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> Jaminan 30 hari uang kembali</p>
                </div>
              </div>
            </div>
          </motion.main>
        ) : (
          <motion.main
            key="payment"
            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="mx-auto flex max-w-md flex-col items-center px-4 py-16"
            data-testid="checkout-payment"
          >
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
              {paying ? (
                <>
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand" />
                  <h2 className="mt-5 font-heading text-xl font-bold text-slate-800">Menghubungkan Gerbang Pembayaran</h2>
                  <p className="mt-1 text-sm text-slate-400">Mengarahkan Anda ke pembayaran aman…</p>
                </>
              ) : (
                <>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand"><CreditCard className="h-7 w-7" /></div>
                  <h2 className="mt-4 font-heading text-xl font-bold text-slate-800">Gerbang Pembayaran</h2>
                  <p className="mt-1 text-sm text-slate-400">Selesaikan pembayaran untuk mengaktifkan layanan.</p>
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Total Pembayaran</p>
                    <p className="font-heading text-3xl font-extrabold text-brand">{idr(calc.total)}</p>
                  </div>
                  <button onClick={() => { toast.success("Pembayaran berhasil! Layanan Anda sedang diaktifkan."); navigate("/"); }} data-testid="pay-now"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-bold text-white transition-colors hover:bg-brand-dark">
                    <Lock className="h-4 w-4" /> Bayar Sekarang
                  </button>
                  <button onClick={() => setStage("cart")} data-testid="payment-back" className="mt-3 text-sm font-semibold text-slate-500 hover:text-brand">
                    Kembali ke keranjang
                  </button>
                </>
              )}
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Mobile fixed bottom bar */}
      {stage === "cart" && (
        <div className="fixed bottom-0 left-0 z-50 w-full border-t bg-white p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden" data-testid="mobile-checkout-bar">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-slate-400">Total</p>
              <p className="font-heading text-xl font-extrabold text-brand">{idr(calc.total)}</p>
            </div>
            <button onClick={() => setStage("payment")} data-testid="checkout-continue-mobile" className="flex-1 rounded-xl bg-brand py-3.5 text-base font-bold text-white">
              Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
