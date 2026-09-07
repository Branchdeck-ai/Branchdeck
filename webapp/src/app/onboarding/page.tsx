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
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

function BranchdeckLogo({ className = "w-7 h-7 object-contain rounded-lg" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Branchdeck Logo"
      className={className}
    />
  );
}

function getFeatureSuggestions(repoName?: string) {
  const name = (repoName || '').toLowerCase();
  
  if (name.includes('resummit') || name.includes('interview') || name.includes('resume') || name.includes('career') || name.includes('hire') || name.includes('job')) {
    return {
      placeholder: 'e.g. Build a mock interview question generator service with technical, behavioral, and system design categories.',
      suggestions: [
        'Mock Interview Question Generator Service',
        'AI Resume Scoring & Feedback Analyzer',
        'Behavioral Answer Feedback Engine',
        'Semantic Candidate Skill Matcher',
      ]
    };
  }
  
  if (name.includes('shop') || name.includes('store') || name.includes('cart') || name.includes('commerce') || name.includes('market')) {
    return {
      placeholder: 'e.g. Build an AI product recommendation engine based on user cart contents and purchase history.',
      suggestions: [
        'AI Personalized Product Recommendation Engine',
        'Smart Customer Review Sentiment Analyzer',
        'Automated Order Support Assistant',
        'AI Checkout Conversion Predictor',
      ]
    };
  }

  if (name.includes('chat') || name.includes('support') || name.includes('bot') || name.includes('desk') || name.includes('help')) {
    return {
      placeholder: 'e.g. Build an AI support assistant that resolves standard customer FAQs and triages incoming tickets.',
      suggestions: [
        'AI Customer Support Chat Handler',
        'Automated Support Ticket Categorizer',
        'Semantic Knowledge Base Search Engine',
        'AI Response Escalation Analyzer',
      ]
    };
  }

  return {
    placeholder: `e.g. Build an AI feature generator service tailored for ${repoName || 'your repository'}.`,
    suggestions: [
      `AI Feature Assistant for ${repoName || 'Software'}`,
      'Semantic Code Search API Integration',
      'AI Customer Support Chat Handler',
      'Automated PDF & Document Extractor',
    ]
  };
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
  const [featureDesc, setFeatureDesc] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [genSuccessMsg, setGenSuccessMsg] = useState<string | null>(null);
  const [genPrUrl, setGenPrUrl] = useState<string | null>(null);

  // 1. Load session and check organization & repo status
  useEffect(() => {
    let isMounted = true;

    async function initializeOnboarding(currentSession: any) {
      if (!currentSession) {
        if (isMounted) setInitLoading(false);
        return;
      }

      // Check local storage or URL query for immediate step 2 advancement if already connected
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const isAppInstalled = urlParams.get('installation') === 'success';
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
        // Fetch User Organizations
        const orgRes = await fetch('/api/dashboard/organizations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orgJson = await orgRes.json();
        let targetOrg = null;

        if (orgJson.success && orgJson.organizations?.length > 0) {
          targetOrg = orgJson.organizations[0];
        } else {
          // Provision self-serve org if missing
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

        // Fetch Repos for target org to check if already connected
        const orgId = targetOrg.id || targetOrg.organization_id;
        let reposRes = await fetch(`/api/dashboard/repos?organization_id=${orgId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        let reposJson = await reposRes.json();

        if (!reposJson.success || !Array.isArray(reposJson.repos) || reposJson.repos.length === 0) {
          // Fallback to fetch across all user orgs / connected repos
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
          supabase.auth.getSession().then(({ data: { session: s2 } }) => {
            if (s2) {
              setSession(s2);
              initializeOnboarding(s2);
            } else if (isMounted) {
              setInitLoading(false);
            }
          });
        }, 500);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        setSession(s);
        initializeOnboarding(s);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleConnectGitHubApp = async () => {
    setConnectLoading(true);
    setConnectError(null);
    try {
      const token = session?.access_token || '';
      const res = await fetch('/api/github/install-url', {
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

  // Handler for Step 1: Connect Repository
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

  // Handler for Step 2: Request AI Feature
  const handleGenerateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureDesc.trim()) {
      setGenError('Please describe the AI feature you want to build.');
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
          feature_description: featureDesc.trim(),
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
      <div className="min-h-screen bg-[#070913] text-white flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-6 py-4 text-slate-300 font-mono text-sm shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>Setting up your Branchdeck environment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[200px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-3">
          <BranchdeckLogo className="w-8 h-8 object-contain rounded-xl" />
          <div>
            <span className="font-bold text-white tracking-tight text-base">Branchdeck</span>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md ml-2.5">
              Client Onboarding
            </span>
          </div>
        </div>

        {orgData && (
          <div className="hidden sm:flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-full px-4 py-1.5 text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              {orgData.id || orgData.organization_id}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              ${typeof orgData.monthly_budget_usd === 'number' ? orgData.monthly_budget_usd.toFixed(2) : '10.00'}/mo trial
            </span>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl w-full mx-auto my-auto relative z-10 py-6">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold">
            <span className={step === 1 ? 'text-blue-400 font-bold' : 'text-slate-400'}>
              1. Connect Repository
            </span>
            <span className={step === 2 ? 'text-blue-400 font-bold' : 'text-slate-400'}>
              2. Request AI Feature
            </span>
            <span className={step === 3 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              3. Confirmation
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-blue-500' : 'bg-slate-800'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-blue-500' : 'bg-slate-800'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
          </div>
        </div>

        {/* Wizard Card Container */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="bg-[#0E1220] border border-white/[0.1] rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
        >
          {/* STEP 1: Connect Repository */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <GitBranch className="w-4 h-4" />
                  Step 1 of 3
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Connect Your GitHub Repository
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Authorize Branchdeck AI on your repository to analyze code patterns and open automated feature Pull Requests.
                </p>
              </div>

              {/* Error Message */}
              {connectError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <p className="font-bold">Connection Error</p>
                    <p className="text-[11px] font-mono mt-0.5">{connectError}</p>
                  </div>
                </div>
              )}

              {/* Primary GitHub App Connect Card */}
              <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-500 text-[10px] font-extrabold text-white px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Recommended
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                  <GitBranch className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Connect via Branchdeck GitHub App</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                    Install our official GitHub App onto your target repository with 1-click. Mints short-lived installation access tokens automatically without managing manual PATs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConnectGitHubApp}
                  disabled={connectLoading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-lg inline-flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  {connectLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Redirecting to GitHub...</span>
                    </>
                  ) : (
                    <>
                      <span>Connect via GitHub App</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* PAT Fallback Toggle */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowPatFallback(!showPatFallback)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline font-medium"
                >
                  {showPatFallback ? '← Hide PAT fallback option' : 'Or connect using a Personal Access Token (PAT) →'}
                </button>
              </div>

              {/* PAT Fallback Form */}
              {showPatFallback && (
                <div className="pt-2 border-t border-slate-800 space-y-4">
                  {/* PAT Scope Guidance Alert Card */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 text-blue-300 font-bold">
                      <Key className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span>Required GitHub Personal Access Token (PAT) Permissions:</span>
                    </div>
                    <ul className="text-slate-300 space-y-1 pl-6 list-disc font-mono text-[11px]">
                      <li>Repository Access: Only select the target repository you want to connect</li>
                      <li>Repository Permissions: <strong className="text-white">Contents (Read & Write)</strong>, <strong className="text-white">Pull Requests (Read & Write)</strong>, <strong className="text-white">Metadata (Read-Only)</strong></li>
                    </ul>
                  </div>

                  <form onSubmit={handleConnectRepo} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        GitHub Repository URL or Path <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        placeholder="https://github.com/my-org/my-repo  or  my-org/my-repo"
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Personal Access Token (PAT) <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPat ? 'text' : 'password'}
                          required
                          value={githubPat}
                          onChange={(e) => setGithubPat(e.target.value)}
                          placeholder="github_pat_11A... or ghp_..."
                          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPat(!showPat)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-xs font-bold"
                        >
                          {showPat ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        Tokens are encrypted at rest before being stored in the database.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-end">
                      <button
                        type="submit"
                        disabled={connectLoading}
                        className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
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

          {/* STEP 2: Request First AI Feature */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Zap className="w-4 h-4" />
                  Step 2 of 3
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Request Your First AI Feature
                </h1>
                <p className="text-sm text-slate-300 mt-1">
                  Describe what you want Branchdeck to build. Our AST engine matches your codebase conventions and creates a GitHub PR automatically.
                </p>
              </div>

              {/* Connected Repo Card */}
              {connectedRepo && (
                <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{connectedRepo.name}</p>
                      <p className="text-slate-400 font-mono text-[11px]">{connectedRepo.github_url}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    {connectedRepo.has_installation || connectedRepo.github_installation_id ? 'GitHub App Connected' : 'PAT Connected & Encrypted'}
                  </span>
                </div>
              )}

              {/* Error Message */}
              {genError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                  <div>
                    <p className="font-bold">Generation Error</p>
                    <p className="text-[11px] font-mono mt-0.5">{genError}</p>
                  </div>
                </div>
              )}

              {(() => {
                const suggestionsData = getFeatureSuggestions(connectedRepo?.name);
                return (
                  <form onSubmit={handleGenerateFeature} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Feature Description <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={featureDesc}
                        onChange={(e) => setFeatureDesc(e.target.value)}
                        placeholder={suggestionsData.placeholder}
                        className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans resize-none"
                      />
                    </div>

                    {/* Preset Suggestions */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold text-slate-400">Or pick a common AI feature pattern:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestionsData.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => setFeatureDesc(suggestion)}
                            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl px-3 py-1.5 transition-colors cursor-pointer"
                          >
                            + {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = '/dashboard';
                    }}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                  >
                    I'll do this later (Skip to Dashboard &rarr;)
                  </button>

                  <button
                    type="submit"
                    disabled={genLoading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer"
                  >
                    {genLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Generating AI Code & PR...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate AI Feature PR</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            );
          })()}
        </div>
          )}

          {/* STEP 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Step 3 of 3 — Complete!
                </span>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Your AI Feature is Being Built!
                </h1>
                <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your feature is being built — you'll see it in your dashboard with a PR link once it's ready.
                </p>
              </div>

              {genSuccessMsg && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-emerald-300 max-w-lg mx-auto">
                  {genSuccessMsg}
                </div>
              )}

              {genPrUrl && (
                <div className="pt-2">
                  <a
                    href={genPrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg font-mono"
                  >
                    <span>View Pull Request on GitHub</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/dashboard';
                  }}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition-all shadow-xl inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Go to Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-xs text-slate-500 relative z-10">
        Branchdeck &copy; {new Date().getFullYear()} — Codebase Intelligence & Autonomous AI Integration
      </footer>
    </div>
  );
}
