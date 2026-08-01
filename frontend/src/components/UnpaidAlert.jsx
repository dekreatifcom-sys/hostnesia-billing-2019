import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { idr } from "@/lib/format";

export default function UnpaidAlert({ invoices }) {
  const navigate = useNavigate();
  const unpaid = invoices.filter((i) => i.status === "Unpaid");
  if (unpaid.length === 0) return null;
  const total = unpaid.reduce((s, i) => s + i.jumlah_tagihan, 0);

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between"
      data-testid="unpaid-alert"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <div>
          <p className="font-heading text-sm font-bold text-amber-900">
            {unpaid.length} Tagihan Belum Dibayar
          </p>
          <p className="text-sm text-amber-700">
            Total <span className="font-bold">{idr(total)}</span> menunggu pembayaran.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/tagihan")}
        data-testid="unpaid-pay-button"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600"
      >
        Bayar Sekarang <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
