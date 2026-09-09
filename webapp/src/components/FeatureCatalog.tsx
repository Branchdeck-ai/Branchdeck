'use client';

import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Loader2,
  Code2,
  Wand2,
  Search,
  Layers,
  Filter,
  AlertCircle,
  Zap,
  Check
} from 'lucide-react';

export interface CatalogFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  implementation: string;
  compatibilityTag: string;
  isCompatible: boolean;
  defaultPrompt: string;
}

export const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', speed: 'Ultra-Fast', badge: 'Recommended', cost: '$0.075 / 1M' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', speed: 'Fast & Smart', badge: 'Popular', cost: '$0.150 / 1M' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', speed: 'High Intelligence', badge: 'Advanced', cost: '$2.500 / 1M' },
  { id: 'claude-3-5-haiku', name: 'Claude Haiku 4.5', provider: 'Anthropic', speed: 'High Precision', badge: 'Fast', cost: '$0.800 / 1M' },
  { id: 'claude-3-5-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', speed: 'Deep Reasoning', badge: 'Pro', cost: '$3.000 / 1M' },
];

export function getFeatureCatalog(repoName?: string): {
  domain: string;
  detectedStack: string;
  placeholder: string;
  features: CatalogFeature[];
} {
  const name = (repoName || '').toLowerCase();

  if (name.includes('resummit') || name.includes('interview') || name.includes('resume') || name.includes('career') || name.includes('hire') || name.includes('job')) {
    return {
      domain: 'Career & Hiring Platform',
      detectedStack: 'Next.js App Router + TypeScript + Supabase/PostgreSQL',
      placeholder: 'e.g. Build a mock interview question generator service with technical, behavioral, and system design categories.',
      features: [
        {
          id: 'mock-interview',
          name: 'Mock Interview Question Generator',
          category: 'Career & Evaluation',
          description: 'Generates role-tailored interview questions spanning technical algorithms, system architecture, and STAR-method behavioral categories with automated answer keys.',
          implementation: 'Creates lib/mockInterviewService.ts and app/api/ai/mock-interview/route.ts integrated with Branchdeck server proxy.',
          compatibilityTag: '✓ Native fit for your Next.js + TypeScript stack',
          isCompatible: true,
          defaultPrompt: 'Build a mock interview question generator service with technical, behavioral, and system design categories.'
        },
        {
          id: 'resume-scoring',
          name: 'AI Resume Scoring & Feedback Analyzer',
          category: 'Document Processing',
          description: 'Parses candidate resume text or PDF documents, scores candidate fit against job requirements, and provides actionable improvement feedback.',
          implementation: 'Creates lib/resumeScoringService.ts and app/api/ai/resume-score/route.ts with multi-stage prompt analysis.',
          compatibilityTag: '✓ Compatible with your Next.js + Supabase stack',
          isCompatible: true,
          defaultPrompt: 'Build an AI resume scoring and feedback analyzer service for candidate profiles.'
        },
        {
          id: 'star-assessor',
          name: 'Behavioral STAR Answer Assessor',
          category: 'Evaluation Engine',
          description: 'Evaluates user text/transcript responses against the STAR method (Situation, Task, Action, Result) with quantitative scoring.',
          implementation: 'Creates lib/starFeedbackService.ts and app/api/ai/star-feedback/route.ts integrated with practice UI.',
          compatibilityTag: '✓ Native fit for your Next.js + TypeScript stack',
          isCompatible: true,
          defaultPrompt: 'Build a behavioral STAR method interview answer assessment engine.'
        },
        {
          id: 'skill-matcher',
          name: 'Semantic Candidate Skill Matcher',
          category: 'Vector Search',
          description: 'Vector-indexes candidate profile skills and matches them against job posting requirements using embeddings and similarity scoring.',
          implementation: 'Integrates with PostgreSQL pgvector / embeddings proxy and creates lib/skillMatcher.ts service.',
          compatibilityTag: '✓ Compatible with your PostgreSQL + pgvector setup',
          isCompatible: true,
          defaultPrompt: 'Build a semantic candidate skill matching service using vector embeddings.'
        },
        {
          id: 'pdf-extractor',
          name: 'Automated PDF Document Extractor',
          category: 'Data Ingestion',
          description: 'Extracts structured attributes, work experience, and education records from raw PDF resume uploads.',
          implementation: 'Creates lib/pdfExtractorService.ts and app/api/ai/pdf-extract/route.ts async parser route.',
          compatibilityTag: '✓ Compatible with your Node.js runtime',
          isCompatible: true,
          defaultPrompt: 'Build an automated PDF document extraction API service.'
        },
        {
          id: 'support-agent',
          name: 'AI Support & FAQ Chat Handler',
          category: 'Support Agent',
          description: 'Automated help assistant that resolves candidate platform FAQs and triages incoming help desk tickets.',
          implementation: 'Creates lib/supportChatService.ts and app/api/ai/support-chat/route.ts with conversation memory.',
          compatibilityTag: '✓ Compatible with your Next.js API routes',
          isCompatible: true,
          defaultPrompt: 'Build an AI customer support chat handler service with ticket triage.'
        }
      ]
    };
  }

  if (name.includes('shop') || name.includes('store') || name.includes('cart') || name.includes('commerce') || name.includes('market')) {
    return {
      domain: 'E-Commerce & Retail Storefront',
      detectedStack: 'Next.js / React + Node.js E-Commerce API',
      placeholder: 'e.g. Build an AI product recommendation engine based on user cart contents and purchase history.',
      features: [
        {
          id: 'product-recs',
          name: 'AI Personalized Product Recommendation Engine',
          category: 'Personalization',
          description: 'Analyzes user browsing session, cart items, and order history to predict complementary products in real time.',
          implementation: 'Creates lib/recommendationService.ts and app/api/ai/recommendations/route.ts.',
          compatibilityTag: '✓ Native fit for your React/Next.js Storefront',
          isCompatible: true,
          defaultPrompt: 'Build an AI personalized product recommendation engine based on cart contents.'
        },
        {
          id: 'review-sentiment',
          name: 'Smart Review Sentiment & Summary Analyzer',
          category: 'Customer Intelligence',
          description: 'Summarizes hundreds of product reviews into key pros, cons, and buyer sentiment badges.',
          implementation: 'Creates lib/reviewSummaryService.ts and route app/api/ai/reviews/summary/route.ts.',
          compatibilityTag: '✓ Compatible with your Node.js backend',
          isCompatible: true,
          defaultPrompt: 'Build a review sentiment analyzer and product summary generator service.'
        },
        {
          id: 'order-support',
          name: 'Automated Order Support Assistant',
          category: 'Support Agent',
          description: 'Resolves shipping status inquiries, handles order cancellation requests, and automates refund FAQs.',
          implementation: 'Creates lib/orderSupportService.ts integrated with order database tables.',
          compatibilityTag: '✓ Compatible with your E-Commerce API',
          isCompatible: true,
          defaultPrompt: 'Build an automated order support assistant for shipping and order inquiries.'
        },
        {
          id: 'conversion-predictor',
          name: 'AI Checkout Conversion Predictor',
          category: 'Analytics',
          description: 'Detects exit-intent signals and generates dynamic incentive triggers to boost checkout conversion rates.',
          implementation: 'Creates lib/checkoutConversionService.ts and hook useCheckoutAI.ts.',
          compatibilityTag: '✓ Native fit for your React frontend',
          isCompatible: true,
          defaultPrompt: 'Build an AI checkout conversion predictor and incentive engine.'
        }
      ]
    };
  }

  // General Software Repository Fallback
  return {
    domain: 'Full-Stack Web Application',
    detectedStack: 'Next.js + TypeScript Web Stack',
    placeholder: `e.g. Build an AI feature generator service tailored for ${repoName || 'your repository'}.`,
    features: [
      {
        id: 'code-search',
        name: 'Semantic Code Search API Integration',
        category: 'Vector Search',
        description: 'Performs natural language semantic queries across codebase definitions, functions, and documentation.',
        implementation: 'Creates lib/semanticSearchService.ts and route app/api/ai/search/route.ts.',
        compatibilityTag: '✓ Compatible with your Next.js + TypeScript stack',
        isCompatible: true,
        defaultPrompt: 'Build a semantic code search API integration for repository symbols.'
      },
      {
        id: 'support-chat',
        name: 'AI Customer Support Chat Handler',
        category: 'Support Agent',
        description: 'Automated assistant that resolves standard product FAQs and triages incoming user tickets.',
        implementation: 'Creates lib/supportChatService.ts with prompt routing and state management.',
        compatibilityTag: '✓ Native fit for your Web App stack',
        isCompatible: true,
        defaultPrompt: 'Build an AI customer support chat handler with ticket triage.'
      },
      {
        id: 'doc-extractor',
        name: 'Automated PDF & Document Extractor',
        category: 'Document Processing',
        description: 'Extracts key fields, attributes, and structured JSON metadata from uploaded PDF documents.',
        implementation: 'Creates lib/docExtractorService.ts async parsing pipeline.',
        compatibilityTag: '✓ Compatible with your Node.js environment',
        isCompatible: true,
        defaultPrompt: 'Build an automated PDF and document extraction API service.'
      },
      {
        id: 'feature-assistant',
        name: `AI Feature Assistant for ${repoName || 'Software'}`,
        category: 'AI Assistant',
        description: `Custom domain assistant tailored to automate workflow steps in ${repoName || 'your project'}.`,
        implementation: 'Creates lib/featureAssistantService.ts and Next.js API route.',
        compatibilityTag: '✓ Compatible with your codebase conventions',
        isCompatible: true,
        defaultPrompt: `Build an AI feature assistant tailored for ${repoName || 'our project'}.`
      }
    ]
  };
}

interface FeatureCatalogProps {
  repoName?: string;
  onGenerate: (featureDescription: string, model: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Career & Evaluation': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Document Processing': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Evaluation Engine': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'Vector Search': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Data Ingestion': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Support Agent': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
};

export default function FeatureCatalog({
  repoName,
  onGenerate,
  loading,
  error
}: FeatureCatalogProps) {
  const catalog = getFeatureCatalog(repoName);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedModelMap, setSelectedModelMap] = useState<Record<string, string>>({});
  const [globalModel, setGlobalModel] = useState<string>('gpt-4o-mini');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');

  // Extract unique category names for filter tabs
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalog.features.forEach(f => set.add(f.category));
    return ['All', ...Array.from(set)];
  }, [catalog]);

  // Filter features by search query & category tab
  const filteredFeatures = useMemo(() => {
    return catalog.features.filter(f => {
      const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [catalog, selectedCategory, searchQuery]);

  const getModelForFeature = (featureId: string) => {
    return selectedModelMap[featureId] || globalModel;
  };

  const handleModelChange = (featureId: string, modelId: string) => {
    setSelectedModelMap(prev => ({ ...prev, [featureId]: modelId }));
  };

  const handleCardSubmit = (feature: CatalogFeature) => {
    const model = getModelForFeature(feature.id);
    onGenerate(feature.defaultPrompt, model);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    onGenerate(customPrompt.trim(), globalModel);
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans">
      {/* Light Design System Detected Stack Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                Connected Repo: <code className="text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-md">{repoName || 'your repository'}</code>
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {catalog.domain}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>Detected Stack: <strong className="text-slate-700 font-medium">{catalog.detectedStack}</strong></span>
            </p>
          </div>
        </div>

        {/* Global Default Model Selector */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2">
          <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Wand2 className="w-4 h-4 text-blue-600" />
            AI Provider Model:
          </span>
          <select
            value={globalModel}
            onChange={(e) => setGlobalModel(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
          >
            {AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Controls Header: View Mode Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Browsable Marketplace vs Custom Request Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${activeTab === 'catalog' ? 'text-amber-300' : 'text-slate-400'}`} />
            <span>Browsable Marketplace</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              activeTab === 'catalog' ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
            }`}>
              {catalog.features.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Custom Request</span>
          </button>
        </div>

        {/* Real-Time Search Bar */}
        {activeTab === 'catalog' && (
          <div className="relative min-w-[260px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features by name or keyword..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      {activeTab === 'catalog' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Category:
          </span>
          {categories.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all flex-shrink-0 cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Categories' : cat}
              </button>
            );
          })}
        </div>
      )}

      {/* ERROR DISPLAY */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-medium flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-bold">PR Generation Error</p>
            <p className="text-[11px] font-mono mt-0.5 text-rose-600">{error}</p>
          </div>
        </div>
      )}

      {/* BROWSABLE MARKETPLACE GRID (3-Columns on Desktop) */}
      {activeTab === 'catalog' && (
        <>
          {filteredFeatures.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No matching AI features found</p>
              <p className="text-xs text-slate-500">Try adjusting your category filter or search query.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
              >
                Clear search filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatures.map((feature) => {
                const currentModel = getModelForFeature(feature.id);
                const dotColorMap: Record<string, string> = {
                  'Career & Evaluation': 'bg-blue-500',
                  'Document Processing': 'bg-indigo-500',
                  'Evaluation Engine': 'bg-emerald-500',
                  'Vector Search': 'bg-purple-500',
                  'Data Ingestion': 'bg-amber-500',
                  'Support Agent': 'bg-teal-500',
                  'Personalization': 'bg-pink-500',
                  'Customer Intelligence': 'bg-cyan-500',
                  'Analytics': 'bg-violet-500',
                };
                const dotColor = dotColorMap[feature.category] || 'bg-slate-400';

                return (
                  <div
                    key={feature.id}
                    className="bg-white border border-slate-200 hover:border-blue-400/80 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 h-full min-h-[380px] group"
                  >
                    <div className="space-y-3.5 flex-1 flex flex-col justify-start">
                      {/* Category Badge & Compatibility Indicator */}
                      <div className="space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200/80 text-slate-700">
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
                            <span>{feature.category}</span>
                          </span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50/90 border border-emerald-200/90 px-2.5 py-0.5 rounded-full">
                          <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span>{feature.compatibilityTag}</span>
                        </div>
                      </div>

                      {/* Feature Title */}
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
                        {feature.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-[1.65] font-sans">
                        {feature.description}
                      </p>

                      {/* Implementation Pattern */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] font-mono text-slate-700 space-y-1 mt-auto">
                        <span className="text-slate-400 font-sans text-[10px] font-bold block uppercase tracking-wider">
                          AST Architecture Target:
                        </span>
                        <p className="text-slate-800 font-medium leading-relaxed">{feature.implementation}</p>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                      {/* Per-Card Model Selector */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Model:</span>
                        <select
                          value={currentModel}
                          onChange={(e) => handleModelChange(feature.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-[11px] font-bold text-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {AI_MODELS.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.provider})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Generate PR Action Button */}
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => handleCardSubmit(feature)}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ml-auto"
                      >
                        {loading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            <span>Generate PR</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* CUSTOM FREE-TEXT REQUEST VIEW */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-900">
              Describe Your Custom AI Feature <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-500">
              Our AST engine will analyze your codebase conventions, match project patterns, and construct a GitHub PR automatically.
            </p>
            <textarea
              rows={4}
              required
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={catalog.placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans resize-none mt-2 shadow-2xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Target Provider Model:</span>
              <select
                value={globalModel}
                onChange={(e) => setGlobalModel(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider}) — {m.cost}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !customPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating AI Code & PR...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Custom AI Feature PR</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
