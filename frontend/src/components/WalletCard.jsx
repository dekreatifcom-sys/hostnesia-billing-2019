import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Wallet, Plus, Loader2, ArrowUpRight } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { idr } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PRESETS = [50000, 100000, 250000, 500000];

export default function WalletCard({ saldo }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(100000);

  const m = useMutation({
    mutationFn: () => api.post("/wallet/topup", { amount }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      toast.success(r.data.message);
      setOpen(false);
    },
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-brand p-6 text-white shadow-card md:p-7"
      data-testid="wallet-card"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-14 -right-2 h-40 w-40 rounded-full bg-white/5" />
      <div className="relative">
        <div className="flex items-center gap-2 text-sm text-white/80">
          <Wallet className="h-4 w-4" />
          Saldo Dompet
        </div>
        <p className="mt-3 font-heading text-4xl font-extrabold tracking-tight" data-testid="wallet-balance">
          {idr(saldo)}
        </p>
        <p className="mt-1 text-sm text-white/70">Hai, {user?.nama?.split(" ")[0]} — kelola kredit Anda di sini.</p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              data-testid="topup-open-button"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" /> Top-up Saldo
            </button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">Top-up Saldo</DialogTitle>
              <DialogDescription>Pilih nominal top-up untuk menambah kredit Anda.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              {PRESETS.map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  data-testid={`topup-amount-${v}`}
                  className={`rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                    amount === v
                      ? "border-brand bg-brand-light text-brand"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {idr(v)}
                </button>
              ))}
            </div>
            <Button
              onClick={() => m.mutate()}
              disabled={m.isPending}
              data-testid="topup-confirm-button"
              className="mt-2 w-full rounded-xl"
            >
              {m.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpRight className="mr-2 h-4 w-4" />}
              Top-up {idr(amount)}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
