#!/usr/bin/env python3
"""
Pre-Deploy Safeguard Audit Script: audit_mock_fallbacks.py
Scans the frontend (webapp/src) and backend codebase for suspicious hardcoded
identifiers, mock fallbacks, synthetic repo/integration IDs, or improper formatting calculations.

Rule: An empty or loading state must NEVER render a hardcoded object that looks like real data.
Every metric, ID, and URL shown in the UI must trace back to real database records.
"""

import os
import sys
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TARGET_DIRS = [
    os.path.join(ROOT_DIR, "webapp", "src"),
    os.path.join(ROOT_DIR, "backend"),
]

EXCLUDE_DIRS = {
    "node_modules",
    ".next",
    "venv",
    "__pycache__",
    "scratch",
    "test_repos",
    "dist",
    "build",
}

EXCLUDE_FILES = {
    "seed_dashboard.py",
    "test_api.py",
}

# Suspicious patterns to flag in production UI / backend paths
SUSPICIOUS_PATTERNS = [
    (r"branchdeck-core", "Hardcoded fallback repo identifier 'branchdeck-core'"),
    (r"org-demo-acme", "Hardcoded fallback organization 'org-demo-acme'"),
    (r"org_demo_123", "Hardcoded fallback org switcher 'org_demo_123'"),
    (r"\binteg-[0-9]+\b", "Synthetic mock integration ID (e.g. integ-1, integ-2)"),
    (r"\brepo-[0-9]+\b", "Synthetic mock repository ID (e.g. repo-1)"),
    (r"branchdeck-ai/main-app", "Synthetic mock repository name 'branchdeck-ai/main-app'"),
    (r"acme/main-app", "Synthetic mock repository name 'acme/main-app'"),
    (r"acme/backend", "Synthetic mock repository name 'acme/backend'"),
    (r"https://github\.com/branchdeck-ai/", "Synthetic mock GitHub URL 'branchdeck-ai'"),
    (r"https://github\.com/acme/", "Synthetic mock GitHub URL 'acme'"),
    (r"DEMO_INTEGRATIONS", "Hardcoded seed object 'DEMO_INTEGRATIONS'"),
    (r"DEMO_SUMMARY", "Hardcoded seed object 'DEMO_SUMMARY'"),
    (r"DEMO_REPOS", "Hardcoded seed object 'DEMO_REPOS'"),
    (r"repos\.length\s*===\s*0\s*\?\s*\[", "Hardcoded array fallback for empty repos state"),
    (r"integrations\.length\s*===\s*0\s*\?\s*\[", "Hardcoded array fallback for empty integrations state"),
    (r"mock-ecommerce", "Hardcoded mock ecommerce dataset fallback"),
    (r"ast_match_score\s*\*\s*100\b", "Improper 100x multiplication formatting calculation on ast_match_score"),
]

def run_audit():
    findings = []
    scanned_files = 0

    print("==========================================================")
    print("      BRANCHDECK PRE-DEPLOY MOCK FALLBACK AUDIT ENGINE    ")
    print("==========================================================")

    for target_dir in TARGET_DIRS:
        if not os.path.exists(target_dir):
            continue

        for root, dirs, files in os.walk(target_dir):
            # Prune excluded directories
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]

            for file in files:
                if file in EXCLUDE_FILES or not file.endswith((".ts", ".tsx", ".js", ".jsx", ".py")):
                    continue

                filepath = os.path.join(root, file)
                relpath = os.path.relpath(filepath, ROOT_DIR)
                scanned_files += 1

                try:
                    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()

                    for idx, line in enumerate(lines, 1):
                        for pattern, desc in SUSPICIOUS_PATTERNS:
                            if re.search(pattern, line):
                                findings.append({
                                    "file": relpath,
                                    "line": idx,
                                    "content": line.strip(),
                                    "reason": desc
                                })
                except Exception as e:
                    print(f"Warning: Could not read {relpath}: {e}")

    print(f"\nScanned {scanned_files} source files across webapp/src & backend.")

    if findings:
        print(f"\n[FAIL] Found {len(findings)} potential hardcoded mock fallback(s):\n")
        for idx, f in enumerate(findings, 1):
            print(f"  {idx}. {f['file']}:{f['line']}")
            print(f"     Reason:  {f['reason']}")
            print(f"     Snippet: {f['content']}\n")
        print("[FAIL] PRE-DEPLOY AUDIT FAILED: Clean up hardcoded mock fallbacks before deploying!")
        sys.exit(1)
    else:
        print("\n[PASS] No hardcoded mock fallbacks or suspicious demo identifiers detected.")
        print("[OK] Codebase adheres to the standing rule: empty/loading states render genuine empty state UIs.")
        sys.exit(0)

if __name__ == "__main__":
    run_audit()
