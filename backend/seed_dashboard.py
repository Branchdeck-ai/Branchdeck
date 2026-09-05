"""seed_dashboard.py — inserts realistic seed/dev data for the Branchdeck client retainer dashboard.

DEVELOPMENT / SEED DATA ONLY — NOT FOR PRODUCTION USE.

Run once against a local or staging Postgres/SQLite instance:
    python seed_dashboard.py

Uses the DATABASE_URL env var (falls back to local postgres/sqlite).
Safe to re-run: checks for existing seed records before inserting.
"""

import os
import random
import uuid
from datetime import datetime, timedelta, timezone

from database import setup_db, Base, SessionLocal, init_db, Repository, OrgMembership, OrgSettings, Integration, CostLog

SEED_USER_ID = os.getenv("SEED_USER_ID", "user-demo-001")

# Multi-organization seed configuration
SEED_ORGANIZATIONS = [
    {
        "org_id": "org-demo-acme",
        "repo_name": "acme-backend",
        "monthly_budget": 500.0,
        "integrations": [
            {
                "name": "Semantic Code Search",
                "type": "search",
                "status": "active_retainer",
                "pr_url": "https://github.com/acme/backend/pull/142",
                "ast_match_score": 0.994,
            },
            {
                "name": "AI Support Agent",
                "type": "support_agent",
                "status": "active_retainer",
                "pr_url": "https://github.com/acme/backend/pull/155",
                "ast_match_score": 0.981,
            },
            {
                "name": "Invoice Document Processing",
                "type": "document_processing",
                "status": "merged",
                "pr_url": "https://github.com/acme/backend/pull/161",
                "ast_match_score": 0.973,
            },
            {
                "name": "Smart Search v2 (Hybrid BM25 + Vector)",
                "type": "search",
                "status": "pr_ready",
                "pr_url": "https://github.com/acme/backend/pull/174",
                "ast_match_score": 0.988,
            },
            {
                "name": "Contract Review Agent",
                "type": "document_processing",
                "status": "in_progress",
                "pr_url": None,
                "ast_match_score": None,
            },
        ],
    },
    {
        "org_id": "org-demo-globex",
        "repo_name": "globex-logistics-api",
        "monthly_budget": 750.0,
        "integrations": [
            {
                "name": "Shipment Tracking Assistant",
                "type": "support_agent",
                "status": "active_retainer",
                "pr_url": "https://github.com/globex/logistics-api/pull/88",
                "ast_match_score": 0.989,
            },
            {
                "name": "Customs Form OCR Pipeline",
                "type": "document_processing",
                "status": "merged",
                "pr_url": "https://github.com/globex/logistics-api/pull/92",
                "ast_match_score": 0.965,
            },
            {
                "name": "Warehouse Inventory Semantic Search",
                "type": "search",
                "status": "in_progress",
                "pr_url": None,
                "ast_match_score": None,
            },
        ],
    },
    {
        "org_id": "org-demo-stark",
        "repo_name": "stark-os",
        "monthly_budget": 1200.0,
        "integrations": [
            {
                "name": "Jarvis Telemetry Analyst",
                "type": "support_agent",
                "status": "active_retainer",
                "pr_url": "https://github.com/stark/stark-os/pull/301",
                "ast_match_score": 0.998,
            },
            {
                "name": "Schematic Blueprints Parser",
                "type": "document_processing",
                "status": "pr_ready",
                "pr_url": "https://github.com/stark/stark-os/pull/310",
                "ast_match_score": 0.991,
            },
        ],
    },
]

TYPE_PROFILES = {
    "search": dict(tokens_in=(200, 80), tokens_out=(400, 100), cost_usd=(0.003, 0.001), latency_ms=(320, 60)),
    "support_agent": dict(tokens_in=(800, 200), tokens_out=(1200, 300), cost_usd=(0.015, 0.004), latency_ms=(890, 150)),
    "document_processing": dict(tokens_in=(2000, 400), tokens_out=(500, 100), cost_usd=(0.022, 0.006), latency_ms=(1400, 200)),
}

CALLS_PER_DAY_PER_INTEGRATION = {
    "active_retainer": (40, 15),
    "merged": (10, 5),
    "pr_ready": (2, 1),
    "in_progress": (0, 0),
}


def gauss_int(mu: float, sigma: float, min_val: int = 0) -> int:
    return max(min_val, int(random.gauss(mu, sigma)))


def seed():
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")
    setup_db(DATABASE_URL)
    init_db()

    db = SessionLocal()
    try:
        total_seed_logs = 0

        for org_config in SEED_ORGANIZATIONS:
            org_id = org_config["org_id"]
            repo_name = org_config["repo_name"]
            monthly_budget = org_config["monthly_budget"]

            # 1. Org membership
            membership = db.query(OrgMembership).filter_by(user_id=SEED_USER_ID, organization_id=org_id).first()
            if not membership:
                membership = OrgMembership(user_id=SEED_USER_ID, organization_id=org_id, role="owner")
                db.add(membership)
                db.commit()
                print(f"  [DEV SEED] Created org membership: {SEED_USER_ID} -> {org_id}")

            # 2. Org settings
            settings = db.query(OrgSettings).filter_by(organization_id=org_id).first()
            if not settings:
                settings = OrgSettings(organization_id=org_id, monthly_budget_usd=monthly_budget)
                db.add(settings)
                db.commit()
                print(f"  [DEV SEED] Created org_settings: budget=${monthly_budget} for {org_id}")

            # 3. Repository
            repo = db.query(Repository).filter_by(organization_id=org_id, name=repo_name).first()
            if not repo:
                repo = Repository(organization_id=org_id, name=repo_name)
                db.add(repo)
                db.commit()
                db.refresh(repo)
                print(f"  [DEV SEED] Created repo: {repo.name} ({repo.id})")

            # 4. Integrations & Cost logs
            integration_objects = []
            for spec in org_config["integrations"]:
                existing = db.query(Integration).filter_by(
                    organization_id=org_id, name=spec["name"]
                ).first()
                if existing:
                    if existing.ast_match_score is None and spec["ast_match_score"] is not None:
                        existing.ast_match_score = spec["ast_match_score"]
                        db.commit()
                    integration_objects.append(existing)
                    continue

                days_ago = random.randint(5, 60)
                created = datetime.now(timezone.utc) - timedelta(days=days_ago)
                integ = Integration(
                    id=str(uuid.uuid4()),
                    repo_id=repo.id,
                    organization_id=org_id,
                    name=spec["name"],
                    type=spec["type"],
                    status=spec["status"],
                    pr_url=spec.get("pr_url"),
                    ast_match_score=spec.get("ast_match_score"),
                    created_at=created,
                    updated_at=created + timedelta(days=random.randint(1, days_ago)),
                )
                db.add(integ)
                db.commit()
                db.refresh(integ)
                integration_objects.append(integ)
                print(f"  [DEV SEED] Created integration: {integ.name} ({integ.status})")

            # 5. Cost logs (30 days)
            DAYS = 30
            for integ in integration_objects:
                existing_count = db.query(CostLog).filter_by(integration_id=integ.id).count()
                if existing_count > 0:
                    continue

                profile = TYPE_PROFILES[integ.type]
                calls_mu, calls_sigma = CALLS_PER_DAY_PER_INTEGRATION[integ.status]

                for day_offset in range(DAYS, 0, -1):
                    day_start = datetime.now(timezone.utc) - timedelta(days=day_offset)
                    calls_today = gauss_int(calls_mu, calls_sigma)
                    for _ in range(calls_today):
                        ts = day_start + timedelta(
                            hours=random.randint(0, 23),
                            minutes=random.randint(0, 59),
                            seconds=random.randint(0, 59),
                        )
                        tokens_in = gauss_int(*profile["tokens_in"], min_val=50)
                        tokens_out = gauss_int(*profile["tokens_out"], min_val=50)
                        cost_usd = max(0.0001, random.gauss(*profile["cost_usd"]))
                        latency_ms = gauss_int(*profile["latency_ms"], min_val=50)

                        log = CostLog(
                            id=str(uuid.uuid4()),
                            integration_id=integ.id,
                            tokens_in=tokens_in,
                            tokens_out=tokens_out,
                            cost_usd=round(cost_usd, 6),
                            latency_ms=latency_ms,
                            timestamp=ts,
                        )
                        db.add(log)
                        total_seed_logs += 1

                db.commit()

        print(f"\n[DEV SEED COMPLETE] Total cost log records inserted: {total_seed_logs}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
