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
- Renewal flow from an invoice; auto-debit wallet; notification click → deep link.

### 2026-08-01 — Iteration 3 (menus & modules)
- **Domain module**: `/domain` list + search (POST /api/domains/check) with popular TLDs & prices (GET /api/tlds); `/domain/:id` detail with 10 tabs (Overview, Nameservers, Registrar Lock, Addons, Kontak Domain, Private Nameservers, DNS Management, DNSSEC, Domain Forwarding, Kode EPP).
- **Dashboard revamp**: removed Saldo card; saldo moved to header (desktop top-header + mobile dashboard header) with (+) top-up; added auto-rotating **banner slider** at top.
- **Layanan submenu**: Layanan Saya (hosting) / Layanan Jasa (web, SEO, ads) / Order Layanan Baru; services now have `category` (hosting/jasa).
- **Hosting service actions** on detail page: Login cPanel, Login Webmail, Ganti Password, Upgrade/Downgrade, Unblock IP, Minta Pembatalan (POST /api/services/{id}/action).
- **Afiliasi** page (GET /api/affiliate): komisi, link referral, stats, riwayat.
- **Header profile dropdown**: Detail Akun Saya, Informasi Pajak, User Management, Kontak, Keamanan Akun, Riwayat Email | Profil Kamu, Switch Account, Ganti Kata Sandi, Pengaturan Keamanan, Log Out.
- Mobile-friendly preserved (bottom nav + FAB unchanged; Domain/Afiliasi/Jasa reachable via stat card + Profile menu).
- Tested iteration_3: backend 34/34 pytest pass, frontend 100% desktop+mobile. Fixed sidebar "Layanan" click UX.
- NOTE: All new modules are static prototype (SSO, actions, domain tabs, affiliate, domain-check = mock) — to be made dynamic & admin-controlled in a future admin-system phase.

### 2026-08-02 — Iteration 5 (payment redesign, saldo, menu & order-redirect)
- **Payment page redesigned** (ref image): billing address card ("Alamat Penagihan" + Edit) + numbered "2 Pembayaran" section with **accordion payment methods** grouped as "Pembayaran Instan" (Saldo, Kartu, PayPal) and "Transfer Bank / QRIS · 1 Hari Kerja" (BCA/BNI/Mandiri VA + QRIS). Each row expands to reveal method details, "Penting" 24-jam notice, security line, terms + action button ("Bayar Sekarang" / "Buat Tagihan Pembayaran"). Right sticky "Daftar pesanan" summary (desktop) / moves to top (mobile). Success screen unchanged. `MethodRow` component added.
- **Bayar dari Saldo**: wallet balance method (tag "Tercepat"), shows saldo & shortfall guard; pays instantly → success (Metode: Saldo HostNesia). Uses `useWallet`.
- **Sidebar**: Layanan submenu now COLLAPSED by default (`open=false`, removed auto-open on Layanan click).
- **Order Layanan Baru → external redirect** to `https://hostnesia.id/layanan` (WordPress) in Sidebar, ServicesPage button, and Quick Actions panel (no more in-app order popup). Dashboard "Order Layanan" card & promo banner still open in-app /checkout.
- **Domain search** relocated to Dashboard (`DomainSearchWidget`); Domain menu = list table only.
- Verified visually (desktop 1440 + mobile 430): sidebar collapsed, full saldo-pay flow → success, VA accordion expand all correct.

### 2026-08-02 — Bugfix: Login gagal ("Terjadi kesalahan. Coba lagi.")
- **Root cause**: CORS middleware set `allow_credentials=True` together with `allow_origins=["*"]`. Response emitted `Access-Control-Allow-Origin: *` AND `Access-Control-Allow-Credentials: true` — an invalid combo per Fetch spec that browsers reject, making axios `err.response` undefined (hence the generic null-fallback error). Login worked via curl & same-origin tests but failed in the user's browser context.
- **Fix**: `server.py` CORS → `allow_credentials=False` (app uses Bearer tokens, no cookies). Confirmed headers now return only `access-control-allow-origin: *`; cross-origin POST returns 200.
- **UX**: `Login.jsx` now distinguishes network errors ("Tidak dapat terhubung ke server…") from auth errors.
- Verified end-to-end in browser: login → dashboard, zero CORS/console errors.

### 2026-08-02 — Iteration 4 (checkout gateway + domain search relocation)
- **Realistic Payment Gateway** (`CheckoutPage.jsx`): after "Lanjutkan", cart hides via smooth AnimatePresence transition → connecting loader → gateway UI with prominent Order No (`INV-YYYY-XXXX`) + total, live countdown; payment method cards (Virtual Account w/ bank picker + copyable VA number, QRIS w/ QR placeholder, E-Wallet picker); each method shows mock instructions; "Bayar Sekarang" → animated "Pembayaran Berhasil" success screen with LUNAS status + back-to-dashboard. Mobile-first, rounded, clean UI.
- **Domain search relocated**: extracted to `DomainSearchWidget.jsx`, now rendered on Dashboard (below banner). `DomainsPage.jsx` reduced to "Domain Saya" list table only (per user revision).
- Verified via screenshot flow: dashboard widget + full VA payment → success path all render correctly on mobile (430px).
