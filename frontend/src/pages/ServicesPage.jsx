import { useServices } from "@/lib/queries";
import { useQuickActions } from "@/context/QuickActionsContext";
import ServiceCard from "@/components/ServiceCard";
import { Loader2, Plus, Server } from "lucide-react";

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices();
  const { openSheet } = useQuickActions();

  return (
    <div className="space-y-6" data-testid="services-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-800">Layanan Saya</h1>
          <p className="text-sm text-slate-400">Kelola seluruh produk hosting & VPS Anda.</p>
        </div>
        <button
          onClick={openSheet}
          data-testid="services-order-button"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-brand-dark md:hidden"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-brand" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <Server className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Belum ada layanan.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceCard key={s.id} service={s} />
          ))}
        </div>
      )}
    </div>
  );
}
