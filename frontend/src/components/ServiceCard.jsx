import { Globe, HardDrive, CalendarClock, ExternalLink, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dateID } from "@/lib/format";
import { useQuickActions } from "@/context/QuickActionsContext";

function StatusBadge({ status }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
      {active ? "Aktif" : "Ditangguhkan"}
    </span>
  );
}

export default function ServiceCard({ service }) {
  const { runSso } = useQuickActions();
  const navigate = useNavigate();
  const disk = service.persentase_penggunaan_disk;
  const high = disk >= 85;

  return (
    <div
      className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
      data-testid={`service-card-${service.id}`}
    >
      <div className="flex items-start justify-between">
        <button
          onClick={() => navigate(`/layanan/${service.id}`)}
          className="flex items-center gap-3 text-left"
          data-testid={`service-detail-link-${service.id}`}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
            <Globe className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-base font-bold leading-tight text-slate-800 hover:text-brand">{service.domain}</p>
            <p className="text-xs text-slate-400">{service.nama_produk}</p>
          </div>
        </button>
        <StatusBadge status={service.status} />
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <HardDrive className="h-3.5 w-3.5" /> Penggunaan Disk
          </span>
          <span className={`font-bold ${high ? "text-red-500" : "text-slate-700"}`}>{disk}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${high ? "bg-red-500" : "bg-brand"}`}
            style={{ width: `${disk}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
        <CalendarClock className="h-3.5 w-3.5" />
        Jatuh tempo: <span className="font-medium text-slate-600">{dateID(service.tanggal_jatuh_tempo_selanjutnya)}</span>
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <button
          onClick={() => runSso(`File Manager (${service.domain})`)}
          data-testid={`service-filemanager-${service.id}`}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          <ExternalLink className="h-3.5 w-3.5" /> File Manager
        </button>
        <button
          onClick={() => runSso(`cPanel (${service.domain})`)}
          data-testid={`service-cpanel-${service.id}`}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <KeyRound className="h-3.5 w-3.5" /> Login cPanel
        </button>
      </div>
    </div>
  );
}
