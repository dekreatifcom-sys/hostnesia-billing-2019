from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import logging
import uuid
import jwt
import bcrypt
from bson import ObjectId

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"

app = FastAPI(title="HostNesia API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("hostnesia")

# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def serialize_user(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "nama": doc.get("nama", ""),
        "email": doc.get("email", ""),
        "saldo_kredit": doc.get("saldo_kredit", 0),
        "phone": doc.get("phone", ""),
    }

async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Tidak terautentikasi")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesi berakhir, silakan login kembali")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="Pengguna tidak ditemukan")
    return user

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class LoginInput(BaseModel):
    email: str
    password: str

class TopupInput(BaseModel):
    amount: int
    method: str = "Transfer Bank"

class OrderInput(BaseModel):
    product_id: str
    domain: str
    cycle: str = "Bulanan"

class DnsInput(BaseModel):
    type: str
    name: str
    value: str
    ttl: int = 3600

class EmailInput(BaseModel):
    username: str
    password: str
    quota: int = 1024

# ---------------------------------------------------------------------------
# Static products
# ---------------------------------------------------------------------------
PRODUCTS = [
    {"id": "prod-startup", "nama_produk": "Cloud Hosting Startup", "harga": 50000, "deskripsi": "Cocok untuk website pertama Anda", "disk": "10 GB NVMe"},
    {"id": "prod-business", "nama_produk": "Cloud Hosting Business", "harga": 120000, "deskripsi": "Untuk bisnis yang sedang berkembang", "disk": "50 GB NVMe"},
    {"id": "prod-vps", "nama_produk": "VPS KVM 2GB", "harga": 150000, "deskripsi": "Kontrol penuh dengan akses root", "disk": "60 GB NVMe"},
    {"id": "prod-wp", "nama_produk": "Managed WordPress", "harga": 90000, "deskripsi": "WordPress tanpa ribet, auto-update", "disk": "30 GB NVMe"},
]

# ---------------------------------------------------------------------------
# Seeding
# ---------------------------------------------------------------------------
async def seed():
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]

    user = await db.users.find_one({"email": admin_email})
    if user is None:
        res = await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "nama": "Rizky Pratama",
            "phone": "+62 812-3456-7890",
            "saldo_kredit": 1500000,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        user_id = str(res.inserted_id)
    else:
        user_id = str(user["_id"])
        if not verify_password(admin_password, user.get("password_hash", "")):
            await db.users.update_one({"_id": user["_id"]}, {"$set": {"password_hash": hash_password(admin_password)}})

    if await db.services.count_documents({"user_id": user_id}) == 0:
        await db.services.insert_many([
            {"id": str(uuid.uuid4()), "user_id": user_id, "nama_produk": "Cloud Hosting Startup", "domain": "budistore.id",
             "status": "Active", "persentase_penggunaan_disk": 45, "tanggal_jatuh_tempo_selanjutnya": "2026-12-01",
             "ip": "103.171.44.12", "nameserver": "ns1.hostnesia.id", "created_at": "2025-12-01"},
            {"id": str(uuid.uuid4()), "user_id": user_id, "nama_produk": "VPS KVM 2GB", "domain": "app.budistore.id",
             "status": "Active", "persentase_penggunaan_disk": 80, "tanggal_jatuh_tempo_selanjutnya": "2026-10-15",
             "ip": "103.171.44.58", "nameserver": "ns1.hostnesia.id", "created_at": "2025-10-15"},
            {"id": str(uuid.uuid4()), "user_id": user_id, "nama_produk": "Managed WordPress", "domain": "blog.budistore.id",
             "status": "Active", "persentase_penggunaan_disk": 22, "tanggal_jatuh_tempo_selanjutnya": "2027-01-20",
             "ip": "103.171.44.90", "nameserver": "ns1.hostnesia.id", "created_at": "2026-01-20"},
            {"id": str(uuid.uuid4()), "user_id": user_id, "nama_produk": "Cloud Hosting Business", "domain": "tokosaya.com",
             "status": "Suspended", "persentase_penggunaan_disk": 96, "tanggal_jatuh_tempo_selanjutnya": "2026-07-05",
             "ip": "103.171.44.33", "nameserver": "ns1.hostnesia.id", "created_at": "2025-07-05"},
        ])

    if await db.invoices.count_documents({"user_id": user_id}) == 0:
        await db.invoices.insert_many([
            {"id": "INV-20260701", "user_id": user_id, "jumlah_tagihan": 250000, "status": "Unpaid",
             "tanggal_jatuh_tempo": "2026-08-01", "deskripsi": "Perpanjangan VPS KVM 2GB", "created_at": "2026-07-01"},
            {"id": "INV-20260615", "user_id": user_id, "jumlah_tagihan": 120000, "status": "Unpaid",
             "tanggal_jatuh_tempo": "2026-07-20", "deskripsi": "Perpanjangan Cloud Hosting Business", "created_at": "2026-06-15"},
            {"id": "INV-20260601", "user_id": user_id, "jumlah_tagihan": 250000, "status": "Paid",
             "tanggal_jatuh_tempo": "2026-07-01", "deskripsi": "Perpanjangan VPS KVM 2GB", "created_at": "2026-06-01"},
            {"id": "INV-20260501", "user_id": user_id, "jumlah_tagihan": 90000, "status": "Paid",
             "tanggal_jatuh_tempo": "2026-06-01", "deskripsi": "Perpanjangan Managed WordPress", "created_at": "2026-05-01"},
        ])

    if await db.transactions.count_documents({"user_id": user_id}) == 0:
        await db.transactions.insert_many([
            {"id": str(uuid.uuid4()), "user_id": user_id, "type": "topup", "amount": 1000000,
             "deskripsi": "Top-up saldo via Kartu Kredit", "created_at": "2026-05-02T10:00:00+00:00"},
            {"id": str(uuid.uuid4()), "user_id": user_id, "type": "payment", "amount": -90000,
             "deskripsi": "Pembayaran INV-20260501", "created_at": "2026-05-02T10:05:00+00:00"},
            {"id": str(uuid.uuid4()), "user_id": user_id, "type": "topup", "amount": 500000,
             "deskripsi": "Top-up saldo via Transfer Bank", "created_at": "2026-06-01T09:00:00+00:00"},
            {"id": str(uuid.uuid4()), "user_id": user_id, "type": "payment", "amount": -250000,
             "deskripsi": "Pembayaran INV-20260601", "created_at": "2026-06-01T09:10:00+00:00"},
        ])

    creds = ROOT_DIR.parent / "memory" / "test_credentials.md"
    try:
        creds.write_text(
            "# Test Credentials\n\n"
            "## Demo Client Account (HostNesia)\n"
            f"- Email: {admin_email}\n"
            f"- Password: {admin_password}\n\n"
            "## Auth Endpoints\n"
            "- POST /api/auth/login\n"
            "- GET  /api/auth/me\n"
            "- POST /api/auth/logout\n"
        )
    except Exception as e:
        logger.warning(f"Could not write test_credentials.md: {e}")

# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login")
async def login(payload: LoginInput):
    email = payload.email.strip().lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah")
    token = create_access_token(str(user["_id"]), email)
    return {"token": token, "user": serialize_user(user)}

@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)

@api_router.post("/auth/logout")
async def logout(user: dict = Depends(get_current_user)):
    return {"ok": True}

# ---------------------------------------------------------------------------
# Data routes
# ---------------------------------------------------------------------------
@api_router.get("/products")
async def get_products(user: dict = Depends(get_current_user)):
    return PRODUCTS

@api_router.get("/services")
async def get_services(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    return await db.services.find({"user_id": uid}, {"_id": 0}).to_list(200)

@api_router.get("/invoices")
async def get_invoices(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    items = await db.invoices.find({"user_id": uid}, {"_id": 0}).to_list(200)
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

@api_router.get("/wallet")
async def get_wallet(user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    txns = await db.transactions.find({"user_id": uid}, {"_id": 0}).to_list(200)
    txns.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    fresh = await db.users.find_one({"_id": user["_id"]})
    return {"saldo_kredit": fresh.get("saldo_kredit", 0), "transactions": txns}

@api_router.post("/wallet/topup")
async def topup(payload: TopupInput, user: dict = Depends(get_current_user)):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Nominal top-up tidak valid")
    uid = str(user["_id"])
    await db.users.update_one({"_id": user["_id"]}, {"$inc": {"saldo_kredit": payload.amount}})
    txn = {"id": str(uuid.uuid4()), "user_id": uid, "type": "topup", "amount": payload.amount,
           "deskripsi": f"Top-up saldo via {payload.method}", "created_at": datetime.now(timezone.utc).isoformat()}
    await db.transactions.insert_one(dict(txn))
    fresh = await db.users.find_one({"_id": user["_id"]})
    return {"saldo_kredit": fresh.get("saldo_kredit", 0), "message": "Top-up berhasil"}

@api_router.post("/invoices/{invoice_id}/pay")
async def pay_invoice(invoice_id: str, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    inv = await db.invoices.find_one({"id": invoice_id, "user_id": uid})
    if not inv:
        raise HTTPException(status_code=404, detail="Tagihan tidak ditemukan")
    if inv["status"] == "Paid":
        raise HTTPException(status_code=400, detail="Tagihan sudah dibayar")
    fresh = await db.users.find_one({"_id": user["_id"]})
    if fresh.get("saldo_kredit", 0) < inv["jumlah_tagihan"]:
        raise HTTPException(status_code=400, detail="Saldo tidak cukup. Silakan top-up terlebih dahulu.")
    await db.users.update_one({"_id": user["_id"]}, {"$inc": {"saldo_kredit": -inv["jumlah_tagihan"]}})
    await db.invoices.update_one({"id": invoice_id, "user_id": uid}, {"$set": {"status": "Paid"}})
    await db.transactions.insert_one({"id": str(uuid.uuid4()), "user_id": uid, "type": "payment",
        "amount": -inv["jumlah_tagihan"], "deskripsi": f"Pembayaran {invoice_id}",
        "created_at": datetime.now(timezone.utc).isoformat()})
    return {"message": "Pembayaran berhasil"}

@api_router.post("/services/order")
async def order_service(payload: OrderInput, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    product = next((p for p in PRODUCTS if p["id"] == payload.product_id), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak ditemukan")
    if not payload.domain.strip():
        raise HTTPException(status_code=400, detail="Domain wajib diisi")
    now = datetime.now(timezone.utc)
    due = (now + timedelta(days=30)).date().isoformat()
    service = {"id": str(uuid.uuid4()), "user_id": uid, "nama_produk": product["nama_produk"],
               "domain": payload.domain.strip(), "status": "Active", "persentase_penggunaan_disk": 2,
               "tanggal_jatuh_tempo_selanjutnya": due, "ip": "103.171.44." + str(100 + (now.second % 150)),
               "nameserver": "ns1.hostnesia.id", "created_at": now.date().isoformat()}
    await db.services.insert_one(dict(service))
    inv_id = "INV-" + now.strftime("%Y%m%d%H%M")
    await db.invoices.insert_one({"id": inv_id, "user_id": uid, "jumlah_tagihan": product["harga"],
        "status": "Unpaid", "tanggal_jatuh_tempo": (now + timedelta(days=7)).date().isoformat(),
        "deskripsi": f"Aktivasi {product['nama_produk']} ({payload.domain.strip()})",
        "created_at": now.isoformat()})
    service.pop("_id", None)
    return {"message": "Layanan berhasil dipesan", "service": service, "invoice_id": inv_id}

@api_router.post("/services/{service_id}/dns")
async def add_dns(service_id: str, payload: DnsInput, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    svc = await db.services.find_one({"id": service_id, "user_id": uid})
    if not svc:
        raise HTTPException(status_code=404, detail="Layanan tidak ditemukan")
    record = {"id": str(uuid.uuid4()), "user_id": uid, "service_id": service_id, "type": payload.type,
              "name": payload.name, "value": payload.value, "ttl": payload.ttl,
              "created_at": datetime.now(timezone.utc).isoformat()}
    await db.dns_records.insert_one(dict(record))
    record.pop("_id", None)
    return {"message": f"Record {payload.type} berhasil ditambahkan", "record": record}

@api_router.post("/services/{service_id}/email")
async def create_email(service_id: str, payload: EmailInput, user: dict = Depends(get_current_user)):
    uid = str(user["_id"])
    svc = await db.services.find_one({"id": service_id, "user_id": uid})
    if not svc:
        raise HTTPException(status_code=404, detail="Layanan tidak ditemukan")
    address = f"{payload.username.strip()}@{svc['domain']}"
    account = {"id": str(uuid.uuid4()), "user_id": uid, "service_id": service_id, "email": address,
               "quota": payload.quota, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.email_accounts.insert_one(dict(account))
    account.pop("_id", None)
    return {"message": f"Akun email {address} berhasil dibuat", "account": account}

# ---------------------------------------------------------------------------
# App wiring
# ---------------------------------------------------------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await seed()
    logger.info("HostNesia API ready")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
