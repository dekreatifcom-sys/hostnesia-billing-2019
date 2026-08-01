import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { QuickActionsProvider, useQuickActions } from "@/context/QuickActionsContext";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import BottomNav from "@/components/BottomNav";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import QuickActionForms from "@/components/QuickActionForms";

function MobileSheet() {
  const { sheetOpen, closeSheet } = useQuickActions();
  return (
    <AnimatePresence>
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden" data-testid="quick-actions-sheet">
          <motion.div
            className="absolute inset-0 bg-slate-900/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSheet}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
            <h3 className="mb-1 text-lg font-bold text-slate-800">Quick Access</h3>
            <p className="mb-4 text-sm text-slate-500">Aksi cepat untuk mengelola layanan Anda.</p>
            <QuickActionsPanel />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SsoOverlay() {
  const { sso } = useQuickActions();
  return (
    <AnimatePresence>
      {sso && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="sso-overlay"
        >
          <Loader2 className="h-10 w-10 animate-spin text-brand" />
          <p className="mt-4 font-semibold text-slate-800">Menghubungkan Single Sign-On…</p>
          <p className="text-sm text-slate-500">Mengalihkan Anda ke {sso.label}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AppLayout() {
  return (
    <QuickActionsProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="md:pl-64">
          <TopHeader />
          <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-10 md:pt-8">
            <Outlet />
          </main>
        </div>
        <BottomNav />
        <MobileSheet />
        <SsoOverlay />
        <QuickActionForms />
      </div>
    </QuickActionsProvider>
  );
}
