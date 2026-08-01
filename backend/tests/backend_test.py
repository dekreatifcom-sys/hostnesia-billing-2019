"""HostNesia backend API tests."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://hostnesia-client.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

EMAIL = "dekreatif.com@gmail.com"
PASSWORD = "HostNesia123!"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": EMAIL, "password": PASSWORD}, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and "user" in data
    assert data["user"]["email"] == EMAIL
    return data["token"]


@pytest.fixture(scope="session")
def auth(token):
    return {"Authorization": f"Bearer {token}"}


# ---------------------------- Auth ---------------------------------
def test_login_invalid():
    r = requests.post(f"{API}/auth/login", json={"email": EMAIL, "password": "wrong"}, timeout=30)
    assert r.status_code == 401


def test_me(auth):
    r = requests.get(f"{API}/auth/me", headers=auth, timeout=30)
    assert r.status_code == 200
    assert r.json()["email"] == EMAIL


def test_me_unauth():
    r = requests.get(f"{API}/auth/me", timeout=30)
    assert r.status_code == 401


# ---------------------------- Services -----------------------------
def test_services_seeded(auth):
    r = requests.get(f"{API}/services", headers=auth, timeout=30)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 4
    for s in items[:4]:
        assert "id" in s and "domain" in s and "status" in s


def test_products(auth):
    r = requests.get(f"{API}/products", headers=auth, timeout=30)
    assert r.status_code == 200
    assert len(r.json()) == 4


# ---------------------------- Invoices -----------------------------
def test_invoices_seeded(auth):
    r = requests.get(f"{API}/invoices", headers=auth, timeout=30)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 4
    unpaid = [i for i in items if i["status"] == "Unpaid"]
    assert len(unpaid) >= 2


# ---------------------------- Wallet -------------------------------
def test_wallet(auth):
    r = requests.get(f"{API}/wallet", headers=auth, timeout=30)
    assert r.status_code == 200
    data = r.json()
    assert "saldo_kredit" in data
    assert isinstance(data["transactions"], list)
    assert len(data["transactions"]) >= 4


def test_topup_and_balance_increases(auth):
    before = requests.get(f"{API}/wallet", headers=auth, timeout=30).json()["saldo_kredit"]
    r = requests.post(f"{API}/wallet/topup", headers=auth, json={"amount": 50000, "method": "Transfer Bank"}, timeout=30)
    assert r.status_code == 200
    after = r.json()["saldo_kredit"]
    assert after == before + 50000


def test_topup_invalid_amount(auth):
    r = requests.post(f"{API}/wallet/topup", headers=auth, json={"amount": 0}, timeout=30)
    assert r.status_code == 400


# ---------------------------- Order flow ---------------------------
def test_order_service_creates_service_and_invoice(auth):
    invoices_before = requests.get(f"{API}/invoices", headers=auth, timeout=30).json()
    services_before = requests.get(f"{API}/services", headers=auth, timeout=30).json()

    r = requests.post(f"{API}/services/order", headers=auth,
                      json={"product_id": "prod-startup", "domain": "test-order.example.com", "cycle": "Bulanan"}, timeout=30)
    assert r.status_code == 200, r.text
    body = r.json()
    assert "service" in body and body["service"]["domain"] == "test-order.example.com"
    inv_id = body["invoice_id"]

    invoices_after = requests.get(f"{API}/invoices", headers=auth, timeout=30).json()
    services_after = requests.get(f"{API}/services", headers=auth, timeout=30).json()
    assert len(services_after) == len(services_before) + 1
    assert any(i["id"] == inv_id and i["status"] == "Unpaid" for i in invoices_after)


def test_order_invalid_product(auth):
    r = requests.post(f"{API}/services/order", headers=auth,
                      json={"product_id": "bogus", "domain": "x.com"}, timeout=30)
    assert r.status_code == 404


# ---------------------------- Pay invoice --------------------------
def test_pay_invoice_insufficient_balance(auth):
    # Create a very expensive invoice by ordering many services? Instead order one and drain balance path is complex.
    # Simpler: find an unpaid invoice with amount > saldo. If saldo is enough, top-down: order a very expensive product? Not possible.
    # Approach: drain balance via multiple payments? Just try paying while balance is < any invoice: not deterministic.
    # Instead: use a fake invoice id - returns 404, not what we want. Skip if all payable.
    wallet = requests.get(f"{API}/wallet", headers=auth, timeout=30).json()
    invoices = requests.get(f"{API}/invoices", headers=auth, timeout=30).json()
    unpaid = [i for i in invoices if i["status"] == "Unpaid"]
    if not unpaid:
        pytest.skip("no unpaid invoice")
    # Find an unpaid invoice bigger than balance
    too_big = [i for i in unpaid if i["jumlah_tagihan"] > wallet["saldo_kredit"]]
    if not too_big:
        pytest.skip("balance covers all invoices; cannot test insufficient path deterministically")
    r = requests.post(f"{API}/invoices/{too_big[0]['id']}/pay", headers=auth, timeout=30)
    assert r.status_code == 400
    assert "Saldo tidak cukup" in r.json().get("detail", "")


def test_pay_invoice_success(auth):
    invoices = requests.get(f"{API}/invoices", headers=auth, timeout=30).json()
    wallet = requests.get(f"{API}/wallet", headers=auth, timeout=30).json()
    unpaid = [i for i in invoices if i["status"] == "Unpaid" and i["jumlah_tagihan"] <= wallet["saldo_kredit"]]
    if not unpaid:
        # ensure balance
        requests.post(f"{API}/wallet/topup", headers=auth, json={"amount": 500000}, timeout=30)
        invoices = requests.get(f"{API}/invoices", headers=auth, timeout=30).json()
        unpaid = [i for i in invoices if i["status"] == "Unpaid"]
    target = unpaid[0]
    before = requests.get(f"{API}/wallet", headers=auth, timeout=30).json()["saldo_kredit"]
    r = requests.post(f"{API}/invoices/{target['id']}/pay", headers=auth, timeout=30)
    assert r.status_code == 200, r.text
    after_wallet = requests.get(f"{API}/wallet", headers=auth, timeout=30).json()
    assert after_wallet["saldo_kredit"] == before - target["jumlah_tagihan"]
    # invoice now Paid
    inv = [i for i in requests.get(f"{API}/invoices", headers=auth, timeout=30).json() if i["id"] == target["id"]][0]
    assert inv["status"] == "Paid"
    # payment txn recorded
    assert any(t["type"] == "payment" and t["deskripsi"].endswith(target["id"]) for t in after_wallet["transactions"])


def test_pay_invoice_already_paid(auth):
    invoices = requests.get(f"{API}/invoices", headers=auth, timeout=30).json()
    paid = [i for i in invoices if i["status"] == "Paid"]
    if not paid:
        pytest.skip("no paid invoice yet")
    r = requests.post(f"{API}/invoices/{paid[0]['id']}/pay", headers=auth, timeout=30)
    assert r.status_code == 400


# ---------------------------- DNS & Email --------------------------
def test_dns_and_email(auth):
    services = requests.get(f"{API}/services", headers=auth, timeout=30).json()
    sid = services[0]["id"]
    r = requests.post(f"{API}/services/{sid}/dns", headers=auth,
                      json={"type": "A", "name": "www", "value": "1.2.3.4"}, timeout=30)
    assert r.status_code == 200
    assert "record" in r.json()

    r2 = requests.post(f"{API}/services/{sid}/email", headers=auth,
                       json={"username": "info", "password": "Str0ng!Pass"}, timeout=30)
    assert r2.status_code == 200
    assert r2.json()["account"]["email"].startswith("info@")


def test_dns_invalid_service(auth):
    r = requests.post(f"{API}/services/does-not-exist/dns", headers=auth,
                      json={"type": "A", "name": "x", "value": "1.1.1.1"}, timeout=30)
    assert r.status_code == 404
