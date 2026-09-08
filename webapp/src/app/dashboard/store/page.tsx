'use client';

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Building2,
  GitBranch,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import FeatureCatalog from '@/components/FeatureCatalog';

function BranchdeckLogo({ className = "w-7 h-7 object-contain rounded-lg" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Branchdeck Logo"
      className={className}
    />
  );
}

export default function DashboardStorePage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<any>(null);
  
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ message: string; prUrl?: string | null } | null>(null);

  useEffect(() => {
    async function init() {
      try {
        if (!isSupabaseConfigured()) {
          setLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (!currentSession) {
          window.location.href = '/login';
          return;
        }

        // Fetch user org
        const token = currentSession.access_token;
        const orgRes = await fetch('/api/dashboard/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (orgRes.ok) {
          const orgJson = await orgRes.json();
          setOrgData(orgJson.organization || orgJson.org || orgJson);
          
          // Fetch repos
          const orgId = orgJson.organization?.id || orgJson.id || '';
          if (orgId) {
            const repoRes = await fetch(`/api/dashboard/repos?organization_id=${orgId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (repoRes.ok) {
              const repoJson = await repoRes.json();
              const repoList = repoJson.repositories || repoJson.repos || [];
              setRepos(repoList);
              if (repoList.length > 0) {
                setSelectedRepo(repoList[0]);
              }
            }
          }
        }
      } catch (err) {
        console.error('Store init error:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  const handleGenerate = async (featureDescription: string, model: string) => {
    if (!selectedRepo) {
      setGenError('No connected repository found. Please connect a repository first.');
      return;
    }

    setGenLoading(true);
    setGenError(null);

    try {
      const token = session?.access_token || '';
      const orgId = orgData?.id || orgData?.organization_id || '';

      const res = await fetch('/api/dashboard/integrations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          organization_id: orgId,
          repo_id: selectedRepo.id,
          feature_description: featureDescription,
          model: model,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.detail || data.error || 'Failed to generate feature PR.');
      }

      setSuccessResult({
        message: data.message || 'Successfully generated AI feature code and opened PR on GitHub!',
        prUrl: data.integration?.pr_url || null,
      });
    } catch (err: any) {
      setGenError(err.message || 'Error generating feature PR');
    } finally {
      setGenLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070913] text-white flex flex-col items-center justify-center p-6">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 text-slate-300 font-mono text-sm shadow-xl">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          <span>Loading Branchdeck Feature Catalog...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { window.location.href = '/dashboard'; }}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <BranchdeckLogo className="w-7 h-7 rounded-lg" />
              <span className="font-bold text-white tracking-tight text-sm">Branchdeck</span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                AI Store & Feature Catalog
              </span>
            </div>
          </div>

          {/* Connected Repo Picker if multiple repos exist */}
          {repos.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Target Repo:</span>
              <select
                value={selectedRepo?.id || ''}
                onChange={(e) => {
                  const r = repos.find(item => item.id === e.target.value);
                  if (r) setSelectedRepo(r);
                }}
                className="bg-slate-900 border border-slate-800 text-xs font-bold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {repos.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name || r.id}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Branchdeck Feature Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Feature Catalog & Store
          </h1>
          <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
            Browse domain-tailored AI feature templates matched to your codebase's AST graph conventions. Select your preferred AI inference provider and generate automated GitHub Pull Requests instantly.
          </p>
        </div>

        {/* Success Modal / Banner */}
        {successResult && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">{successResult.message}</h2>
              <p className="text-xs text-slate-300">
                Your AI feature service and Next.js route files have been committed to a dedicated branch and PR.
              </p>
            </div>
            {successResult.prUrl && (
              <a
                href={successResult.prUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg"
              >
                <span>View Pull Request on GitHub</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <div className="pt-2">
              <button
                onClick={() => setSuccessResult(null)}
                className="text-xs font-semibold text-slate-400 hover:text-white"
              >
                Request Another Feature &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Catalog Component */}
        {!successResult && (
          <FeatureCatalog
            repoName={selectedRepo?.name || 'Resummit'}
            onGenerate={handleGenerate}
            loading={genLoading}
            error={genError}
          />
        )}
      </main>
    </div>
  );
}
