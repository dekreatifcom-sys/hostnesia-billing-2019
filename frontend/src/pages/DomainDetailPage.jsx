import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDomain } from "@/lib/queries";
import { dateID } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Globe, Loader2, Copy } from "lucide-react";

const TABS = ["Overview", "Nameservers", "Registrar Lock", "Addons", "Kontak Domain", "Private Nameservers", "DNS Management", "DNSSEC", "Domain Forwarding", "Kode EPP"];
const slug = (t) => t.toLowerCase().replace(/\s+/g, "-");

function Field({ label, value }) {
  return <div><p className="text-xs text-slate-400">{label}</p><p className="mt-0.5 text-sm font-semibold text-slate-800">{value}</p></div>;
}
function ToggleRow({ label, desc, defaultChecked, testid }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4">
      <div><p className="text-sm font-semibold text-slate-800">{label}</p><p className="text-xs text-slate-400">{desc}</p></div>
      <Switch checked={on} data-testid={testid} onCheckedChange={(v) => { setOn(v); toast.success(`${label} ${v ? "diaktifkan" : "dinonaktifkan"}`); }} />
    </div>
  );
}

export default function DomainDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: d, isLoading } = useDomain(id);
  const [tab, setTab] = useState("Overview");
  const [fwd, setFwd] = useState("");

  if (isLoading || !d) return <div className="flex h-60 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;
  const copy = (t) => { navigator.clipboard?.writeText(t); toast.success("Disalin ke clipboard"); };

  return (
    <div className="space-y-6" data-testid="domain-detail-page">
      <button onClick={() => navigate(-1)} data-testid="domain-back" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand"><ArrowLeft className="h-4 w-4" /> Kembali</button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light text-brand"><Globe className="h-6 w-6" /></span>
            <div><h1 className="font-heading text-xl font-extrabold text-slate-800">{d.domain}</h1><p className="text-sm text-slate-400">{d.registrar}</p></div>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${d.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{d.status === "Active" ? "Aktif" : "Kedaluwarsa"}</span>
        </div>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`domain-tab-${slug(t)}`} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${tab === t ? "bg-brand text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{t}</button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6" data-testid={`domain-panel-${slug(tab)}`}>
        {tab === "Overview" && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Field label="Domain" value={d.domain} />
            <Field label="Registrar" value={d.registrar} />
            <Field label="Status" value={d.status} />
            <Field label="Tanggal Registrasi" value={dateID(d.registration_date)} />
            <Field label="Tanggal Kedaluwarsa" value={dateID(d.expiry_date)} />
            <Field label="Auto Renew" value={d.auto_renew ? "Aktif" : "Nonaktif"} />
          </div>
        )}
        {tab === "Nameservers" && (
          <div className="space-y-3">
            {(d.nameservers || []).map((n, i) => (
              <div key={i} className="space-y-1"><label className="text-xs text-slate-400">Nameserver {i + 1}</label><Input defaultValue={n} data-testid={`ns-input-${i}`} /></div>
            ))}
            <Button className="rounded-xl" data-testid="ns-save" onClick={() => toast.success("Nameserver berhasil disimpan")}>Simpan Nameserver</Button>
          </div>
        )}
        {tab === "Registrar Lock" && <ToggleRow label="Registrar Lock" desc="Mencegah transfer domain tidak sah." defaultChecked={d.registrar_lock} testid="registrar-lock-toggle" />}
        {tab === "Addons" && (
          <div className="space-y-3">
            <ToggleRow label="ID Protect (Privasi WHOIS)" desc="Sembunyikan data kontak dari publik." defaultChecked={d.privacy} testid="addon-privacy" />
            <ToggleRow label="Auto Renew" desc="Perpanjang otomatis sebelum kedaluwarsa." defaultChecked={d.auto_renew} testid="addon-autorenew" />
          </div>
        )}
        {tab === "Kontak Domain" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1"><label className="text-xs text-slate-400">Nama</label><Input defaultValue="Rizky Pratama" /></div>
            <div className="space-y-1"><label className="text-xs text-slate-400">Email</label><Input defaultValue="dekreatif.com@gmail.com" /></div>
            <div className="space-y-1"><label className="text-xs text-slate-400">Telepon</label><Input defaultValue="+62 812-3456-7890" /></div>
            <div className="space-y-1"><label className="text-xs text-slate-400">Kota</label><Input defaultValue="Jakarta" /></div>
            <div className="sm:col-span-2"><Button className="rounded-xl" onClick={() => toast.success("Kontak domain diperbarui")}>Simpan Kontak</Button></div>
          </div>
        )}
        {tab === "Private Nameservers" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Daftarkan private (child) nameserver untuk domain Anda.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Input placeholder={`ns1.${d.domain}`} /><Input placeholder="IP Address" /></div>
            <Button className="rounded-xl" onClick={() => toast.success("Private nameserver terdaftar")}>Daftarkan</Button>
          </div>
        )}
        {tab === "DNS Management" && (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-600">{(d.dns_records || []).length} record</p>
            {(d.dns_records || []).map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <span className="w-14 rounded-lg bg-brand-light py-1 text-center text-xs font-bold text-brand">{r.type}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{r.name}</p><p className="truncate text-xs text-slate-400">{r.value}</p></div>
              </div>
            ))}
            <Button className="rounded-xl" onClick={() => toast.success("Pengelola DNS lengkap (simulasi)")}>Tambah Record</Button>
          </div>
        )}
        {tab === "DNSSEC" && <ToggleRow label="DNSSEC" desc="Tambahkan lapisan keamanan pada DNS domain." defaultChecked={d.dnssec} testid="dnssec-toggle" />}
        {tab === "Domain Forwarding" && (
          <div className="space-y-3">
            <div className="space-y-1"><label className="text-xs text-slate-400">Teruskan ke URL</label><Input value={fwd} onChange={(e) => setFwd(e.target.value)} placeholder="https://tujuan.com" data-testid="forwarding-input" /></div>
            <Button className="rounded-xl" data-testid="forwarding-save" onClick={() => toast.success("Domain forwarding disimpan")}>Simpan</Button>
          </div>
        )}
        {tab === "Kode EPP" && (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">Gunakan kode EPP (Auth Code) untuk transfer domain ke registrar lain.</p>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <code className="flex-1 font-mono text-sm font-bold text-slate-800" data-testid="epp-code">{d.epp}</code>
              <button onClick={() => copy(d.epp)} data-testid="epp-copy" className="inline-flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark"><Copy className="h-3.5 w-3.5" /> Salin</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
