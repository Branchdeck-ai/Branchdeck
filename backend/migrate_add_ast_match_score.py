"""migrate_add_ast_match_score.py
Adds the `ast_match_score` column to the `integrations` table.

Safe to run multiple times (checks for column existence first).
Run from backend/:
    python migrate_add_ast_match_score.py
"""
import os
import logging
from sqlalchemy import create_engine, text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("migration")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")


def run():
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    with engine.begin() as conn:
        if DATABASE_URL.startswith("sqlite"):
            # SQLite: PRAGMA table_info to check existence
            rows = conn.execute(text("PRAGMA table_info(integrations)")).fetchall()
            col_names = [r[1] for r in rows]
            if "ast_match_score" in col_names:
                logger.info("Column already exists on SQLite — nothing to do.")
                return
            conn.execute(text(
                "ALTER TABLE integrations ADD COLUMN ast_match_score REAL"
            ))
            logger.info("Added ast_match_score (REAL) to integrations [SQLite].")
        else:
            # PostgreSQL: check information_schema
            exists = conn.execute(text("""
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'integrations'
                  AND column_name = 'ast_match_score'
            """)).scalar()

            if exists:
                logger.info("Column already exists on PostgreSQL — nothing to do.")
                return

            conn.execute(text(
                "ALTER TABLE integrations ADD COLUMN ast_match_score DOUBLE PRECISION"
            ))
            logger.info("Added ast_match_score (DOUBLE PRECISION) to integrations [PostgreSQL].")

    logger.info("Migration complete.")


if __name__ == "__main__":
    run()
