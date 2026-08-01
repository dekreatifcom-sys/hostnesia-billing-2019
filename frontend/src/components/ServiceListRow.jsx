import { useNavigate } from "react-router-dom";
import { Globe, ChevronDown, Settings2, FolderOpen, KeyRound, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useQuickActions } from "@/context/QuickActionsContext";
import StatusBadge from "@/components/StatusBadge";
import { dueInfo } from "@/lib/format";

export default function ServiceListRow({ service }) {
  const navigate = useNavigate();
  const { openForm, runSso } = useQuickActions();
  const due = dueInfo(service.tanggal_jatuh_tempo_selanjutnya);

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center" data-testid={`service-row-${service.id}`}>
      <button
        onClick={() => navigate(`/layanan/${service.id}`)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        data-testid={`service-detail-link-${service.id}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
          <Globe className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-bold text-slate-800">{service.nama_produk}</p>
          <p className="truncate text-xs text-slate-400">{service.domain}</p>
        </div>
      </button>

      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span
          className={`hidden text-xs font-medium sm:block ${
            due.expired ? "text-red-500" : due.soon ? "text-amber-600" : "text-slate-400"
          }`}
        >
          {due.label}
        </span>
        <StatusBadge status={service.status} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              data-testid={`service-manage-${service.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Kelola <ChevronDown className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 rounded-xl">
            <DropdownMenuItem onClick={() => navigate(`/layanan/${service.id}`)} className="cursor-pointer" data-testid={`manage-detail-${service.id}`}>
              <ArrowRight className="mr-1 h-4 w-4 text-brand" /> Detail Layanan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openForm("dns", { serviceId: service.id })} className="cursor-pointer">
              <Settings2 className="mr-1 h-4 w-4 text-brand" /> Kelola DNS
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => runSso(`File Manager (${service.domain})`)} className="cursor-pointer">
              <FolderOpen className="mr-1 h-4 w-4 text-brand" /> File Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => runSso(`cPanel (${service.domain})`)} className="cursor-pointer">
              <KeyRound className="mr-1 h-4 w-4 text-brand" /> Login cPanel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
