import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvoices, useWallet } from "@/lib/queries";
import { api, apiError } from "@/lib/api";
import { idr, dateID } from "@/lib/format";
import WalletCard from "@/components/WalletCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowDownLeft, ArrowUpRight, Receipt, CheckCircle2, Download } from "lucide-react";

function InvoiceRow({ invoice }) {
  const qc = useQueryClient();
  const paid = invoice.status === "Paid";

  const downloadPdf = async () => {
    try {
      const res = await api.get(`/invoices/${invoice.id}/pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${paid ? "struk" : "invoice"}-${invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(apiError(e.response?.data?.detail || "Gagal mengunduh PDF"));
    }
  };

  const m = useMutation({
    mutationFn: () => api.post(`/invoices/${invoice.id}/pay`),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["wallet"] });
      toast.success(r.data.message);
    },
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      data-testid={`invoice-row-${invoice.id}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-heading text-sm font-bold text-slate-800">{invoice.id}</p>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              paid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {paid ? "Lunas" : "Belum Dibayar"}
          </span>
        </div>
        <p className="truncate text-xs text-slate-400">{invoice.deskripsi}</p>
        <p className="mt-0.5 text-xs text-slate-400">Jatuh tempo: {dateID(invoice.tanggal_jatuh_tempo)}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <p className="font-bold text-slate-800">{idr(invoice.jumlah_tagihan)}</p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={downloadPdf}
            data-testid={`invoice-pdf-${invoice.id}`}
            title={paid ? "Unduh Struk" : "Unduh Invoice"}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> {paid ? "Struk" : "Invoice"}
          </button>
          {paid ? (
            <span className="flex items-center gap-1 text-xs text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" /> Terbayar
            </span>
          ) : (
            <button
              onClick={() => m.mutate()}
              disabled={m.isPending}
              data-testid={`invoice-pay-${invoice.id}`}
              className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {m.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
              Bayar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TxnRow({ txn }) {
  const isCredit = txn.amount > 0;
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
          isCredit ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
        }`}
      >
        {isCredit ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{txn.deskripsi}</p>
        <p className="text-xs text-slate-400">{dateID(txn.created_at)}</p>
      </div>
      <p className={`font-bold ${isCredit ? "text-emerald-600" : "text-slate-700"}`}>
        {isCredit ? "+" : "-"}
        {idr(Math.abs(txn.amount))}
      </p>
    </div>
  );
}

export default function BillingPage() {
  const { data: invoices = [], isLoading: il } = useInvoices();
  const { data: wallet, isLoading: wl } = useWallet();

  return (
    <div className="space-y-6" data-testid="billing-page">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-slate-800">Tagihan & Dompet</h1>
        <p className="text-sm text-slate-400">Bayar tagihan dan pantau saldo kredit Anda.</p>
      </div>

      {!wl && <WalletCard saldo={wallet?.saldo_kredit} />}

      <Tabs defaultValue="invoices">
        <TabsList className="grid w-full grid-cols-2 rounded-xl md:w-72">
          <TabsTrigger value="invoices" data-testid="tab-invoices" className="rounded-lg">
            Tagihan
          </TabsTrigger>
          <TabsTrigger value="txns" data-testid="tab-transactions" className="rounded-lg">
            Riwayat Transaksi
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4 space-y-3">
          {il ? (
            <div className="flex h-24 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              <Receipt className="mx-auto mb-2 h-7 w-7 text-slate-300" />
              Belum ada tagihan.
            </div>
          ) : (
            invoices.map((inv) => <InvoiceRow key={inv.id} invoice={inv} />)
          )}
        </TabsContent>

        <TabsContent value="txns" className="mt-4 space-y-3">
          {(wallet?.transactions || []).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              Belum ada transaksi.
            </div>
          ) : (
            wallet.transactions.map((t) => <TxnRow key={t.id} txn={t} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
