import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Zap, Loader2, Mail, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("dekreatif.com@gmail.com");
  const [password, setPassword] = useState("HostNesia123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) navigate("/", { replace: true });
  }, [ready, user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response
        ? apiError(err.response?.data?.detail)
        : "Tidak dapat terhubung ke server. Periksa koneksi Anda lalu coba lagi.";
      setError(msg);
      toast.error(err.response ? "Login gagal" : "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-brand p-12 text-white lg:flex">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Zap className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="font-heading text-xl font-extrabold">HostNesia</span>
        </div>
        <div className="relative">
          <h1 className="font-heading text-4xl font-extrabold leading-tight">
            Kelola hosting Anda<br />seperti aplikasi favorit.
          </h1>
          <p className="mt-4 max-w-md text-white/80">
            Super app hosting yang menyembunyikan kerumitan cPanel — aksi cepat, dompet digital,
            dan kendali penuh dalam satu genggaman.
          </p>
        </div>
        <p className="relative text-sm text-white/60">© 2026 HostNesia. Client Area.</p>
      </div>

      {/* Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>
            <span className="font-heading text-xl font-extrabold text-slate-800">HostNesia</span>
          </div>

          <h2 className="font-heading text-2xl font-bold text-slate-800">Masuk ke Client Area</h2>
          <p className="mt-1 text-sm text-slate-500">Gunakan akun demo di bawah untuk mencoba.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  data-testid="login-email-input"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Kata Sandi</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  data-testid="login-password-input"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500" data-testid="login-error">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} data-testid="login-submit" className="w-full rounded-xl py-6">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-brand-light p-4 text-xs text-brand">
            <p className="font-bold">Akun Demo</p>
            <p className="mt-1 opacity-90">dekreatif.com@gmail.com · HostNesia123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
