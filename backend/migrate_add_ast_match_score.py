"""migrate_add_ast_match_score.py — Add ast_match_score column to integrations table if not present."""

import os
from sqlalchemy import text
from database import engine

def migrate():
    print("Running migration: add ast_match_score to integrations...")
    with engine.begin() as conn:
        try:
            # PostgreSQL / SQLite ALTER TABLE
            conn.execute(text("ALTER TABLE integrations ADD COLUMN ast_match_score FLOAT NULL;"))
            print("Successfully added ast_match_score column to integrations table.")
        except Exception as e:
            if "duplicate column" in str(e).lower() or "already exists" in str(e).lower():
                print("Column ast_match_score already exists. Migration skipped.")
            else:
                print(f"Migration note: {e}")

if __name__ == "__main__":
    migrate()
