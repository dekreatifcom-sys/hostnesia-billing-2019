export const idr = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const dateID = (s) => {
  if (!s) return "-";
  const d = new Date(s);
  if (isNaN(d)) return s;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export const dueInfo = (s) => {
  if (!s) return { label: "-" };
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(s);
  if (isNaN(d)) return { label: s };
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - now) / 86400000);
  if (diff < 0) return { label: `Kedaluwarsa ${Math.abs(diff)} hari lalu`, expired: true };
  if (diff === 0) return { label: "Jatuh tempo hari ini", soon: true };
  if (diff <= 14) return { label: `${diff} hari lagi`, soon: true };
  return { label: dateID(s) };
};
