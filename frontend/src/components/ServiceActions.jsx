import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { useQuickActions } from "@/context/QuickActionsContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KeyRound, Mail, Lock, ArrowUpDown, ShieldOff, XCircle, Loader2 } from "lucide-react";

export default function ServiceActions({ service }) {
  const { runSso } = useQuickActions();
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState("");

  const m = useMutation({
    mutationFn: (body) => api.post(`/services/${service.id}/action`, body),
    onSuccess: (r) => {
      toast.success(r.data.message);
      setDialog(null);
      setValue("");
    },
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  const actions = [
    { key: "cpanel", label: "Login to cPanel", icon: KeyRound, onClick: () => runSso(`cPanel (${service.domain})`) },
    { key: "webmail", label: "Login to Webmail", icon: Mail, onClick: () => runSso(`Webmail (${service.domain})`) },
    { key: "password", label: "Ganti Password", icon: Lock, onClick: () => { setValue(""); setDialog("password"); } },
    { key: "upgrade", label: "Upgrade / Downgrade", icon: ArrowUpDown, onClick: () => { setValue("Cloud Hosting Business"); setDialog("upgrade"); } },
    { key: "unblock", label: "Unblock IP", icon: ShieldOff, onClick: () => { setValue(""); setDialog("unblock"); } },
    { key: "cancel", label: "Minta Pembatalan", icon: XCircle, danger: true, onClick: () => setDialog("cancel") },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft" data-testid="service-actions">
      <h3 className="mb-4 font-heading text-base font-bold text-slate-800">Tindakan Layanan</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={a.onClick}
            data-testid={`action-${a.key}`}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
              a.danger ? "border-red-100 text-red-600 hover:bg-red-50" : "border-slate-100 text-slate-700 hover:bg-brand-light hover:text-brand"
            }`}
          >
            <a.icon className="h-6 w-6" />
            <span className="text-xs font-semibold">{a.label}</span>
          </button>
        ))}
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          {dialog === "password" && (
            <>
              <DialogHeader><DialogTitle>Ganti Password cPanel</DialogTitle><DialogDescription>Kata sandi baru untuk {service.domain}.</DialogDescription></DialogHeader>
              <div className="space-y-2"><Label>Kata Sandi Baru</Label><Input type="password" data-testid="action-password-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="••••••••" /></div>
              <Button className="mt-2 w-full rounded-xl" disabled={m.isPending} data-testid="action-password-submit" onClick={() => m.mutate({ action: "change_password", value })}>{m.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Simpan</Button>
            </>
          )}
          {dialog === "upgrade" && (
            <>
              <DialogHeader><DialogTitle>Upgrade / Downgrade</DialogTitle><DialogDescription>Pilih paket tujuan untuk {service.domain}.</DialogDescription></DialogHeader>
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger data-testid="action-upgrade-select"><SelectValue /></SelectTrigger>
                <SelectContent>{["Cloud Hosting Startup", "Cloud Hosting Business", "VPS KVM 2GB", "Managed WordPress"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
              <Button className="mt-3 w-full rounded-xl" disabled={m.isPending} data-testid="action-upgrade-submit" onClick={() => m.mutate({ action: "upgrade", value })}>Kirim Permintaan</Button>
            </>
          )}
          {dialog === "unblock" && (
            <>
              <DialogHeader><DialogTitle>Unblock IP</DialogTitle><DialogDescription>Masukkan alamat IP yang ingin di-unblock.</DialogDescription></DialogHeader>
              <div className="space-y-2"><Label>Alamat IP</Label><Input data-testid="action-unblock-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="103.xxx.xxx.xxx" /></div>
              <Button className="mt-2 w-full rounded-xl" disabled={m.isPending} data-testid="action-unblock-submit" onClick={() => m.mutate({ action: "unblock_ip", value })}>Unblock</Button>
            </>
          )}
          {dialog === "cancel" && (
            <>
              <DialogHeader><DialogTitle>Minta Pembatalan</DialogTitle><DialogDescription>Yakin ingin mengajukan pembatalan {service.domain}? Akan diproses tim kami.</DialogDescription></DialogHeader>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDialog(null)}>Batal</Button>
                <Button className="flex-1 rounded-xl bg-red-500 hover:bg-red-600" data-testid="action-cancel-submit" onClick={() => m.mutate({ action: "cancel" })}>Ya, Ajukan</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
