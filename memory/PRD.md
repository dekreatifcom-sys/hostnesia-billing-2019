# HostNesia — Client Area & Billing Dashboard

## Original Problem Statement
High-fidelity, mobile-first prototype for a modern Web Hosting Billing & Client Management system (WHMCS/Blesta style) — client-area scope. "Hybrid Headless Panel" (inspired by Spaceship.com & Hostinger): native UI for quick actions, deep-linked SSO for heavy features (File Manager, phpMyAdmin), and a cPanel escape hatch. Primary brand color #166db4. Mobile-first bottom bar with a central floating "+" action, slide-up bottom sheet; transitions to sidebar + top-header dropdown + grid on desktop.

## Architecture
- **Frontend**: React 19 + Tailwind + shadcn/ui, framer-motion (bottom sheet / overlays), lucide-react icons (#166db4), sonner toasts, react-query for data. Fonts: Manrope (headings) + Plus Jakarta Sans (body).
- **Backend**: FastAPI + MongoDB (motor). JWT Bearer auth (bcrypt), token stored in localStorage `hn_token`. All routes under `/api`.
- **Auto-seeded demo data** on startup (idempotent).

## User Personas
- Hosting client (non-technical): manages services, pays invoices, tops up wallet via a clean "super app".
- Power user: uses SSO / cPanel escape hatch for advanced control.

## Core Requirements (static)
- Mock schema: users(id,nama,email,saldo_kredit), services(id,user_id,nama_produk,domain,status,persentase_penggunaan_disk,tanggal_jatuh_tempo_selanjutnya), invoices(id,jumlah_tagihan,status,tanggal_jatuh_tempo) + wallet transactions.
- Mobile bottom bar (5 items, elevated central FAB) → slide-up Quick Actions sheet; desktop sidebar + top-header "Quick Actions" dropdown.
- Dashboard: greeting, wallet balance card, swipeable services carousel (grid on desktop), unpaid-invoices alert.

## Implemented (2026-08-01)
- JWT login page (demo account prefilled) + protected routes + logout.
- Dashboard: wallet card, unpaid alert, mobile swipeable carousel / desktop grid, disk-usage progress bars.
- Quick Actions: Order Layanan Baru (creates service + unpaid invoice), Kelola DNS, Buat Akun Email — all native forms hitting mock APIs. File Manager / phpMyAdmin / cPanel = simulated SSO overlay + toast.
- Billing & Wallet page: invoices list with Bayar (deducts saldo, marks Paid, logs transaction), transaction history tab, top-up dialog with presets.
- Profile page: account details, cPanel escape hatch, logout.
- Responsive mobile↔desktop layouts; brand #166db4 throughout.
- Backend endpoints: /api/auth/{login,me,logout}, /products, /services, /services/order, /services/{id}/dns, /services/{id}/email, /invoices, /invoices/{id}/pay, /wallet, /wallet/topup.
- Tested via testing_agent (backend 15/16 pytest, frontend all flows). Fixed: unique invoice IDs, login redirect-in-render, resilient token/ObjectId handling.

## Backlog
- P1: Service detail page (DNS records list, email accounts list, SSL, backups).
- P1: Real invoice PDF / receipt download.
- P2: Notifications, multi-currency, real payment gateway (Stripe/Midtrans).
- P2: Move PRODUCTS to DB; admin panel.

## Next Tasks
- Service detail drill-down; renewal flow from an invoice; auto-pay from wallet.
