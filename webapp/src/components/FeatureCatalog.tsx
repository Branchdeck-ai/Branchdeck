'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowRight,
  Loader2,
  Sparkles,
  MessageSquare,
  Code2,
  FileText,
  Zap,
  Mic,
  Languages,
  BarChart2,
  ShieldCheck,
  Bot,
  BookOpen,
  Image as ImageIcon,
  Cpu,
  Layers,
  CheckCircle2,
  X,
  Check,
  ChevronRight,
  Wand2
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
  iconName: string;
}

export const AI_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', speed: 'Ultra-Fast', badge: 'Recommended', cost: '$0.075 / 1M' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', speed: 'Fast & Smart', badge: 'Popular', cost: '$0.150 / 1M' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', speed: 'High Intelligence', badge: 'Advanced', cost: '$2.500 / 1M' },
  { id: 'claude-3-5-haiku', name: 'Claude Haiku 4.5', provider: 'Anthropic', speed: 'High Precision', badge: 'Fast', cost: '$0.800 / 1M' },
  { id: 'claude-3-5-sonnet', name: 'Claude Sonnet', provider: 'Anthropic', speed: 'Deep Reasoning', badge: 'Pro', cost: '$3.000 / 1M' },
];

export const STANDARD_FEATURES: CatalogFeature[] = [
  {
    id: 'chat-with-docs',
    name: 'Chat with Documents',
    category: 'Productivity',
    description: 'Ask questions over your PDFs, docs or knowledge base using RAG.',
    implementation: 'Creates lib/ragChatService.ts and app/api/ai/chat-docs/route.ts integrated with vector embeddings.',
    compatibilityTag: '✓ Native fit for your codebase',
    isCompatible: true,
    defaultPrompt: 'Build a Chat with Documents RAG feature with vector retrieval and streaming responses.',
    iconName: 'MessageSquare',
  },
  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    category: 'Developer Tools',
    description: 'Analyze code changes, find issues and suggest improvements with LLMs.',
    implementation: 'Creates lib/codeReviewerService.ts and app/api/ai/code-review/route.ts AST analyzer.',
    compatibilityTag: '✓ Native fit for your codebase',
    isCompatible: true,
    defaultPrompt: 'Build an automated Code Reviewer service that checks code style, security, and bug patterns.',
    iconName: 'Code2',
  },
  {
    id: 'image-generator',
    name: 'Image Generator',
    category: 'Multimedia',
    description: 'Generate high-quality images from text prompts using latest models.',
    implementation: 'Creates lib/imageGenService.ts and app/api/ai/image-gen/route.ts image proxy API.',
    compatibilityTag: '✓ Compatible with your stack',
    isCompatible: true,
    defaultPrompt: 'Build an Image Generator service supporting text-to-image prompt generation and caching.',
    iconName: 'Image',
  },
  {
    id: 'summarizer',
    name: 'Summarizer',
    category: 'Productivity',
    description: 'Turn long text into key points with structured summaries.',
    implementation: 'Creates lib/summarizerService.ts and app/api/ai/summarize/route.ts summarization route.',
    compatibilityTag: '✓ Native fit for your codebase',
    isCompatible: true,
    defaultPrompt: 'Build a text and document Summarizer service returning structured bullet points and TL;DR.',
    iconName: 'FileText',
  },
  {
    id: 'speech-to-text',
    name: 'Speech to Text',
    category: 'Audio',
    description: 'Convert audio to accurate transcripts with speaker detection.',
    implementation: 'Creates lib/transcriptionService.ts and app/api/ai/speech-to-text/route.ts audio pipeline.',
    compatibilityTag: '✓ Compatible with your stack',
    isCompatible: true,
    defaultPrompt: 'Build a Speech to Text transcription service with speaker diarization support.',
    iconName: 'Mic',
  },
  {
    id: 'language-translator',
    name: 'Language Translator',
    category: 'Localization',
    description: 'Translate text between multiple languages with context awareness.',
    implementation: 'Creates lib/translationService.ts and app/api/ai/translate/route.ts localization service.',
    compatibilityTag: '✓ Native fit for your codebase',
    isCompatible: true,
    defaultPrompt: 'Build a multi-language translation service preserving markdown formatting and context.',
    iconName: 'Languages',
  },
  {
    id: 'data-analyzer',
    name: 'Data Analyzer',
    category: 'Analytics',
    description: 'Extract insights from your data using natural language queries.',
    implementation: 'Creates lib/dataAnalyzerService.ts and app/api/ai/data-analyzer/route.ts SQL/Data assistant.',
    compatibilityTag: '✓ Native fit for your codebase',
    isCompatible: true,
    defaultPrompt: 'Build a natural language Data Analyzer service that converts questions to structured chart data.',
    iconName: 'BarChart2',
  },
  {
    id: 'content-moderation',
    name: 'Content Moderation',
    category: 'Safety',
    description: 'Detect harmful, offensive or policy violating content in real-time.',
    implementation: 'Creates lib/moderationService.ts and app/api/ai/moderation/route.ts safety filter.',
    compatibilityTag: '✓ Native fit for your codebase',
    isCompatible: true,
    defaultPrompt: 'Build a Content Moderation API to detect toxicity, spam, and safety policy violations.',
    iconName: 'ShieldCheck',
  },
];

export function getFeatureCatalog(repoName?: string): {
  domain: string;
  detectedStack: string;
  placeholder: string;
  features: CatalogFeature[];
} {
  const name = (repoName || '').toLowerCase();

  let domainFeatures: CatalogFeature[] = [];

  if (name.includes('resummit') || name.includes('interview') || name.includes('resume') || name.includes('career')) {
    domainFeatures = [
      {
        id: 'mock-interview',
        name: 'Mock Interview Generator',
        category: 'Career & Evaluation',
        description: 'Role-tailored interview questions with automated answer keys.',
        implementation: 'Creates lib/mockInterviewService.ts and app/api/ai/mock-interview/route.ts.',
        compatibilityTag: '✓ Native fit for your stack',
        isCompatible: true,
        defaultPrompt: 'Build a mock interview question generator service with technical and behavioral categories.',
        iconName: 'Bot',
      },
      {
        id: 'resume-scoring',
        name: 'AI Resume Scoring',
        category: 'Document Processing',
        description: 'Parses resumes, scores candidate fit, and provides feedback.',
        implementation: 'Creates lib/resumeScoringService.ts and app/api/ai/resume-score/route.ts.',
        compatibilityTag: '✓ Compatible with your stack',
        isCompatible: true,
        defaultPrompt: 'Build an AI resume scoring and feedback analyzer service.',
        iconName: 'BookOpen',
      },
    ];
  }

  return {
    domain: 'Enterprise Next.js Stack',
    detectedStack: 'Next.js App Router + TypeScript + Supabase/PostgreSQL',
    placeholder: 'e.g. Build a mock interview question generator service with technical, behavioral, and system design categories.',
    features: [...STANDARD_FEATURES, ...domainFeatures],
  };
}

const CATEGORY_STYLE: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  Productivity: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <MessageSquare className="w-5 h-5" /> },
  'Developer Tools': { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: <Code2 className="w-5 h-5" /> },
  Multimedia: { bg: 'bg-purple-50', text: 'text-purple-600', icon: <ImageIcon className="w-5 h-5" /> },
  Audio: { bg: 'bg-rose-50', text: 'text-rose-600', icon: <Mic className="w-5 h-5" /> },
  Localization: { bg: 'bg-sky-50', text: 'text-sky-600', icon: <Languages className="w-5 h-5" /> },
  Analytics: { bg: 'bg-teal-50', text: 'text-teal-600', icon: <BarChart2 className="w-5 h-5" /> },
  Safety: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: <ShieldCheck className="w-5 h-5" /> },
  'Career & Evaluation': { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Bot className="w-5 h-5" /> },
  'Document Processing': { bg: 'bg-violet-50', text: 'text-violet-600', icon: <BookOpen className="w-5 h-5" /> },
};

function renderFeatureIcon(feature: CatalogFeature) {
  const style = CATEGORY_STYLE[feature.category] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Sparkles className="w-5 h-5" /> };
  
  if (feature.iconName === 'MessageSquare') return <MessageSquare className="w-5 h-5" />;
  if (feature.iconName === 'Code2') return <Code2 className="w-5 h-5" />;
  if (feature.iconName === 'Image') return <ImageIcon className="w-5 h-5" />;
  if (feature.iconName === 'FileText') return <FileText className="w-5 h-5" />;
  if (feature.iconName === 'Mic') return <Mic className="w-5 h-5" />;
  if (feature.iconName === 'Languages') return <Languages className="w-5 h-5" />;
  if (feature.iconName === 'BarChart2') return <BarChart2 className="w-5 h-5" />;
  if (feature.iconName === 'ShieldCheck') return <ShieldCheck className="w-5 h-5" />;
  if (feature.iconName === 'Bot') return <Bot className="w-5 h-5" />;
  if (feature.iconName === 'BookOpen') return <BookOpen className="w-5 h-5" />;
  
  return style.icon;
}

interface FeatureCatalogProps {
  repoName?: string;
  onGenerate: (prompt: string, model: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function FeatureCatalog({
  repoName,
  onGenerate,
  loading = false,
  error = null,
}: FeatureCatalogProps) {
  const catalog = useMemo(() => getFeatureCatalog(repoName), [repoName]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [selectedFeature, setSelectedFeature] = useState<CatalogFeature | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    catalog.features.forEach(f => set.add(f.category));
    return ['All', ...Array.from(set)];
  }, [catalog]);

  const filteredFeatures = useMemo(() => {
    return catalog.features.filter(f => {
      const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQ = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.category.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [catalog, selectedCategory, searchQuery]);

  const handleCardClick = (feature: CatalogFeature) => {
    setSelectedFeature(feature);
  };

  const handleDeployModal = (feature: CatalogFeature) => {
    onGenerate(feature.defaultPrompt, selectedModel);
    setSelectedFeature(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 font-sans text-slate-900 pb-12">
      {/* GOOGLE STORE / VERTEX STYLE HERO SECTION */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
        {/* Stacked Icon Logo */}
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md hover:scale-105 transition-transform cursor-pointer">
          <Layers className="w-6 h-6 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 font-sans">
          AI Feature Store
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-500 font-normal leading-relaxed max-w-xl mx-auto">
          Discover, use and deploy production-ready AI features, templates and integrations for your codebase.
        </p>

        {/* Round Pill Search Bar */}
        <div className="relative max-w-2xl mx-auto pt-2">
          <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI features by name or keyword..."
            className="w-full bg-white border border-slate-200/90 hover:border-slate-300 focus:border-blue-500 rounded-full pl-13 pr-14 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-xs transition-all"
          />
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="flex items-center justify-center gap-2 flex-wrap max-w-4xl mx-auto pt-2">
        {categories.map(cat => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer ${
                active
                  ? 'bg-slate-900 text-white shadow-sm font-bold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="max-w-3xl mx-auto p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 4-COLUMN CARDS GRID (EXACTLY MATCHING GOOGLE STORE DESIGN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredFeatures.map((feature) => {
          const style = CATEGORY_STYLE[feature.category] || { bg: 'bg-slate-50', text: 'text-slate-600', icon: <Sparkles className="w-5 h-5" /> };
          
          return (
            <div
              key={feature.id}
              onClick={() => handleCardClick(feature)}
              className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer group h-[220px]"
            >
              <div>
                {/* Top Colorful Icon Box */}
                <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.text} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  {renderFeatureIcon(feature)}
                </div>

                {/* Card Title */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-4 tracking-tight">
                  {feature.name}
                </h3>

                {/* Card Subtitle/Description */}
                <p className="text-xs text-slate-500 leading-relaxed font-normal mt-1.5 line-clamp-2">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Tag Pill */}
              <div className="pt-2">
                <span className="inline-block bg-slate-100/90 text-slate-600 text-[11px] font-medium px-3 py-1 rounded-full border border-slate-200/50">
                  {feature.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED MODAL WHEN CLICKING ANY FEATURE CARD */}
      {selectedFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative">
            <button
              type="button"
              onClick={() => setSelectedFeature(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Feature Header */}
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl ${CATEGORY_STYLE[selectedFeature.category]?.bg || 'bg-blue-50'} ${CATEGORY_STYLE[selectedFeature.category]?.text || 'text-blue-600'} flex items-center justify-center flex-shrink-0 shadow-xs`}>
                {renderFeatureIcon(selectedFeature)}
              </div>
              <div className="space-y-1 pr-6">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {selectedFeature.category}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {selectedFeature.name}
                </h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              {selectedFeature.description}
            </p>

            {/* Implementation AST Details */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Target Code Architecture
              </span>
              <p className="text-slate-800 font-mono text-[11px] leading-relaxed font-medium">
                {selectedFeature.implementation}
              </p>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-900">
                Select Inference AI Model:
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.provider}) — {m.cost}
                  </option>
                ))}
              </select>
            </div>

            {/* Deploy PR Action Button */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedFeature(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleDeployModal(selectedFeature)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Pull Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
