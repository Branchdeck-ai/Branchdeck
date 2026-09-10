'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Building2,
  ShieldCheck,
  DollarSign,
  Loader2,
  GitBranch,
  Key,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FeatureCatalog from '@/components/FeatureCatalog';
import { isAdminUser } from '@/lib/admin';
import Stepper, { Step } from '@/components/Stepper';

function BranchdeckLogo({ className = 'w-7 h-7 object-contain rounded-lg' }: { className?: string }) {
  return <img src="/logo.png" alt="Branchdeck Logo" className={className} />;
}

export default function OnboardingPage() {
  const [session, setSession] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [initLoading, setInitLoading] = useState(true);

  /* Stepper-driven step index (1-based, matches Stepper internals) */
  const [currentStep, setCurrentStep] = useState(1);

  /* Step 1 — Connect Repo */
  const [repoUrl, setRepoUrl] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectedRepo, setConnectedRepo] = useState<any>(null);
  const [showPatFallback, setShowPatFallback] = useState(false);

  /* Step 2 — Request AI Feature */
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);
  const [genPrUrl, setGenPrUrl] = useState<string | null>(null);

  /* ─── Initialise ─────────────────────────────────────────── */
  useEffect(() => {
    let isMounted = true;

    async function initializeOnboarding(currentSession: any) {
      if (!currentSession) {
        if (typeof window !== 'undefined') window.location.href = '/';
        if (isMounted) setInitLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const isAppInstalled =
          urlParams.get('installation_id') || urlParams.get('github_connected') === 'true';
        const savedRepoStr = localStorage.getItem('branchdeck_connected_repo');

        if (savedRepoStr || isAppInstalled) {
          try {
            if (savedRepoStr) {
              const parsed = JSON.parse(savedRepoStr);
              setConnectedRepo(parsed);
            }
            setCurrentStep(2);
          } catch {
            setCurrentStep(2);
          }
        }
      }

      const token = currentSession.access_token;
      try {
        const orgRes = await fetch('/api/dashboard/organizations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orgJson = await orgRes.json();
        let targetOrg = null;

        if (orgJson.success && orgJson.organizations?.length > 0) {
          targetOrg = orgJson.organizations[0];
        } else {
          const provRes = await fetch('/api/dashboard/organizations/provision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              user_id: currentSession.user?.id,
              email: currentSession.user?.email,
            }),
          });
          const provJson = await provRes.json();
          if (provJson.success) {
            targetOrg = {
              id: provJson.organization_id,
              organization_id: provJson.organization_id,
              role: provJson.role,
              monthly_budget_usd: provJson.monthly_budget_usd,
            };
          }
        }

        if (!targetOrg) {
          if (isMounted) setInitLoading(false);
          return;
        }

        if (isMounted) setOrgData(targetOrg);

        const orgId = targetOrg.id || targetOrg.organization_id;
        let reposRes = await fetch(`/api/dashboard/repos?organization_id=${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let reposJson = await reposRes.json();

        if (!reposJson.success || !Array.isArray(reposJson.repos) || reposJson.repos.length === 0) {
          reposRes = await fetch('/api/dashboard/repos', {
            headers: { Authorization: `Bearer ${token}` },
          });
          reposJson = await reposRes.json();
        }

        if (reposJson.success && Array.isArray(reposJson.repos) && reposJson.repos.length > 0) {
          if (isMounted) {
            const activeRepo = reposJson.repos[0];
            setConnectedRepo(activeRepo);
            localStorage.setItem('branchdeck_connected_repo', JSON.stringify(activeRepo));
            setCurrentStep(2);
            setInitLoading(false);
          }
          return;
        }

        if (isMounted) setInitLoading(false);
      } catch (err) {
        console.error('[Branchdeck Onboarding] Initialization error:', err);
        if (isMounted) setInitLoading(false);
      }
    }

    if (!isSupabaseConfigured) { setInitLoading(false); return; }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        initializeOnboarding(s);
      } else {
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: retrySession } }) => {
            if (retrySession) {
              setSession(retrySession);
              initializeOnboarding(retrySession);
            } else {
              setInitLoading(false);
            }
          });
        }, 800);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) initializeOnboarding(s);
    });

    return () => { isMounted = false; subscription.unsubscribe(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Handlers ───────────────────────────────────────────── */
  const handleStartGitHubAppInstall = async () => {
    setConnectLoading(true);
    setConnectError(null);
    const fallbackAppUrl = 'https://github.com/apps/branchdeck-ai';
    try {
      const token = session?.access_token || '';
      const activeOrgId = orgData?.id || orgData?.organization_id || '';
      const res = await fetch(
        `/api/github/install-url?organization_id=${encodeURIComponent(activeOrgId)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (data && data.install_url) {
        window.location.href = data.install_url;
        return;
      }
      window.location.href = fallbackAppUrl;
    } catch (err: any) {
      window.location.href = fallbackAppUrl;
    }
  };

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() || !githubPat.trim()) {
      setConnectError('Please enter both repository URL and Personal Access Token (PAT).');
      return;
    }
    setConnectLoading(true);
    setConnectError(null);
    try {
      const token = session?.access_token || '';
      const activeOrgId = orgData?.id || orgData?.organization_id || '';
      const res = await fetch('/api/dashboard/repos/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          organization_id: activeOrgId,
          repo_url: repoUrl.trim(),
          github_pat: githubPat.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.detail || data.error || 'Failed to connect repository.');
      setConnectedRepo(data.repo);
      localStorage.setItem('branchdeck_connected_repo', JSON.stringify(data.repo));
      setCurrentStep(2);
    } catch (err: any) {
      setConnectError(err.message || 'Error connecting repository');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleGenerateFeature = async (featureDescription: string, model = 'gemini-2.5-flash') => {
    if (!featureDescription?.trim()) {
      setGenError('Please describe or select the AI feature you want to build.');
      return;
    }
    setGenLoading(true);
    setGenError(null);
    try {
      const token = session?.access_token || '';
      const activeOrgId = orgData?.id || orgData?.organization_id || '';
      const targetRepoId = connectedRepo?.id || '';
      const res = await fetch('/api/dashboard/integrations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          organization_id: activeOrgId,
          repo_id: targetRepoId,
          feature_description: featureDescription.trim(),
          model,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.detail || data.error || 'Failed to generate feature PR.');
      setGenSuccessMsg(data.message || 'AI feature code generated — GitHub PR created!');
      setGenPrUrl(data.integration?.pr_url || null);
      setCurrentStep(3);
    } catch (err: any) {
      setGenError(err.message || 'Error generating feature PR');
    } finally {
      setGenLoading(false);
    }
  };

  /* ─── Loading screen ─────────────────────────────────────── */
  if (initLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-700 font-mono text-sm shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Setting up your Branchdeck environment…</span>
        </div>
      </div>
    );
  }

  /* ─── Page ───────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">

      {/* ── Navbar ── */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BranchdeckLogo className="w-8 h-8 object-contain rounded-xl" />
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">
                Branchdeck
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md ml-2.5">
                Setup Wizard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {orgData && (
              <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-xs font-mono">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  {orgData.id || orgData.organization_id}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5" />
                  ${typeof orgData.monthly_budget_usd === 'number'
                    ? orgData.monthly_budget_usd.toFixed(2)
                    : '10.00'}/mo trial
                </span>
              </div>
            )}
            {isAdminUser(session?.user?.email) && (
              <button
                type="button"
                onClick={() => { window.location.href = '/admin'; }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => { window.location.href = '/dashboard'; }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Skip to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Wizard body ── */}
      <main className="flex-1 flex flex-col items-center justify-start py-10 px-4 sm:px-6">
        <div className="w-full max-w-2xl">
          <Stepper
            initialStep={currentStep}
            onStepChange={(s) => setCurrentStep(s)}
            onFinalStepCompleted={() => { window.location.href = '/dashboard'; }}
            backButtonText="← Back"
            nextButtonText="Continue →"
            /* Hide the stepper's own Next button on steps 1 & 2 —
               those steps have dedicated action CTAs (GitHub App / FeatureCatalog).
               On step 3 (confirmation) the stepper renders "Complete" which takes
               the user to /dashboard via onFinalStepCompleted.               */
            nextButtonProps={
              currentStep < 3
                ? { style: { display: 'none' } }
                : {}
            }
            disableStepIndicators
          >

            {/* ════════════════════════════════════════
                STEP 1 — Connect Repository
            ════════════════════════════════════════ */}
            <Step>
              <div className="space-y-5 pb-2">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    Step 1 of 3 — Repository Setup
                  </div>
                  <h2 className="bd-onboard-title">Connect Your GitHub Repository</h2>
                  <p className="bd-onboard-subtitle">
                    Connect your repo so Branchdeck can inspect your codebase architecture and
                    generate Pull Requests that match your existing code conventions.
                  </p>
                </div>

                {/* Error banner */}
                {connectError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
                    <div>
                      <p className="font-bold">Connection Error</p>
                      <p className="font-mono mt-0.5 text-[11px]">{connectError}</p>
                    </div>
                  </div>
                )}

                {/* GitHub App card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                        Recommended &amp; Instant
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 pt-1">
                        Connect via Branchdeck GitHub App
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        One-click authorisation with fine-grained repo permissions. No long-lived
                        tokens required.
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      disabled={connectLoading}
                      onClick={handleStartGitHubAppInstall}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      {connectLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /><span>Opening GitHub…</span></>
                      ) : (
                        <><span>Connect via GitHub App</span><ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* PAT toggle */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowPatFallback(!showPatFallback)}
                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline font-medium cursor-pointer"
                  >
                    {showPatFallback
                      ? '← Hide PAT option'
                      : 'Or connect using a Personal Access Token (PAT) →'}
                  </button>
                </div>

                {/* PAT form */}
                {showPatFallback && (
                  <div className="border-t border-slate-200 pt-4 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-blue-900 font-bold">
                        <Key className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        Required PAT Permissions
                      </div>
                      <ul className="text-slate-700 space-y-1 pl-6 list-disc font-mono text-[11px]">
                        <li>Repository Access: Select your target repository</li>
                        <li>
                          Permissions:{' '}
                          <strong className="text-slate-900">Contents (Read &amp; Write)</strong>,{' '}
                          <strong className="text-slate-900">Pull Requests (Read &amp; Write)</strong>
                        </li>
                      </ul>
                    </div>
                    <form onSubmit={handleConnectRepo} className="space-y-3">
                      <div>
                        <label className="bd-label">Repository URL *</label>
                        <input
                          type="text"
                          required
                          value={repoUrl}
                          onChange={(e) => setRepoUrl(e.target.value)}
                          placeholder="https://github.com/my-org/my-repo"
                          className="bd-input font-mono"
                        />
                      </div>
                      <div>
                        <label className="bd-label">Personal Access Token *</label>
                        <div className="relative">
                          <input
                            type={showPat ? 'text' : 'password'}
                            required
                            value={githubPat}
                            onChange={(e) => setGithubPat(e.target.value)}
                            placeholder="github_pat_11A… or ghp_…"
                            className="bd-input font-mono pr-14"
                            style={{ marginBottom: 0 }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPat(!showPat)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 text-xs font-bold"
                          >
                            {showPat ? 'Hide' : 'Show'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1.5">
                          <Lock className="w-3 h-3 text-emerald-600" />
                          Tokens are encrypted before being stored.
                        </p>
                      </div>
                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={connectLoading}
                          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                        >
                          {connectLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /><span>Connecting…</span></>
                          ) : (
                            <><span>Connect via PAT</span><ArrowRight className="w-4 h-4" /></>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </Step>

            {/* ════════════════════════════════════════
                STEP 2 — Select First AI Feature
            ════════════════════════════════════════ */}
            <Step>
              <div className="space-y-4 pb-2">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2 text-blue-600 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Step 2 of 3 — AI Feature Marketplace
                  </div>
                  <h2 className="bd-onboard-title">Select Your First AI Feature</h2>
                  {connectedRepo && (
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700">{connectedRepo.name}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Repo Connected
                      </span>
                    </div>
                  )}
                </div>

                {/* Feature Catalog */}
                <FeatureCatalog
                  repoName={connectedRepo?.name}
                  onGenerate={handleGenerateFeature}
                  loading={genLoading}
                  error={genError}
                />

                <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/dashboard/store'; }}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Explore Feature Store Later →
                  </button>
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/dashboard'; }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300/80 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Skip to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Step>

            {/* ════════════════════════════════════════
                STEP 3 — Confirmation
            ════════════════════════════════════════ */}
            <Step>
              <div className="flex flex-col items-center text-center gap-5 py-4 pb-2">
                {/* Icon */}
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                    Step 3 of 3 — Complete!
                  </span>
                  <h2 className="bd-onboard-title" style={{ marginBottom: 0 }}>
                    Your AI Feature is Being Built!
                  </h2>
                  <p className="bd-onboard-subtitle" style={{ marginBottom: 0 }}>
                    You'll see it in your dashboard with a Pull Request link once it's ready.
                  </p>
                </div>

                {genSuccessMsg && (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-emerald-800 text-left">
                    {genSuccessMsg}
                  </div>
                )}

                {genPrUrl && (
                  <a
                    href={genPrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm font-mono"
                  >
                    <span>View Pull Request on GitHub</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <div className="w-full pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/dashboard/store'; }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Request Another Feature</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/dashboard'; }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Go to Dashboard →
                  </button>
                </div>
              </div>
            </Step>

          </Stepper>
        </div>
      </main>
    </div>
  );
}
