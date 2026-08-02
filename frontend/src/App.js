import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ServicesPage from "@/pages/ServicesPage";
import ServiceDetailPage from "@/pages/ServiceDetailPage";
import DomainsPage from "@/pages/DomainsPage";
import DomainDetailPage from "@/pages/DomainDetailPage";
import AffiliatePage from "@/pages/AffiliatePage";
import CheckoutPage from "@/pages/CheckoutPage";
import BillingPage from "@/pages/BillingPage";
import ProfilePage from "@/pages/ProfilePage";

function App() {
  useEffect(() => {
    document.title = "HostNesia — Client Area";
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/layanan" element={<ServicesPage category="hosting" />} />
              <Route path="/layanan/jasa" element={<ServicesPage category="jasa" />} />
              <Route path="/layanan/:id" element={<ServiceDetailPage />} />
              <Route path="/domain" element={<DomainsPage />} />
              <Route path="/domain/:id" element={<DomainDetailPage />} />
              <Route path="/afiliasi" element={<AffiliatePage />} />
              <Route path="/tagihan" element={<BillingPage />} />
              <Route path="/profil" element={<ProfilePage />} />
            </Route>
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </AuthProvider>
  );
}

export default App;
