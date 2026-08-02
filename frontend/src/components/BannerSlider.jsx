import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const slides = [
  { title: "Cek & Beli Domain Harga Murah", subtitle: "Mulai Rp15.000/tahun untuk .my.id", cta: "Cek Domain", to: "/domain", grad: "from-brand to-brand-dark" },
  { title: "Promo Cloud Hosting", subtitle: "Beli hosting gratis 1 domain .id", cta: "Order Sekarang", to: "/checkout", grad: "from-indigo-600 to-brand" },
  { title: "Jasa Pembuatan Website Perusahaan", subtitle: "Website profesional mulai Rp550.000", cta: "Lihat Layanan Jasa", to: "/layanan/jasa", grad: "from-slate-800 to-brand-dark" },
];

export default function BannerSlider() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, []);

  const go = (s) => navigate(s.to);

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-soft" data-testid="banner-slider">
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, idx) => (
          <div key={idx} className={`relative min-w-full bg-gradient-to-r ${s.grad} p-6 sm:p-10`}>
            <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-14 right-24 h-40 w-40 rounded-full bg-white/5" />
            <div className="relative max-w-md text-white">
              <h3 className="font-heading text-xl font-extrabold sm:text-2xl">{s.title}</h3>
              <p className="mt-1 text-sm text-white/80">{s.subtitle}</p>
              <button
                onClick={() => go(s)}
                data-testid={`banner-cta-${idx}`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-brand transition-transform active:scale-95"
              >
                {s.cta} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-3 left-6 flex gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
