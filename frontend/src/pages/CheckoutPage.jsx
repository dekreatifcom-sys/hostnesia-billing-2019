import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { idr } from "@/lib/format";
import { useWallet } from "@/lib/queries";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Server, Check, Globe, Tag, ShieldCheck, Zap, DatabaseBackup, MapPin,
  ArrowLeft, Loader2, Lock, CheckCircle2, Search,
  Wallet, QrCode, Copy, CreditCard, Banknote, Landmark, ChevronDown,
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

const INSTANT_METHODS = [
  { id: "saldo", label: "Saldo HostNesia", note: "Bayar langsung dari dompet Anda", icon: Wallet, kind: "wallet", tag: "Tercepat" },
  { id: "card", label: "Kartu Kredit / Debit", note: "VISA · Mastercard · Amex", icon: CreditCard, kind: "instant" },
  { id: "paypal", label: "PayPal", note: "Bayar dengan akun PayPal", icon: Banknote, kind: "instant" },
];
const DELAYED_METHODS = [
  { id: "bca", label: "BCA Virtual Account", icon: Landmark, kind: "va", va: "8808 1234 5678 9012" },
  { id: "qris", label: "QRIS", note: "Semua e-wallet & m-banking", icon: QrCode, kind: "qris" },
  { id: "bni", label: "BNI Virtual Account", icon: Landmark, kind: "va", va: "8810 5566 7788 9900" },
  { id: "mandiri", label: "Mandiri Virtual Account", icon: Landmark, kind: "va", va: "8950 0812 3456 7890" },
];
const ALL_METHODS = [...INSTANT_METHODS, ...DELAYED_METHODS];

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

function MethodRow({ m, expanded, setExpanded, calc, saldo, copy, onPay }) {
  const open = expanded === m.id;
  const enough = saldo >= calc.total;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200" data-testid={`pay-method-${m.id}`}>
      <button onClick={() => setExpanded(open ? null : m.id)} data-testid={`pay-toggle-${m.id}`}
        className={`flex w-full items-center justify-between gap-3 p-4 text-left transition-colors ${open ? "bg-brand-light" : "hover:bg-slate-50"}`}>
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand shadow-sm"><m.icon className="h-4 w-4" /></span>
          <span>
            <span className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{m.label}</span>
              {m.tag && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{m.tag}</span>}
            </span>
            {m.note && <span className="mt-0.5 block text-xs text-slate-400">{m.note}</span>}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="border-t border-slate-100 p-4">
          {m.kind === "wallet" && (
            <>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Saldo Anda</span>
                <span className="font-heading font-bold text-slate-800">{idr(saldo)}</span>
              </div>
              {!enough && <p className="mt-2 text-xs font-semibold text-red-500">Saldo tidak cukup. Kurang {idr(calc.total - saldo)}. Silakan top-up dulu.</p>}
              <button disabled={!enough} onClick={() => onPay(m.id)} data-testid="pay-saldo"
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50">
                <Lock className="h-4 w-4" /> Bayar dari Saldo · {idr(calc.total)}
              </button>
            </>
          )}
          {m.kind === "instant" && (
            <>
              <p className="text-xs text-slate-500">Pembayaran instan — layanan langsung aktif setelah pembayaran berhasil.</p>
              <button onClick={() => onPay(m.id)} data-testid={`pay-confirm-${m.id}`}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark">
                <Lock className="h-4 w-4" /> Bayar Sekarang · {idr(calc.total)}
              </button>
            </>
          )}
          {m.kind === "va" && (
            <>
              <p className="text-xs text-slate-400">Nomor Virtual Account</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="font-mono text-lg font-extrabold tracking-wide text-slate-800">{m.va}</span>
                <button onClick={() => copy(m.va)} data-testid={`va-copy-${m.id}`} className="inline-flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-white">
                  <Copy className="h-3.5 w-3.5" /> Salin
                </button>
              </div>
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-700">
                <b>Penting:</b> Metode ini diverifikasi dalam waktu hingga 24 jam. Gunakan Saldo, Kartu, atau QRIS untuk konfirmasi instan.
              </div>
              <button onClick={() => onPay(m.id)} data-testid={`pay-confirm-${m.id}`}
                className="mt-3 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark">
                Buat Tagihan Pembayaran
              </button>
            </>
          )}
          {m.kind === "qris" && (
            <>
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                <QrCode className="h-24 w-24 text-slate-800" strokeWidth={1} />
              </div>
              <p className="mt-3 text-center text-xs text-slate-400">Pindai dengan aplikasi e-wallet / m-banking untuk membayar {idr(calc.total)}.</p>
              <button onClick={() => onPay(m.id)} data-testid={`pay-confirm-${m.id}`}
                className="mt-3 w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition-colors hover:bg-brand-dark">
                Buat Tagihan Pembayaran
              </button>
            </>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500"><Lock className="h-3.5 w-3.5" /> Pembayaran Aman dan Terenkripsi</p>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-400">Dengan melanjutkan, Anda menyetujui Ketentuan Penggunaan &amp; Kebijakan Privasi HostNesia.</p>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: wallet } = useWallet();
  const saldo = wallet?.saldo_kredit ?? 0;
  const [stage, setStage] = useState("cart");
  const [cycleId, setCycleId] = useState("2y");
  const [location, setLocation] = useState("jakarta");
  const [addons, setAddons] = useState({ speed: false, backup: true, ssl: false });
  const [domain, setDomain] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(false);
  const [paying, setPaying] = useState(true);
  const [payMethod, setPayMethod] = useState(null);
  const [expanded, setExpanded] = useState("saldo");
  const [paid, setPaid] = useState(false);

  const orderNo = useMemo(() => `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`, []);

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

  const copy = (txt) => { navigator.clipboard?.writeText(txt.replace(/\s/g, "")); toast.success("Nomor disalin"); };
  const onPay = (id) => { setPayMethod(id); setPaid(true); };

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
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
            className="mx-auto max-w-6xl px-4 pb-24 pt-6 md:px-8"
            data-testid="checkout-payment"
          >
            {paying ? (
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand" />
                <h2 className="mt-5 font-heading text-xl font-bold text-slate-800">Menghubungkan Gerbang Pembayaran</h2>
                <p className="mt-1 text-sm text-slate-400">Menyiapkan metode pembayaran aman…</p>
              </div>
            ) : paid ? (
              <div className="mx-auto mt-4 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft" data-testid="payment-success">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9" />
                </motion.div>
                <h2 className="mt-5 font-heading text-2xl font-extrabold text-slate-800">Pembayaran Berhasil</h2>
                <p className="mt-1 text-sm text-slate-400">Layanan Anda sedang diaktifkan. Terima kasih!</p>
                <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-left text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">No. Pesanan</span><span className="font-semibold text-slate-700">{orderNo}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Metode</span><span className="font-semibold text-slate-700">{ALL_METHODS.find((m) => m.id === payMethod)?.label}</span></div>
                  <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-400">Total Dibayar</span><span className="font-heading text-base font-extrabold text-emerald-600">{idr(calc.total)}</span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-400">Status</span><span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700">LUNAS</span></div>
                </div>
                <button onClick={() => navigate("/")} data-testid="success-back-dashboard"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-base font-bold text-white transition-colors hover:bg-brand-dark">
                  Kembali ke Dashboard
                </button>
              </div>
            ) : (
              <div data-testid="payment-gateway">
                <button onClick={() => setStage("cart")} data-testid="payment-back" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand">
                  <ArrowLeft className="h-4 w-4" /> Kembali ke keranjang
                </button>
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-5 md:col-span-2">
                    {/* Billing address */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5" data-testid="billing-address">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                          <div>
                            <p className="font-heading text-base font-bold text-slate-800">Alamat Penagihan</p>
                            <p className="mt-2 text-sm font-semibold text-slate-700">{user?.nama || "HostNesia Indonesia"}</p>
                            <p className="text-sm text-slate-500">{user?.email}</p>
                            <p className="text-sm text-slate-500">Indonesia, Jawa Timur, Kabupaten Probolinggo</p>
                          </div>
                        </div>
                        <button onClick={() => toast.info("Ubah alamat penagihan (simulasi)")} className="text-sm font-semibold text-brand hover:underline">Edit</button>
                      </div>
                    </div>

                    {/* Mobile summary */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 md:hidden" data-testid="mobile-summary">
                      <h3 className="mb-3 font-heading text-base font-bold text-slate-800">Daftar pesanan</h3>
                      <SummaryBody {...summaryProps} />
                      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm font-semibold text-slate-500">Total</span>
                        <span className="font-heading text-xl font-extrabold text-brand">{idr(calc.total)}</span>
                      </div>
                    </div>

                    {/* Payment methods accordion */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-sm font-bold text-white">2</span>
                        <h2 className="font-heading text-base font-bold text-slate-800">Pembayaran</h2>
                      </div>
                      <div className="mt-5 space-y-5">
                        <div>
                          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Pembayaran Instan</p>
                          <div className="space-y-2.5">
                            {INSTANT_METHODS.map((m) => (
                              <MethodRow key={m.id} m={m} expanded={expanded} setExpanded={setExpanded} calc={calc} saldo={saldo} copy={copy} onPay={onPay} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Transfer Bank / QRIS · 1 Hari Kerja</p>
                          <div className="space-y-2.5">
                            {DELAYED_METHODS.map((m) => (
                              <MethodRow key={m.id} m={m} expanded={expanded} setExpanded={setExpanded} calc={calc} saldo={saldo} copy={copy} onPay={onPay} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop summary */}
                  <div className="hidden md:block">
                    <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft" data-testid="order-summary">
                      <h3 className="mb-4 font-heading text-lg font-bold text-slate-800">Daftar pesanan</h3>
                      <SummaryBody {...summaryProps} />
                      <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm font-semibold text-slate-500">Total</span>
                        <span className="font-heading text-2xl font-extrabold text-brand" data-testid="summary-total">{idr(calc.total)}</span>
                      </div>
                      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400"><ShieldCheck className="h-3.5 w-3.5" /> Jaminan 30 hari uang kembali</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
