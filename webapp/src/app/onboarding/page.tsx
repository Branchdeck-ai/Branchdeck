'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import FeatureCatalog from '@/components/FeatureCatalog';
import { isAdminUser } from '@/lib/admin';

function BranchdeckLogo({ className = "w-7 h-7 object-contain rounded-lg" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Branchdeck Logo"
      className={className}
    />
  );
}

export default function OnboardingPage() {
  const [session, setSession] = useState<any>(null);
  const [orgData, setOrgData] = useState<any>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 State: Connect Repo
  const [repoUrl, setRepoUrl] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [showPat, setShowPat] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectedRepo, setConnectedRepo] = useState<any>(null);

  // Step 2 State: Request AI Feature
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);
  const [genPrUrl, setGenPrUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializeOnboarding(currentSession: any) {
      if (!currentSession) {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
        if (isMounted) setInitLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const isAppInstalled = urlParams.get('installation_id') || urlParams.get('github_connected') === 'true';
        const savedRepoStr = localStorage.getItem('branchdeck_connected_repo');
        
        if (savedRepoStr || isAppInstalled) {
          try {
            const parsed = savedRepoStr ? JSON.parse(savedRepoStr) : { name: 'Resummit', github_url: 'https://github.com/Resummit-ai/Resummit' };
            setConnectedRepo(parsed);
            setStep(2);
          } catch (e) {
            setStep(2);
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
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
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
          reposRes = await fetch(`/api/dashboard/repos`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          reposJson = await reposRes.json();
        }

        if (reposJson.success && Array.isArray(reposJson.repos) && reposJson.repos.length > 0) {
          console.log('[Branchdeck Onboarding] Connected repository detected. Advancing to Step 2...');
          if (isMounted) {
            const activeRepo = reposJson.repos[0];
            setConnectedRepo(activeRepo);
            if (typeof window !== 'undefined') {
              localStorage.setItem('branchdeck_connected_repo', JSON.stringify(activeRepo));
            }
            setStep(2);
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

    if (!isSupabaseConfigured) {
      setInitLoading(false);
      return;
    }

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

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleStartGitHubAppInstall = async () => {
    setConnectLoading(true);
    setConnectError(null);

    try {
      const token = session?.access_token || '';
      const activeOrgId = orgData?.id || orgData?.organization_id || '';

      const res = await fetch(`/api/github/install-url?organization_id=${encodeURIComponent(activeOrgId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.install_url) {
        throw new Error(data.detail || data.error || 'Failed to fetch GitHub App installation URL.');
      }
      window.location.href = data.install_url;
    } catch (err: any) {
      setConnectError(err.message || 'Failed to start GitHub App installation flow.');
      setConnectLoading(false);
    }
  };

  const [showPatFallback, setShowPatFallback] = useState(false);

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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization_id: activeOrgId,
          repo_url: repoUrl.trim(),
          github_pat: githubPat.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.error || 'Failed to connect repository.');
      }

      setConnectedRepo(data.repo);
      if (typeof window !== 'undefined') {
        localStorage.setItem('branchdeck_connected_repo', JSON.stringify(data.repo));
      }
      setStep(2);
    } catch (err: any) {
      setConnectError(err.message || 'Error connecting repository');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleGenerateFeature = async (featureDescription: string, model: string = 'gemini-2.5-flash') => {
    if (!featureDescription || !featureDescription.trim()) {
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization_id: activeOrgId,
          repo_id: targetRepoId,
          feature_description: featureDescription.trim(),
          model: model,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.error || 'Failed to generate feature PR.');
      }

      setGenSuccessMsg(data.message || 'Successfully generated AI feature code and created GitHub PR!');
      setGenPrUrl(data.integration?.pr_url || null);
      setStep(3);
    } catch (err: any) {
      setGenError(err.message || 'Error generating feature PR');
    } finally {
      setGenLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-700 font-mono text-sm shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Setting up your Branchdeck environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Light Theme Navigation Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BranchdeckLogo className="w-8 h-8 object-contain rounded-xl" />
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base">Branchdeck</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md ml-2.5">
                Client Onboarding Wizard
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
                  ${typeof orgData.monthly_budget_usd === 'number' ? orgData.monthly_budget_usd.toFixed(2) : '10.00'}/mo trial
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
                <span>Admin Panel</span>
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Step Indicator */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex items-center justify-between mb-2 text-xs font-bold">
            <span className={step === 1 ? 'text-blue-600' : 'text-slate-400'}>
              1. Connect Repository
            </span>
            <span className={step === 2 ? 'text-blue-600' : 'text-slate-400'}>
              2. Browse & Select AI Feature
            </span>
            <span className={step === 3 ? 'text-emerald-600' : 'text-slate-400'}>
              3. Confirmation
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        {/* Wizard Card Container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={step === 2 ? 'w-full space-y-6' : 'max-w-2xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6'}
        >
          {/* STEP 1: Connect Repository */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
                  <GitBranch className="w-4 h-4" />
                  Step 1 of 3
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Connect Your GitHub Repository
                </h1>
                <p className="text-xs text-slate-600 mt-1">
                  Connect your repository so Branchdeck can inspect your codebase architecture and generate targeted Pull Requests matching your existing project conventions.
                </p>
              </div>

              {connectError && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <div>
                    <p className="font-bold">Connection Error</p>
                    <p className="text-[11px] font-mono mt-0.5">{connectError}</p>
                  </div>
                </div>
              )}

              {/* GitHub App Connection Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-md">
                      Recommended & Instant
                    </span>
                    <h3 className="text-base font-bold text-slate-900 pt-1">
                      Connect via Branchdeck GitHub App
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      One-click authorization. Grants fine-grained read/write permissions strictly scoped to your target repository for PR creation.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    No long-lived personal tokens required.
                  </span>
                  <button
                    type="button"
                    disabled={connectLoading}
                    onClick={handleStartGitHubAppInstall}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    {connectLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Opening GitHub...</span>
                      </>
                    ) : (
                      <>
                        <span>Connect via GitHub App</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* PAT Fallback Toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowPatFallback(!showPatFallback)}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline font-medium cursor-pointer"
                >
                  {showPatFallback ? '← Hide PAT fallback option' : 'Or connect using a Personal Access Token (PAT) →'}
                </button>
              </div>

              {/* PAT Fallback Form */}
              {showPatFallback && (
                <div className="pt-2 border-t border-slate-200 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      <Key className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>Required GitHub Personal Access Token (PAT) Permissions:</span>
                    </div>
                    <ul className="text-slate-700 space-y-1 pl-6 list-disc font-mono text-[11px]">
                      <li>Repository Access: Select your target client repository</li>
                      <li>Repository Permissions: <strong className="text-slate-900">Contents (Read & Write)</strong>, <strong className="text-slate-900">Pull Requests (Read & Write)</strong></li>
                    </ul>
                  </div>

                  <form onSubmit={handleConnectRepo} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        GitHub Repository URL or Path <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/my-org/my-repo  or  my-org/my-repo"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-800">
                        Personal Access Token (PAT) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPat ? 'text' : 'password'}
                          required
                          value={githubPat}
                          onChange={(e) => setGithubPat(e.target.value)}
                          placeholder="github_pat_11A... or ghp_..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-mono pr-12 shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPat(!showPat)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 transition-colors text-xs font-bold"
                        >
                          {showPat ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        Tokens are encrypted before being stored.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={connectLoading}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                      >
                        {connectLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Connecting PAT...</span>
                          </>
                        ) : (
                          <>
                            <span>Connect via PAT</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Request First AI Feature via Consolidated Feature Catalog */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-blue-600 text-xs font-extrabold uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    Step 2 of 3 — AI Feature Marketplace
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Select Your First AI Feature
                  </h2>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {connectedRepo && (
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-slate-800">{connectedRepo.name}</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Repo Connected
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/dashboard';
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Skip to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                </div>
              </div>

              {/* Consolidated Reusable FeatureCatalog Component */}
              <FeatureCatalog
                repoName={connectedRepo?.name}
                onGenerate={handleGenerateFeature}
                loading={genLoading}
                error={genError}
              />

              <div className="pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/dashboard/store';
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Visit Feature Store Later &rarr;
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300/80 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Skip to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation */}
          {step === 3 && (
            <div className="max-w-xl mx-auto space-y-6 text-center py-6 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Step 3 of 3 — Complete!
                </span>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Your AI Feature is Being Built!
                </h1>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your feature is being built — you'll see it in your dashboard with a Pull Request link once it's ready.
                </p>
              </div>

              {genSuccessMsg && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-emerald-800 max-w-lg mx-auto">
                  {genSuccessMsg}
                </div>
              )}

              {genPrUrl && (
                <div className="pt-2">
                  <a
                    href={genPrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm font-mono"
                  >
                    <span>View Pull Request on GitHub</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/dashboard/store';
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Request Another Feature in Store</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-6 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Go to Main Dashboard &rarr;
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
