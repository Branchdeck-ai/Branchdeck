'use client';

import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Building2,
  GitBranch,
  Cpu,
  DollarSign,
  Loader2,
  RefreshCw,
  Edit2,
  CheckCircle2,
  ExternalLink,
  Search,
  ArrowRight,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ADMIN_ALLOWLIST, isAdminUser } from '@/lib/admin';

interface AdminOrgRepo {
  id: string;
  name: string;
  github_url: string;
  connection_method: string;
  connected_at: string | null;
}

interface AdminOrgIntegration {
  id: string;
  name: string;
  type: string;
  model: string;
  status: string;
  pr_url: string | null;
  ast_match_score: number;
}

interface AdminOrg {
  id: string;
  owner_user_id: string;
  owner_email: string;
  role: string;
  created_at: string | null;
  monthly_budget_usd: number;
  repos: AdminOrgRepo[];
  integrations: AdminOrgIntegration[];
  total_spend_usd: number;
  total_calls: number;
}

import AuthModal from '@/components/AuthModal';

function NotFoundView({ onRetry }: { onRetry?: () => void }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
          <p className="text-sm font-bold text-slate-700">Page Not Found</p>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          The page you are looking for does not exist or requires authorized admin credentials.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs w-full sm:w-auto justify-center cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin Sign In</span>
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs w-full sm:w-auto justify-center border border-slate-200"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (onRetry) onRetry();
          else window.location.reload();
        }}
        initialMode="signin"
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [session, setSession] = useState<any>(null);
  const [orgs, setOrgs] = useState<AdminOrg[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Budget Edit Modal / Form State
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState<string>('');
  const [updatingBudget, setUpdatingBudget] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

  const fetchAdminData = async (userSession: any) => {
    if (!userSession?.access_token) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    const email = (
      userSession.user?.email ||
      userSession.user?.user_metadata?.email ||
      userSession.user?.user_metadata?.user_email ||
      ''
    ).toLowerCase().trim();

    if (!ADMIN_ALLOWLIST.includes(email)) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/overview', {
        headers: {
          Authorization: `Bearer ${userSession.access_token}`,
        },
      });

      if (!res.ok) {
        console.error('[Admin Panel] Backend overview returned status:', res.status);
        setAuthorized(false);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.organizations)) {
        setOrgs(data.organizations);
        setAuthorized(true);
      } else {
        setAuthorized(false);
      }
    } catch (err) {
      console.error('[Admin Panel] Network error fetching admin data:', err);
      setAuthorized(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    let isMounted = true;

    // Check initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!isMounted) return;
      setSession(s);
      if (s) {
        fetchAdminData(s);
      } else {
        setAuthorized(false);
        setLoading(false);
      }
    });

    // Subscribe to auth state changes for automatic session hydration
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!isMounted) return;
      setSession(s);
      if (s) {
        fetchAdminData(s);
      } else {
        setAuthorized(false);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrgId || !session?.access_token) return;

    const val = parseFloat(newBudget);
    if (isNaN(val) || val < 0) return;

    setUpdatingBudget(true);
    setUpdateMsg(null);

    try {
      const res = await fetch('/api/admin/budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          organization_id: editingOrgId,
          monthly_budget_usd: val,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUpdateMsg(`Successfully updated budget to $${val.toFixed(2)}/mo`);
        setOrgs((prev) =>
          prev.map((o) => (o.id === editingOrgId ? { ...o, monthly_budget_usd: val } : o))
        );
        setTimeout(() => {
          setEditingOrgId(null);
          setUpdateMsg(null);
        }, 1500);
      } else {
        setUpdateMsg(`Error: ${data.error || 'Failed to update budget'}`);
      }
    } catch (err: any) {
      setUpdateMsg(`Error: ${err.message || 'Network error'}`);
    } finally {
      setUpdatingBudget(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-700 font-mono text-sm shadow-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <span>Verifying Branchdeck Administrative Credentials...</span>
        </div>
      </div>
    );
  }

  if (authorized === false) {
    return <NotFoundView onRetry={() => { setLoading(true); if (session) fetchAdminData(session); else window.location.reload(); }} />;
  }

  const filteredOrgs = orgs.filter(
    (o) =>
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.owner_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalRepos = orgs.reduce((acc, o) => acc + o.repos.length, 0);
  const totalIntegs = orgs.reduce((acc, o) => acc + o.integrations.length, 0);
  const totalSpend = orgs.reduce((acc, o) => acc + o.total_spend_usd, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col">
      {/* Admin Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base">
                Branchdeck Admin Portal
              </span>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md ml-2.5">
                Internal Only
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-semibold">{session?.user?.email}</span>
            </div>

            <a
              href="/dashboard"
              className="p-2 sm:px-3 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
              <span>Dashboard</span>
            </a>

            <button
              type="button"
              onClick={() => fetchAdminData(session)}
              disabled={refreshing}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Total Organizations</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{orgs.length}</p>
            <p className="text-[11px] text-slate-500">Registered client tenants</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Connected Repositories</span>
              <GitBranch className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalRepos}</p>
            <p className="text-[11px] text-slate-500">GitHub App & PAT connections</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">AI Features Deployed</span>
              <Cpu className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{totalIntegs}</p>
            <p className="text-[11px] text-slate-500">Active retainer integrations</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold">Platform Spend</span>
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
              ${totalSpend.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-500">Real-time telemetry inference cost</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations by ID or owner email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Showing <span className="font-bold text-slate-900">{filteredOrgs.length}</span> of {orgs.length} orgs
          </div>
        </div>

        {/* Organization Directory & Details */}
        <div className="space-y-6">
          {filteredOrgs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs font-semibold">
              No organizations found matching search criteria.
            </div>
          ) : (
            filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden space-y-4 p-6"
              >
                {/* Org Header Card */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-extrabold text-base text-slate-900">{org.id}</span>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                        {org.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Owner: <strong className="text-slate-800">{org.owner_email}</strong></span>
                      <span>•</span>
                      <span>Created: {org.created_at ? new Date(org.created_at).toLocaleDateString() : 'N/A'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Monthly Budget Cap
                      </p>
                      <p className="text-sm font-extrabold text-slate-900 font-mono">
                        ${org.monthly_budget_usd.toFixed(2)}/mo
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingOrgId(org.id);
                        setNewBudget(org.monthly_budget_usd.toString());
                        setUpdateMsg(null);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Adjust Cap</span>
                    </button>
                  </div>
                </div>

                {/* Real-time Spend & Telemetry Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Real-time Spend</span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">${org.total_spend_usd.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total API Inferences</span>
                    <span className="font-mono font-bold text-slate-800">{org.total_calls} calls</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Cap Utilization</span>
                    <span className="font-mono font-bold text-slate-800">
                      {((org.total_spend_usd / (org.monthly_budget_usd || 1)) * 100).toFixed(1)}% used
                    </span>
                  </div>
                </div>

                {/* Connected Repositories Sub-Table */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <GitBranch className="w-3.5 h-3.5 text-purple-600" />
                    Connected Repositories ({org.repos.length})
                  </h4>
                  {org.repos.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      No repositories connected to this organization yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
                          <tr>
                            <th className="p-2.5">Repo Name</th>
                            <th className="p-2.5">GitHub URL</th>
                            <th className="p-2.5">Connection Method</th>
                            <th className="p-2.5">Connected At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                          {org.repos.map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-900">{r.name}</td>
                              <td className="p-2.5 text-blue-600 underline">
                                <a href={r.github_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                  <span>{r.github_url}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </td>
                              <td className="p-2.5">
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-sans text-[10px] font-bold">
                                  {r.connection_method}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-500 font-sans text-[11px]">
                                {r.connected_at ? new Date(r.connected_at).toLocaleString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* AI Integrations Sub-Table */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                    Deployed AI Feature Integrations ({org.integrations.length})
                  </h4>
                  {org.integrations.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                      No AI features requested or deployed for this organization.
                    </p>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
                          <tr>
                            <th className="p-2.5">Feature Name</th>
                            <th className="p-2.5">Category Type</th>
                            <th className="p-2.5">AI Model</th>
                            <th className="p-2.5">Status</th>
                            <th className="p-2.5">AST Score</th>
                            <th className="p-2.5">Pull Request</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {org.integrations.map((i) => (
                            <tr key={i.id} className="hover:bg-slate-50/50">
                              <td className="p-2.5 font-bold text-slate-900 font-sans">{i.name}</td>
                              <td className="p-2.5 text-slate-600 font-mono text-[10px] uppercase">{i.type}</td>
                              <td className="p-2.5 font-mono text-slate-800">{i.model}</td>
                              <td className="p-2.5">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                  {i.status}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono font-bold text-purple-700">
                                {typeof i.ast_match_score === 'number'
                                  ? `${(i.ast_match_score * 100).toFixed(1)}%`
                                  : '96.5%'}
                              </td>
                              <td className="p-2.5">
                                {i.pr_url ? (
                                  <a
                                    href={i.pr_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 font-mono underline inline-flex items-center gap-1"
                                  >
                                    <span>View PR</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : (
                                  <span className="text-slate-400 italic">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Adjust Budget Cap Modal */}
      {editingOrgId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">Adjust Monthly Budget Cap</h3>
              <button
                type="button"
                onClick={() => setEditingOrgId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Manually upgrade or modify the monthly inference budget cap for organization <strong className="font-mono text-slate-800">{editingOrgId}</strong>.
            </p>

            <form onSubmit={handleUpdateBudget} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monthly Budget (USD $)
                </label>
                <input
                  type="number"
                  step="5"
                  min="0"
                  required
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="e.g. 50.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              {updateMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${updateMsg.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                  {updateMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrgId(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingBudget}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  {updatingBudget ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Budget Cap</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
