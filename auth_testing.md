# HostNesia Auth Testing

## Credentials
- Email: dekreatif.com@gmail.com
- Password: HostNesia123!

## Auth flow (Bearer token in localStorage key `hn_token`)
1. POST /api/auth/login {email,password} -> { token, user }
2. GET /api/auth/me with header `Authorization: Bearer <token>` -> user
3. POST /api/auth/logout -> { ok: true }

## Quick API check
```
curl -s -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"dekreatif.com@gmail.com","password":"HostNesia123!"}'
```
Login returns a JWT token. Use it as `Authorization: Bearer <token>` for all protected routes:
/api/products, /api/services, /api/invoices, /api/wallet, /api/wallet/topup,
/api/invoices/{id}/pay, /api/services/order, /api/services/{id}/dns, /api/services/{id}/email
