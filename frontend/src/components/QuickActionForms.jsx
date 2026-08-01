import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { useQuickActions } from "@/context/QuickActionsContext";
import { useProducts, useServices } from "@/lib/queries";
import { idr } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const TITLES = {
  order: { title: "Order Layanan Baru", desc: "Pilih paket hosting dan tentukan domain Anda." },
  dns: { title: "Kelola DNS", desc: "Tambahkan record DNS untuk domain Anda." },
  email: { title: "Buat Akun Email", desc: "Buat alamat email profesional di domain Anda." },
};

function OrderForm({ onDone }) {
  const { data: products = [] } = useProducts();
  const qc = useQueryClient();
  const [productId, setProductId] = useState("");
  const [domain, setDomain] = useState("");
  const [cycle, setCycle] = useState("Bulanan");

  const m = useMutation({
    mutationFn: () => api.post("/services/order", { product_id: productId, domain, cycle }),
    onSuccess: (r) => {
      qc.invalidateQueries({ queryKey: ["services"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(r.data.message + `. Tagihan ${r.data.invoice_id} dibuat.`);
      onDone();
    },
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!productId) return toast.error("Pilih paket terlebih dahulu");
        m.mutate();
      }}
    >
      <div className="space-y-1.5">
        <Label>Paket Hosting</Label>
        <Select value={productId} onValueChange={setProductId}>
          <SelectTrigger data-testid="order-product-select">
            <SelectValue placeholder="Pilih paket" />
          </SelectTrigger>
          <SelectContent>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.nama_produk} — {idr(p.harga)}/bln
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Domain</Label>
        <Input
          data-testid="order-domain-input"
          placeholder="contoh: websitesaya.id"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Siklus Penagihan</Label>
        <Select value={cycle} onValueChange={setCycle}>
          <SelectTrigger data-testid="order-cycle-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bulanan">Bulanan</SelectItem>
            <SelectItem value="Tahunan">Tahunan</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={m.isPending} data-testid="order-submit" className="w-full rounded-xl">
        {m.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Pesan Sekarang
      </Button>
    </form>
  );
}

function DnsForm({ onDone }) {
  const { data: services = [] } = useServices();
  const [serviceId, setServiceId] = useState("");
  const [type, setType] = useState("A");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  const m = useMutation({
    mutationFn: () => api.post(`/services/${serviceId}/dns`, { type, name, value }),
    onSuccess: (r) => {
      toast.success(r.data.message);
      onDone();
    },
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!serviceId) return toast.error("Pilih layanan terlebih dahulu");
        m.mutate();
      }}
    >
      <div className="space-y-1.5">
        <Label>Layanan / Domain</Label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger data-testid="dns-service-select">
            <SelectValue placeholder="Pilih layanan" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Tipe</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger data-testid="dns-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["A", "AAAA", "CNAME", "MX", "TXT"].map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Nama / Host</Label>
          <Input
            data-testid="dns-name-input"
            placeholder="@ atau www"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Value</Label>
        <Input
          data-testid="dns-value-input"
          placeholder="103.171.44.12"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={m.isPending} data-testid="dns-submit" className="w-full rounded-xl">
        {m.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Simpan Record
      </Button>
    </form>
  );
}

function EmailForm({ onDone }) {
  const { data: services = [] } = useServices();
  const [serviceId, setServiceId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const domain = services.find((s) => s.id === serviceId)?.domain || "domain";

  const m = useMutation({
    mutationFn: () => api.post(`/services/${serviceId}/email`, { username, password }),
    onSuccess: (r) => {
      toast.success(r.data.message);
      onDone();
    },
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!serviceId) return toast.error("Pilih layanan terlebih dahulu");
        m.mutate();
      }}
    >
      <div className="space-y-1.5">
        <Label>Layanan / Domain</Label>
        <Select value={serviceId} onValueChange={setServiceId}>
          <SelectTrigger data-testid="email-service-select">
            <SelectValue placeholder="Pilih layanan" />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Alamat Email</Label>
        <div className="flex items-center overflow-hidden rounded-xl border border-input">
          <Input
            data-testid="email-username-input"
            className="border-0 focus-visible:ring-0"
            placeholder="admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <span className="whitespace-nowrap bg-slate-50 px-3 text-sm text-slate-500">@{domain}</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Kata Sandi</Label>
        <Input
          data-testid="email-password-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={m.isPending} data-testid="email-submit" className="w-full rounded-xl">
        {m.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Buat Akun Email
      </Button>
    </form>
  );
}

export default function QuickActionForms() {
  const { activeForm, closeForm } = useQuickActions();
  const meta = activeForm ? TITLES[activeForm] : null;

  return (
    <Dialog open={!!activeForm} onOpenChange={(o) => !o && closeForm()}>
      <DialogContent className="rounded-2xl sm:max-w-md" data-testid="quick-action-dialog">
        {meta && (
          <DialogHeader>
            <DialogTitle className="font-heading">{meta.title}</DialogTitle>
            <DialogDescription>{meta.desc}</DialogDescription>
          </DialogHeader>
        )}
        {activeForm === "order" && <OrderForm onDone={closeForm} />}
        {activeForm === "dns" && <DnsForm onDone={closeForm} />}
        {activeForm === "email" && <EmailForm onDone={closeForm} />}
      </DialogContent>
    </Dialog>
  );
}
