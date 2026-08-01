import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, ArrowUpRight } from "lucide-react";
import { api, apiError } from "@/lib/api";
import { idr } from "@/lib/format";
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

export default function TopupDialog({ children }) {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
  );
}
