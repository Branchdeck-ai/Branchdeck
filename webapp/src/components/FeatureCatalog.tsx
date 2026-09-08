'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Loader2,
  Code2,
  Zap,
  Layers,
  Wand2,
  Check,
  AlertCircle
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
        category: 'Semantic Search',
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

export default function FeatureCatalog({
  repoName,
  onGenerate,
  loading,
  error
}: FeatureCatalogProps) {
  const catalog = getFeatureCatalog(repoName);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(catalog.features[0]?.id || null);
  const [selectedModelMap, setSelectedModelMap] = useState<Record<string, string>>({});
  const [globalModel, setGlobalModel] = useState<string>('gpt-4o-mini');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom'>('catalog');

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
    <div className="space-y-6">
      {/* Detected Stack Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                Connected Repo: <code className="text-blue-400 font-mono">{repoName || 'Resummit'}</code>
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {catalog.domain}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>Detected Stack: <strong className="text-slate-300 font-normal">{catalog.detectedStack}</strong></span>
            </p>
          </div>
        </div>

        {/* Global Default Model Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-amber-400" />
            AI Model:
          </span>
          <select
            value={globalModel}
            onChange={(e) => setGlobalModel(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs font-semibold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {AI_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.provider})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs: Browsable Catalog vs Custom Free-Text */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Browsable Feature Catalog</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            {catalog.features.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'custom'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4 text-slate-400" />
          <span>Custom Free-Text Request</span>
        </button>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-semibold flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
          <div>
            <p className="font-bold">PR Generation Error</p>
            <p className="text-[11px] font-mono mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* CATALOG VIEW */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {catalog.features.map((feature) => {
              const currentModel = getModelForFeature(feature.id);
              const modelObj = AI_MODELS.find(m => m.id === currentModel) || AI_MODELS[0];

              return (
                <div
                  key={feature.id}
                  className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                >
                  <div className="space-y-2.5">
                    {/* Category & Compatibility Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                        {feature.category}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {feature.compatibilityTag}
                      </span>
                    </div>

                    {/* Feature Title */}
                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                      {feature.name}
                    </h3>

                    {/* Feature Description */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {feature.description}
                    </p>

                    {/* Implementation Details */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 text-[11px] font-mono text-slate-400 space-y-1">
                      <span className="text-slate-500 font-sans text-[10px] font-bold block uppercase tracking-wider">
                        Implementation Pattern:
                      </span>
                      <p className="text-slate-300">{feature.implementation}</p>
                    </div>
                  </div>

                  {/* Card Bottom Action & Model Selection */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                    {/* Per-Card Model Selector */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-slate-400">Model:</span>
                      <select
                        value={currentModel}
                        onChange={(e) => handleModelChange(feature.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        {AI_MODELS.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.provider})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Request Feature Button */}
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleCardSubmit(feature)}
                      className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-auto"
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
        </div>
      )}

      {/* CUSTOM FREE-TEXT VIEW */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Describe Your Custom Feature <span className="text-rose-400">*</span>
            </label>
            <p className="text-[11px] text-slate-400">
              Our AST engine will analyze your codebase conventions, match existing project patterns, and construct a GitHub PR automatically.
            </p>
            <textarea
              rows={4}
              required
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={catalog.placeholder}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-sans resize-none mt-2"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Target Model:</span>
              <select
                value={globalModel}
                onChange={(e) => setGlobalModel(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs font-bold text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 cursor-pointer"
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
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Generating AI Feature PR...</span>
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
