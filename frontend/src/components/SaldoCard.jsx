import { Wallet, Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { idr } from "@/lib/format";
import TopupDialog from "@/components/TopupDialog";

export default function SaldoCard({ saldo, className = "" }) {
  const navigate = useNavigate();
  return (
    <div
      className={`flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${className}`}
      data-testid="saldo-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Wallet className="h-4 w-4 text-brand" /> Saldo Dompet
        </div>
        <TopupDialog>
          <button
            data-testid="saldo-topup-button"
            aria-label="Top-up saldo"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-card transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
        </TopupDialog>
      </div>
      <p
        className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-800"
        data-testid="saldo-balance"
      >
        {idr(saldo)}
      </p>
      <button
        onClick={() => navigate("/tagihan")}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
      >
        Lihat riwayat transaksi <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
