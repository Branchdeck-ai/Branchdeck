import requests
import jwt
import time
import json

SUPABASE_JWT_SECRET = "super-secret-supabase-jwt-key-for-local-dev"
BACKEND_URL = "http://127.0.0.1:8000"

def create_jwt(email, user_id):
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "role": "authenticated",
        "iat": now,
        "exp": now + 3600
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")

def run_tests():
    admin_token = create_jwt("adelmuhammed786@gmail.com", "usr-admin-adel")
    non_admin_token = create_jwt("client.user@company.com", "usr-nonadmin-123")

    print("=================== 1. ADMIN AUTHORIZED ACCESS TEST ===================")
    headers_admin = {"Authorization": f"Bearer {admin_token}"}
    res_admin = requests.get(f"{BACKEND_URL}/api/admin/overview", headers=headers_admin)
    print(f"Admin GET /api/admin/overview -> Status Code: {res_admin.status_code}")
    assert res_admin.status_code == 200, f"Expected 200, got {res_admin.status_code}"
    data_admin = res_admin.json()
    print(f"Success: {data_admin.get('success')}")
    print(f"Loaded {len(data_admin.get('organizations', []))} organizations!")
    if data_admin.get('organizations'):
        sample_org = data_admin['organizations'][0]
        print(f"Sample Org: ID={sample_org['id']}, Owner={sample_org['owner_email']}, Budget=${sample_org['monthly_budget_usd']}, Spend=${sample_org['total_spend_usd']}")

    print("\n=================== 2. NON-ADMIN UNAUTHORIZED 404 TEST ===================")
    headers_non_admin = {"Authorization": f"Bearer {non_admin_token}"}
    res_non_admin = requests.get(f"{BACKEND_URL}/api/admin/overview", headers=headers_non_admin)
    print(f"Non-Admin GET /api/admin/overview -> Status Code: {res_non_admin.status_code}")
    assert res_non_admin.status_code == 404, f"Expected 404 Not Found, got {res_non_admin.status_code}"
    print("[PASS] Non-admin access correctly returned 404 Not Found!")

    print("\n=================== 3. UNAUTHENTICATED 404 TEST ===================")
    res_unauth = requests.get(f"{BACKEND_URL}/api/admin/overview")
    print(f"Unauthenticated GET /api/admin/overview -> Status Code: {res_unauth.status_code}")
    assert res_unauth.status_code == 401 or res_unauth.status_code == 404, f"Expected 401/404, got {res_unauth.status_code}"
    print("[PASS] Unauthenticated call blocked!")

    print("\n=================== 4. NON-ADMIN BUDGET UPDATE 404 TEST ===================")
    res_bad_budget = requests.post(
        f"{BACKEND_URL}/api/admin/budget",
        headers=headers_non_admin,
        json={"organization_id": "org-demo-acme", "monthly_budget_usd": 9999.0}
    )
    print(f"Non-Admin POST /api/admin/budget -> Status Code: {res_bad_budget.status_code}")
    assert res_bad_budget.status_code == 404, f"Expected 404 Not Found, got {res_bad_budget.status_code}"
    print("[PASS] Non-admin budget update correctly returned 404 Not Found!")

    print("\n=================== 5. ADMIN BUDGET UPDATE TEST ===================")
    res_budget = requests.post(
        f"{BACKEND_URL}/api/admin/budget",
        headers=headers_admin,
        json={"organization_id": "org-demo-acme", "monthly_budget_usd": 750.0}
    )
    print(f"Admin POST /api/admin/budget -> Status Code: {res_budget.status_code}")
    assert res_budget.status_code == 200, f"Expected 200, got {res_budget.status_code}"
    print(f"Admin Budget Update Result: {res_budget.json()}")
    print("[PASS] Admin budget update succeeded!")

if __name__ == "__main__":
    run_tests()
