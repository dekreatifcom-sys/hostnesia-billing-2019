import { Bell, AlertTriangle, Receipt, HardDrive, CalendarClock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/lib/queries";

const ICONS = { invoice: Receipt, disk: HardDrive, renewal: CalendarClock };

export default function NotificationBell() {
  const { data } = useNotifications();
  const items = data?.items || [];
  const count = items.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-testid="notification-bell"
          aria-label="Notifikasi"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span
              data-testid="notification-count"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
            >
              {count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-0" data-testid="notification-panel">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="font-heading text-sm font-bold text-slate-800">Notifikasi</p>
          <p className="text-xs text-slate-400">{count} pemberitahuan aktif</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">Tidak ada notifikasi baru.</div>
          ) : (
            items.map((n) => {
              const Icon = ICONS[n.type] || AlertTriangle;
              const danger = n.severity === "danger";
              return (
                <div
                  key={n.id}
                  data-testid={`notification-${n.id}`}
                  className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0"
                >
                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      danger ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
