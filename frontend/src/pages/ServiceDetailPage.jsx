import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, apiError } from "@/lib/api";
import { useService } from "@/lib/queries";
import { useQuickActions } from "@/context/QuickActionsContext";
import StatusBadge from "@/components/StatusBadge";
import ServiceActions from "@/components/ServiceActions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dateID, dueInfo } from "@/lib/format";
import {
  ArrowLeft, Globe, Server, Plus, ShieldCheck, ShieldAlert, DatabaseBackup,
  Loader2, ExternalLink, KeyRound, Mail,
} from "lucide-react";

function Info({ label, value, valueClass = "" }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-semibold text-slate-800 ${valueClass}`}>{value}</p>
    </div>
  );
}
function Empty({ text }) {
  return <div className="p-8 text-center text-sm text-slate-400">{text}</div>;
}

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { openForm, runSso } = useQuickActions();
  const { data: svc, isLoading } = useService(id);

  const backupM = useMutation({
    mutationFn: () => api.post(`/services/${id}/backup`),
    onSuccess: (r) => toast.success(r.data.message),
    onError: (e) => toast.error(apiError(e.response?.data?.detail)),
  });

  if (isLoading || !svc) {
    return (
      <div className="flex h-60 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  const due = dueInfo(svc.tanggal_jatuh_tempo_selanjutnya);
  const disk = svc.persentase_penggunaan_disk;
  const sslOk = svc.ssl?.status === "Active";

  return (
    <div className="space-y-6" data-testid="service-detail-page">
      <button
        onClick={() => navigate(-1)}
        data-testid="detail-back"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand">
              <Globe className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-heading text-xl font-extrabold text-slate-800">{svc.domain}</h1>
              <p className="text-sm text-slate-400">{svc.nama_produk}</p>
            </div>
          </div>
          <StatusBadge status={svc.status} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Info label="IP Address" value={svc.ip} />
          <Info label="Nameserver" value={svc.nameserver} />
          <Info label="Jatuh Tempo" value={dateID(svc.tanggal_jatuh_tempo_selanjutnya)} valueClass={due.expired ? "text-red-500" : ""} />
          <div>
            <p className="text-xs text-slate-400">Disk</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${disk >= 85 ? "bg-red-500" : "bg-brand"}`} style={{ width: `${disk}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-700">{disk}%</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={() => runSso(`File Manager (${svc.domain})`)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark">
            <ExternalLink className="h-3.5 w-3.5" /> File Manager
          </button>
          <button onClick={() => runSso(`phpMyAdmin (${svc.domain})`)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <Server className="h-3.5 w-3.5" /> phpMyAdmin
          </button>
          <button onClick={() => runSso(`cPanel (${svc.domain})`)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <KeyRound className="h-3.5 w-3.5" /> Login cPanel
          </button>
        </div>
      </div>

      <ServiceActions service={svc} />

      <Tabs defaultValue="dns">
        <TabsList className="grid w-full grid-cols-4 rounded-xl md:w-96">
          <TabsTrigger value="dns" className="rounded-lg" data-testid="detail-tab-dns">DNS</TabsTrigger>
          <TabsTrigger value="email" className="rounded-lg" data-testid="detail-tab-email">Email</TabsTrigger>
          <TabsTrigger value="ssl" className="rounded-lg" data-testid="detail-tab-ssl">SSL</TabsTrigger>
          <TabsTrigger value="backup" className="rounded-lg" data-testid="detail-tab-backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="dns" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">{svc.dns_records.length} record DNS</p>
            <button onClick={() => openForm("dns", { serviceId: svc.id })} data-testid="detail-add-dns" className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark">
              <Plus className="h-3.5 w-3.5" /> Tambah Record
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {svc.dns_records.length === 0 ? <Empty text="Belum ada record DNS." /> : svc.dns_records.map((r) => (
              <div key={r.id} className="flex items-center gap-3 border-b border-slate-50 p-4 last:border-0">
                <span className="w-16 shrink-0 rounded-lg bg-brand-light px-2 py-1 text-center text-xs font-bold text-brand">{r.type}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                  <p className="truncate text-xs text-slate-400">{r.value}</p>
                </div>
                <span className="hidden text-xs text-slate-400 sm:block">TTL {r.ttl}</span>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">{svc.email_accounts.length} akun email</p>
            <button onClick={() => openForm("email", { serviceId: svc.id })} data-testid="detail-add-email" className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark">
              <Plus className="h-3.5 w-3.5" /> Buat Email
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {svc.email_accounts.length === 0 ? <Empty text="Belum ada akun email." /> : svc.email_accounts.map((e) => {
              const pct = Math.min(100, Math.round(((e.used || 0) / (e.quota || 1)) * 100));
              return (
                <div key={e.id} className="flex items-center gap-3 border-b border-slate-50 p-4 last:border-0">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand"><Mail className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{e.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} /></div>
                      <span className="text-xs text-slate-400">{e.used || 0}/{e.quota} MB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ssl" className="mt-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${sslOk ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                {sslOk ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
              </span>
              <div>
                <p className="font-heading text-lg font-bold text-slate-800">{sslOk ? "SSL Aktif & Terpasang" : "SSL Tidak Aktif"}</p>
                <p className="text-sm text-slate-400">{svc.ssl?.issuer}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Info label="Status" value={svc.ssl?.status} />
              <Info label="Berlaku Hingga" value={dateID(svc.ssl?.valid_until)} />
              <Info label="Auto-Renew" value={svc.ssl?.auto_renew ? "Aktif" : "Nonaktif"} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="backup" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Backup Otomatis Harian</p>
            <button onClick={() => backupM.mutate()} disabled={backupM.isPending} data-testid="detail-create-backup" className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {backupM.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DatabaseBackup className="h-3.5 w-3.5" />} Buat Backup
            </button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {svc.backups.map((b) => (
              <div key={b.id} className="flex items-center gap-3 border-b border-slate-50 p-4 last:border-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-light text-brand"><DatabaseBackup className="h-4 w-4" /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">{dateID(b.date)}</p>
                  <p className="text-xs text-slate-400">{b.type} · {b.size}</p>
                </div>
                <button onClick={() => toast.success("Restore backup dimulai (simulasi)")} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Restore</button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
