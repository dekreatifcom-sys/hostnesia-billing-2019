# HostNesia — Client Area & Billing Dashboard

## Original Problem Statement
High-fidelity, mobile-first prototype for a modern Web Hosting Billing & Client Management system (WHMCS/Blesta style) — client-area scope. "Hybrid Headless Panel" (inspired by Spaceship.com & Hostinger): native UI for quick actions, deep-linked SSO for heavy features (File Manager, phpMyAdmin), and a cPanel escape hatch. Primary brand color #166db4. Mobile-first bottom bar with a central floating "+" action, slide-up bottom sheet; transitions to sidebar + top-header dropdown + grid on desktop.

## Architecture
- **Frontend**: React 19 + Tailwind + shadcn/ui, framer-motion (bottom sheet / overlays), lucide-react icons (#166db4), sonner toasts, react-query. Fonts: Manrope (headings) + Plus Jakarta Sans (body).
- **Backend**: FastAPI + MongoDB (motor). JWT Bearer auth (bcrypt), token in localStorage `hn_token`. PDF via fpdf2. All routes under `/api`.
- **Auto-seeded demo data** on startup (idempotent): 1 user, 4 services, 4 invoices (2 unpaid), 4 transactions, 4 DNS records + 2 email accounts (budistore.id).

## User Personas
- Hosting client (non-technical): manages services, pays invoices, tops up wallet via a clean "super app".
- Power user: uses SSO / cPanel escape hatch for advanced control.

## Core Requirements (static)
- Mock schema: users(id,nama,email,saldo_kredit), services(id,user_id,nama_produk,domain,status,persentase_penggunaan_disk,tanggal_jatuh_tempo_selanjutnya), invoices(id,jumlah_tagihan,status,tanggal_jatuh_tempo) + wallet transactions.
- Mobile bottom bar (5 items, elevated central FAB) → slide-up Quick Actions sheet; desktop sidebar + top-header "Quick Actions" dropdown.

## Implemented
### 2026-08-01 — MVP
- JWT login, protected routes, logout. Dashboard v1 (wallet card, carousel/grid, unpaid alert). Quick Actions (Order/DNS/Email native forms + SSO simulations). Billing & Wallet (pay invoice, top-up, transaction history). Profile page. Responsive mobile↔desktop.

### 2026-08-01 — Iteration 2 (redesign + 4 features)
- **Dashboard redesign** (per user reference: DomaiNesia/HostNesia): removed blue wallet card; 4 stat cards (Layanan, Domain, Tagihan, Order Layanan CTA), white Saldo Dompet card with top-right (+) top-up icon, billing summary (unpaid alert / all-paid), Active services as a LIST/TABLE with per-row "Kelola" dropdown (Detail / DNS / File Manager / cPanel).
- **Service Detail page** (/layanan/:id): header (IP, nameserver, due, disk) + SSO buttons + tabs DNS / Email / SSL / Backup (add DNS/email with service preselected; create/restore backup simulated).
- **Invoice/Struk PDF**: download button per invoice on Billing page; GET /api/invoices/{id}/pdf builds branded PDF (LUNAS/PAID stamp for paid, BELUM DIBAYAR for unpaid) — visually verified.
- **Smart Notifications**: bell (desktop top-header + mobile dashboard) via GET /api/notifications — unpaid/overdue invoices, high disk usage (≥85%), renewal/expiry.
- Tested via testing_agent iteration_2: backend 21/21 pytest pass, frontend 100% (fixed a downloadPdf handler bug). Invoice-id collision + token handling fixed in iteration_1.

## Backlog
- P1: Persist backups collection; real invoice line-items / tax.
- P2: Real payment gateway (Stripe/Midtrans), auto-pay from wallet on due, domains module, admin panel, indexes on user_id.
- P2: Align Billing page header with new design language (still uses blue WalletCard — intentional hero).

## Next Tasks
- Renewal flow from an invoice; auto-debit wallet; notification click → deep link to the relevant page.
