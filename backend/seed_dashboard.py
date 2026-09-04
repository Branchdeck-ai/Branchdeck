"""seed_dashboard.py — inserts realistic dev data for the retainer dashboard.

Run once against a local or staging Postgres instance:
    python seed_dashboard.py

Uses the DATABASE_URL env var (falls back to the default local Postgres).
Safe to re-run: checks for existing seed records before inserting.
"""

import os
import random
import uuid
from datetime import datetime, timedelta, timezone

from database import setup_db, Base, SessionLocal, init_db, Repository, OrgMembership, OrgSettings, Integration, CostLog

# ---------------------------------------------------------------------------
# Seed configuration
# ---------------------------------------------------------------------------

SEED_ORG_ID = os.getenv("SEED_ORG_ID", "org-demo-acme")
SEED_USER_ID = os.getenv("SEED_USER_ID", "user-demo-001")

INTEGRATIONS_SPEC = [
    {
        "name": "Semantic Code Search",
        "type": "search",
        "status": "active_retainer",
        "pr_url": "https://github.com/acme/backend/pull/142",
        "ast_match_score": 0.994,   # 99.4 % — matches marketing mockup
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
        "ast_match_score": None,    # in_progress: AST engine hasn't scored it yet
    },
]

# Rough per-call cost profile per integration type (tokens_in, tokens_out, cost_usd mean, latency_ms mean)
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
        # 1. Ensure org membership exists
        membership = db.query(OrgMembership).filter_by(user_id=SEED_USER_ID, organization_id=SEED_ORG_ID).first()
        if not membership:
            membership = OrgMembership(user_id=SEED_USER_ID, organization_id=SEED_ORG_ID, role="owner")
            db.add(membership)
            db.commit()
            print(f"  Created org membership: {SEED_USER_ID} -> {SEED_ORG_ID}")
        else:
            print(f"  Org membership already exists, skipping.")

        # 1b. Ensure org_settings exists (monthly budget)
        settings = db.query(OrgSettings).filter_by(organization_id=SEED_ORG_ID).first()
        if not settings:
            settings = OrgSettings(organization_id=SEED_ORG_ID, monthly_budget_usd=500.0)
            db.add(settings)
            db.commit()
            print(f"  Created org_settings: monthly_budget_usd=500.0 for {SEED_ORG_ID}")
        else:
            print(f"  Org settings already exist: monthly_budget_usd={settings.monthly_budget_usd}")

        # 2. Ensure a repo exists for this org
        repo = db.query(Repository).filter_by(organization_id=SEED_ORG_ID).first()
        if not repo:
            repo = Repository(organization_id=SEED_ORG_ID, name="acme-backend")
            db.add(repo)
            db.commit()
            db.refresh(repo)
            print(f"  Created repo: {repo.id} (acme-backend)")
        else:
            print(f"  Repo already exists: {repo.id} ({repo.name})")

        # 3. Seed integrations (skip existing by name+org; backfill ast_match_score if missing)
        integration_objects = []
        for spec in INTEGRATIONS_SPEC:
            existing = db.query(Integration).filter_by(
                organization_id=SEED_ORG_ID, name=spec["name"]
            ).first()
            if existing:
                # Backfill ast_match_score if it's still NULL and the spec has a value
                if existing.ast_match_score is None and spec["ast_match_score"] is not None:
                    existing.ast_match_score = spec["ast_match_score"]
                    db.commit()
                    print(f"  Backfilled ast_match_score={spec['ast_match_score']} on: {spec['name']}")
                else:
                    print(f"  Integration already exists: {spec['name']}")
                integration_objects.append(existing)
                continue

            days_ago = random.randint(5, 60)
            created = datetime.now(timezone.utc) - timedelta(days=days_ago)
            integ = Integration(
                id=str(uuid.uuid4()),
                repo_id=repo.id,
                organization_id=SEED_ORG_ID,
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
            print(f"  Created integration: {integ.name} ({integ.status}, ast_match_score={integ.ast_match_score})")

        # 4. Seed cost logs — 30 days of realistic call history
        DAYS = 30
        total_logs = 0
        for integ in integration_objects:
            # Check if this integration already has logs
            existing_count = db.query(CostLog).filter_by(integration_id=integ.id).count()
            if existing_count > 0:
                print(f"  CostLogs already exist for {integ.name} ({existing_count} rows), skipping.")
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
                    total_logs += 1

            db.commit()
            print(f"  Seeded cost logs for: {integ.name}")

        print(f"\nSeed complete. Total new cost log rows: {total_logs}")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
