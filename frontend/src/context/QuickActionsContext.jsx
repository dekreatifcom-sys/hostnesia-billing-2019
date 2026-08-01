import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const QuickActionsContext = createContext(null);

export function QuickActionsProvider({ children }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeForm, setActiveForm] = useState(null); // 'order' | 'dns' | 'email'
  const [formPayload, setFormPayload] = useState(null);
  const [sso, setSso] = useState(null); // { label }

  const openSheet = () => setSheetOpen(true);
  const closeSheet = () => setSheetOpen(false);

  const openForm = (name, payload = null) => {
    setSheetOpen(false);
    setFormPayload(payload);
    setActiveForm(name);
  };
  const closeForm = () => setActiveForm(null);

  const runSso = (label) => {
    setSheetOpen(false);
    setSso({ label });
    toast.loading(`Mengalihkan ke ${label}...`, { id: "sso" });
    setTimeout(() => {
      setSso(null);
      toast.success(`Single Sign-On ke ${label} berhasil`, { id: "sso" });
    }, 1700);
  };

  return (
    <QuickActionsContext.Provider
      value={{ sheetOpen, openSheet, closeSheet, activeForm, formPayload, openForm, closeForm, sso, runSso }}
    >
      {children}
    </QuickActionsContext.Provider>
  );
}

export const useQuickActions = () => useContext(QuickActionsContext);
