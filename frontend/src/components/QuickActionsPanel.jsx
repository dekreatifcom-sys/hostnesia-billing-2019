import { PackagePlus, Globe, AtSign, FolderOpen, Database } from "lucide-react";
import { useQuickActions } from "@/context/QuickActionsContext";

const actions = [
  { key: "order", label: "Order Layanan Baru", desc: "Native UI", icon: PackagePlus, type: "form" },
  { key: "dns", label: "Kelola DNS", desc: "Native UI", icon: Globe, type: "form" },
  { key: "email", label: "Buat Akun Email", desc: "Native UI", icon: AtSign, type: "form" },
  { key: "filemanager", label: "File Manager", desc: "Deep-Link SSO", icon: FolderOpen, type: "sso" },
  { key: "phpmyadmin", label: "phpMyAdmin", desc: "Deep-Link SSO", icon: Database, type: "sso" },
];

export default function QuickActionsPanel({ onSelect }) {
  const { openForm, runSso } = useQuickActions();

  const handle = (a) => {
    if (a.type === "form") openForm(a.key);
    else runSso(a.label);
    onSelect?.();
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((a) => (
        <button
          key={a.key}
          onClick={() => handle(a)}
          data-testid={`quick-action-${a.key}`}
          className="group flex flex-col items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left transition-colors hover:border-brand/30 hover:bg-brand-light"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
            <a.icon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight text-slate-800">{a.label}</span>
            <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {a.desc}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
