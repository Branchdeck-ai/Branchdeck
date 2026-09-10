'use client';
import WaitlistModal from "@/components/WaitlistModal";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  motion, useScroll, useTransform, AnimatePresence,
  useMotionValue, useSpring, useInView, Variants,
} from 'framer-motion';
import ContactModal from '@/components/ContactModal';
import {
  GitBranch, Compass, BookOpen, Search, ArrowRight, CheckCircle2, X, Check, Code, Layers,
  ShieldCheck, FileText, GraduationCap, Sparkles, Play, ChevronDown, ChevronRight, ShieldAlert,
  Terminal, Radio, Zap, Globe, Users, Network, Map, FileSearch, BarChart3, GitMerge, Eye, Cpu, Star, Menu,
  MessageSquare, GitFork, Files, Boxes, Box, Columns, MoreHorizontal, Mail, Activity, Settings, GitPullRequest
} from 'lucide-react';
import DotGrid from './DotGrid';
import ScrollVelocity from './ScrollVelocity';
import ProfileCard from './ProfileCard';
import StaggeredMenu from './StaggeredMenu';
import Stepper, { Step } from './Stepper';
import LightRays from './LightRays';
import BorderGlow from './BorderGlow';
import CardSwap, { Card } from './CardSwap';
import FlowingMenu from './FlowingMenu';


/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
interface MarketingLandingProps {
  session?: any;
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  analyzing: boolean;
  onAnalyze: (customRepo?: string) => void;
  onLoadDemo: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onSignOut?: () => void;
  onOpenRepoPicker?: () => void;
}

/* ═══════════════════════════════════════════════════
   TYPING ANIMATION HOOK
═══════════════════════════════════════════════════ */
function useTypingAnimation(words: string[], speed = 80, pauseMs = 1800) {
  const [displayed, setDisplayed] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        setCharIdx(c => c + 1);
      }, speed);
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), pauseMs);
    } else if (deleting && charIdx >= 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        setCharIdx(c => c - 1);
      }, speed / 2);
    } else {
      setDeleting(false);
      setWordIdx(w => (w + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, wordIdx, words, speed, pauseMs]);

  return displayed;
}

/* ═══════════════════════════════════════════════════
   DATA FLOW BACKGROUND — network for CTA section
═══════════════════════════════════════════════════ */
function DataFlowCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    interface Node { x: number; y: number; vx: number; vy: number; r: number; }
    const nodes: Node[] = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      r: Math.random() * 2.5 + 1,
    }));

    const CONN_DIST = 140;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONN_DIST) {
            const alpha = (1 - dist / CONN_DIST) * 0.15;
            ctx.strokeStyle = `rgba(66,133,244,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      // nodes
      nodes.forEach(n => {
        ctx.fillStyle = 'rgba(66,133,244,0.25)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />;
}

/* ═══════════════════════════════════════════════════
   SCROLL PROGRESS BAR
═══════════════════════════════════════════════════ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return <motion.div className="fixed top-0 left-0 right-0 z-[100] h-[2px] bg-neutral-950 origin-left" style={{ scaleX }} />;
}

/* ═══════════════════════════════════════════════════
   FADE-IN WRAPPER
═══════════════════════════════════════════════════ */
// easeOutExpo — premium cinematic ease matching antigravity.google
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

function FadeIn({
  children, delay = 0, className = '', direction = 'up',
}: { children: React.ReactNode; delay?: number; className?: string; direction?: 'up' | 'left' | 'right' | 'none'; }) {
  const ref = useRef<HTMLDivElement>(null);
  // Earlier trigger (-100px) so animations start before element reaches viewport center
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const dirs = {
    up: { hidden: { opacity: 0, y: 28, filter: 'blur(2px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } },
    left: { hidden: { opacity: 0, x: -32, filter: 'blur(2px)' }, visible: { opacity: 1, x: 0, filter: 'blur(0px)' } },
    right: { hidden: { opacity: 0, x: 32, filter: 'blur(2px)' }, visible: { opacity: 1, x: 0, filter: 'blur(0px)' } },
    none: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  };
  return (
    <motion.div ref={ref} className={className} initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={dirs[direction]}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_EXPO }}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════
   STAGGER
═══════════════════════════════════════════════════ */
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(2px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/* ═══════════════════════════════════════════════════
   MAGNETIC BUTTON
═══════════════════════════════════════════════════ */
function MagneticBtn({ children, className = '', onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 280, damping: 22 });
  const sy = useSpring(y, { stiffness: 280, damping: 22 });
  return (
    <motion.button ref={ref} style={{ x: sx, y: sy }} whileTap={{ scale: 0.97 }} onClick={onClick}
      onMouseMove={e => {
        const r = ref.current?.getBoundingClientRect();
        if (r) { x.set((e.clientX - r.left - r.width / 2) * 0.25); y.set((e.clientY - r.top - r.height / 2) * 0.25); }
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}>
      {children}
    </motion.button>
  );
}

/* ═══════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════ */
const TYPING_WORDS = ["Codebase", "Repository", "Dependency", "Service", "System"];

const FEATURES = [
  { icon: <Search className="w-5 h-5" />, title: 'AI-Powered Search', desc: 'Semantic search over your product\'s own data, wired into your existing UI and auth, not a separate widget bolted on top.', color: '#4285F4' },
  { icon: <MessageSquare className="w-5 h-5" />, title: 'Support & Ops Agents', desc: 'AI agents that handle first-line support or internal ops tasks, built against your actual data models and permission structure.', color: '#34A853' },
  { icon: <FileText className="w-5 h-5" />, title: 'Document Processing', desc: 'Automated extraction, classification, and routing for the documents your business already handles, matched to your existing pipeline, not a rebuild of it.', color: '#EA4335' },
  { icon: <BarChart3 className="w-5 h-5" />, title: 'Spend Governance Dashboard', desc: 'Real-time visibility into what every AI feature costs to run, broken down by feature, with alerts before spend spikes.', color: '#FBBC04' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'We Read Your Repo, Not a Demo', desc: 'Our tree-sitter AST engine parses your actual codebase, including naming conventions, error handling, service boundaries, and test patterns, so what we build looks like your team wrote it.', icon: <GitBranch className="w-5 h-5" /> },
  { step: '02', title: 'We Build the Integration', desc: 'Search, a support agent, or document processing: whatever the feature, we generate the integration to match what\'s already there, not a generic template.', icon: <Cpu className="w-5 h-5" /> },
  { step: '03', title: 'Your Team Reviews and Merges', desc: 'We open a pull request. Your developers review it, ask questions, request changes, and merge it themselves. We never touch production.', icon: <GitMerge className="w-5 h-5" /> },
  { step: '04', title: 'We Monitor What It Costs', desc: 'Once live, our spend governance layer tracks real-time usage and cost per feature, with budget alerts before a runaway session becomes a surprise invoice.', icon: <BarChart3 className="w-5 h-5" /> },
];

// Custom per-feature preview illustrations matching real Branchdeck Retainer Portal UI
function FeatureRealPreview({ activeFeature }: { activeFeature: number }) {
  const previews = [
    /* 0 — AI-Powered Search */
    <div key="search" className="w-full h-full bg-[#f8fafc] text-slate-900 p-5 flex flex-col justify-between text-left select-none font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="text-xs font-black text-slate-900 tracking-tight">AI Semantic Search Integration</div>
          <div className="text-[10px] text-slate-500 font-medium">Wired into native auth &amp; AST codebase index &bull; demo-workspace</div>
        </div>
        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Merged to main
        </span>
      </div>

      <div className="flex items-center gap-2 bg-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-sm">
        <Search className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-200 flex-1 font-mono">search(&quot;How does customer authentication handle OAuth tokens?&quot;)</span>
        <span className="text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">99.4% AST Match</span>
      </div>

      <div className="space-y-1.5 flex-1 my-2">
        {[
          { file: 'src/auth/oauth.service.ts:42', snippet: 'async verifyToken(token: string): Promise<UserClaims>', match: '99.4%' },
          { file: 'src/auth/strategies/google.strategy.ts:18', snippet: 'async validate(accessToken, refreshToken, profile)', match: '98.8%' },
          { file: 'src/user/user.controller.ts:88', snippet: '@UseGuards(AuthGuard("oauth"))', match: '99.1%' }
        ].map((r, idx) => (
          <div key={idx} className="p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-[9px] font-mono text-slate-500 font-semibold">{r.file}</div>
              <code className="text-[10px] font-mono text-slate-900 font-bold">{r.snippet}</code>
            </div>
            <span className="text-[8px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{r.match}</span>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Token Usage: <strong>1.2M tokens</strong> ($58.40)</span>
        <span className="text-emerald-700 font-bold">Zero Production Bypass</span>
      </div>
    </div>,

    /* 1 — Support & Ops Agents */
    <div key="agents" className="w-full h-full bg-[#f8fafc] text-slate-900 p-5 flex flex-col justify-between text-left select-none font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="text-xs font-black text-slate-900 tracking-tight">Support &amp; Ops Agent Integration</div>
          <div className="text-[10px] text-slate-500 font-medium">AST Data Model Verified &bull; First-Line Ops Automation</div>
        </div>
        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <GitPullRequest className="w-3 h-3 text-blue-600" /> PR #142 Ready
        </span>
      </div>

      <div className="space-y-2 flex-1 my-2">
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>Incoming Ticket #4821</span>
            <span className="text-amber-600 font-mono">Priority: High</span>
          </div>
          <div className="text-xs font-bold text-slate-900">&quot;User requested invoice refund for subscription #sub_928&quot;</div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 font-mono">
            <span>OpsAgent Action Executed</span>
            <span>AST Score: 98.8%</span>
          </div>
          <div className="text-[11px] leading-relaxed">
            Parsed <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-blue-200">SubscriptionModel</code>, validated permission boundary <code className="font-mono text-slate-900 font-bold bg-white px-1 py-0.5 rounded border border-blue-200">UserRole.SUPPORT_TIER_1</code>, and opened PR #142 for dev review.
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Period Cost: <strong>$64.20</strong> (1.8M tokens)</span>
        <span className="text-blue-700 font-bold">100% Dev Reviewed &bull; Merges on Approval</span>
      </div>
    </div>,

    /* 2 — Document Processing */
    <div key="docs" className="w-full h-full bg-[#f8fafc] text-slate-900 p-5 flex flex-col justify-between text-left select-none font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="text-xs font-black text-slate-900 tracking-tight">Document Processing Pipeline</div>
          <div className="text-[10px] text-slate-500 font-medium">Automated PDF intake, AST schema extraction &amp; auto-PR routing</div>
        </div>
        <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Active Retainer
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 my-3">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-center space-y-1">
          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Stage 01 &bull; Intake</div>
          <div className="text-xs font-black text-slate-900">PDF Classification</div>
          <div className="text-[8px] font-mono text-emerald-600 font-bold bg-emerald-50 py-0.5 rounded border border-emerald-200 mt-1">99.1% Accuracy</div>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 shadow-2xs text-center space-y-1">
          <div className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">Stage 02 &bull; Extraction</div>
          <div className="text-xs font-black text-blue-950">AST Schema Sync</div>
          <div className="text-[8px] font-mono text-blue-700 font-bold bg-white py-0.5 rounded border border-blue-200 mt-1">Matched to DB Model</div>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 shadow-2xs text-center space-y-1">
          <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Stage 03 &bull; Routing</div>
          <div className="text-xs font-black text-emerald-950">Auto-PR Generation</div>
          <div className="text-[8px] font-mono text-emerald-700 font-bold bg-white py-0.5 rounded border border-emerald-200 mt-1">PR #98 Active</div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 font-mono">
        <span>Token Usage: <strong>410K tokens</strong> ($20.20)</span>
        <span className="text-emerald-700 font-bold">Zero Cost Spikes Detected</span>
      </div>
    </div>,

    /* 3 — Spend Governance Dashboard */
    <div key="spend" className="w-full h-full bg-[#f8fafc] text-slate-900 p-5 flex flex-col justify-between text-left select-none font-sans">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <div className="text-xs font-black text-slate-900 tracking-tight">Spend Governance &amp; Token Dashboard</div>
          <div className="text-[10px] text-slate-500 font-medium">Real-time cost attribution across active retainer features &bull; demo-workspace</div>
        </div>
        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Spend Healthy &bull; 0 Spikes
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 my-2">
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[8px] font-bold text-slate-400 uppercase">Total Period Spend</div>
          <div className="text-sm font-black text-slate-900 mt-0.5">$142.80</div>
          <div className="text-[8px] text-slate-500 font-medium">of $500 cap (28%)</div>
        </div>
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[8px] font-bold text-slate-400 uppercase">Semantic Search</div>
          <div className="text-sm font-black text-blue-700 mt-0.5">$58.40</div>
          <div className="text-[8px] text-slate-500 font-medium">1.2M tokens (41%)</div>
        </div>
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[8px] font-bold text-slate-400 uppercase">Support Agent</div>
          <div className="text-sm font-black text-indigo-700 mt-0.5">$64.20</div>
          <div className="text-[8px] text-slate-500 font-medium">1.8M tokens (45%)</div>
        </div>
        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[8px] font-bold text-slate-400 uppercase">Doc Processing</div>
          <div className="text-sm font-black text-emerald-700 mt-0.5">$20.20</div>
          <div className="text-[8px] text-slate-500 font-medium">410K tokens (14%)</div>
        </div>
      </div>

      <div className="p-2 rounded-xl bg-slate-900 text-white text-[9px] flex items-center justify-between font-mono">
        <span>Retainer Cap Threshold: $500.00 &bull; Auto-Throttle Safety Active at 90%</span>
        <span className="text-emerald-400 font-bold">100% Protected</span>
      </div>
    </div>,
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeFeature}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full h-full"
      >
        {previews[activeFeature]}
      </motion.div>
    </AnimatePresence>
  );
}


const USE_CASES = [
  { title: 'Reads Your Real Repo', desc: 'Tree-sitter AST engine parses your actual codebase, including naming conventions, error handling, service boundaries, and test patterns.', icon: <GitBranch className="w-4 h-4" /> },
  { title: 'Builds Matching AI Features', desc: 'Generates semantic search, support/ops agents, and document processing written to match your existing patterns.', icon: <Cpu className="w-4 h-4" /> },
  { title: 'Ships via Pull Requests', desc: 'Branchdeck never touches production. Your developers review and merge every change themselves.', icon: <GitMerge className="w-4 h-4" /> },
  { title: 'Tracks Cost Once Live', desc: 'Spend governance layer monitors real-time token and API usage per feature, with alerts before spend spikes.', icon: <BarChart3 className="w-4 h-4" /> },
  { title: 'Client Spend Dashboard', desc: 'Real-time visibility into usage and cost per feature, providing clear monthly metrics.', icon: <CheckCircle2 className="w-4 h-4" /> },
  { title: '41% Enterprise AI Spend', desc: 'Plugs into implementation and integration, the largest single line item in enterprise AI budgets.', icon: <Sparkles className="w-4 h-4" /> },
];

const LOGO_SVG = (
  <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

/* ═══════════════════════════════════════════════════
   HERO COMPONENT (standalone for hook order safety)
   Matches Antigravity.google layout flow and spacing.
 ═══════════════════════════════════════════════════ */
interface HeroProps {
  onLoadDemo: () => void;
  onSignUp?: () => void;
  onSignIn?: () => void;
  setIsModalOpen: (open: boolean) => void;
  setIsContactModalOpen: (open: boolean) => void;
  typedWord: string;
  isDarkMode?: boolean;
  session?: any;
}

function Hero({ onLoadDemo, onSignUp, onSignIn, setIsModalOpen, setIsContactModalOpen, typedWord, isDarkMode, session }: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const rawScale = useTransform(scrollYProgress, [0, 0.85], [0.96, 1.02]);
  const rawY = useTransform(scrollYProgress, [0, 0.85], [0, -40]);
  const dashboardScale = useSpring(rawScale, { stiffness: 70, damping: 20, restDelta: 0.001 });
  const dashboardY = useSpring(rawY, { stiffness: 70, damping: 20, restDelta: 0.001 });

  return (
    <section ref={heroRef} id="product" className={`relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-40 pb-32 transition-colors duration-300 ${isDarkMode ? 'bg-[#070913] text-white' : 'bg-white text-slate-900'}`}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: isDarkMode ? 0.35 : 0.08 }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#3279F9"
          raysSpeed={0.7}
          lightSpread={0.6}
          rayLength={1.8}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0.05}
          distortion={0.03}
          pulsating={true}
        />
      </div>
      <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: isDarkMode ? 0.3 : 0.35 }}>
        <DotGrid
          dotSize={2}
          gap={18}
          baseColor={isDarkMode ? '#3b4260' : '#e2e8f0'}
          activeColor={isDarkMode ? '#ffffff' : '#2563eb'}
          proximity={120}
          shockRadius={200}
          shockStrength={4}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="orb-1 absolute" style={{
          top: '15%', left: '8%',
          width: 480, height: 480,
          borderRadius: '50%',
          background: isDarkMode ? 'radial-gradient(circle, rgba(66,133,244,0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(66,133,244,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div className="orb-2 absolute" style={{
          top: '30%', right: '6%',
          width: 360, height: 360,
          borderRadius: '50%',
          background: isDarkMode ? 'radial-gradient(circle, rgba(124,77,255,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(124,77,255,0.05) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }} />
        <div className="orb-3 absolute" style={{
          bottom: '20%', left: '35%',
          width: 320, height: 320,
          borderRadius: '50%',
          background: isDarkMode ? 'radial-gradient(circle, rgba(0,188,212,0.10) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(0,188,212,0.04) 0%, transparent 70%)',
          filter: 'blur(55px)',
        }} />
      </div>

      <div className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{ background: isDarkMode ? 'radial-gradient(ellipse 85% 65% at 50% 40%, transparent 25%, rgba(7, 9, 19, 0.85) 100%)' : 'radial-gradient(ellipse 85% 65% at 50% 40%, transparent 25%, rgba(255, 255, 255, 0.95) 100%)' }} />

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 text-center px-6 max-w-5xl mx-auto w-full">

        <motion.div initial={{ opacity: 0, y: 32, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2, ease: EASE_OUT_EXPO }}>
          <h1 className={`text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold leading-[1.05] tracking-tight mb-6 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            AI Features, Built Directly Into Your Codebase, Not Bolted On
          </h1>
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, delay: 0.38, ease: EASE_OUT_EXPO }}
          className={`text-[clamp(1rem,1.8vw,1.18rem)] font-normal leading-relaxed max-w-3xl mx-auto mb-8 transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-neutral-600'}`}>
          Branchdeck analyzes your actual repo rather than a sandbox and ships AI search, support agents, and document processing that match your existing code patterns. Your developers review and merge every change.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.5, ease: EASE_OUT_EXPO }}
          className="flex items-center justify-center gap-3.5 flex-wrap mb-12"
        >
          {/* Primary CTA — only button in hero */}
          {session?.user ? (
            <a
              href="/dashboard"
              className="text-[14px] sm:text-[15px] font-extrabold px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          ) : (
            <button
              onClick={onSignUp}
              className="text-[14px] sm:text-[15px] font-extrabold px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </motion.div>

      </motion.div>

      <motion.div
        style={{ scale: dashboardScale, y: dashboardY }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.72, ease: EASE_OUT_EXPO }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 mt-24">
        <RealDashboardPreview onLoadDemo={onLoadDemo} />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-28 blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #4285F4, transparent)' }} />
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, ease: EASE_OUT_EXPO }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
        <span className="text-[9px] text-neutral-400 font-medium tracking-widest uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function RealDashboardPreview({ onLoadDemo }: { onLoadDemo: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative w-full group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onLoadDemo}
    >
      {/* Outer glow */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0.4 }}
        transition={{ duration: 0.4 }}
        className="absolute -inset-px rounded-2xl pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(66,133,244,0.25), rgba(52,168,83,0.2), rgba(99,102,241,0.18))', filter: 'blur(16px)' }}
      />

      {/* New Light-Mode Retainer Dashboard Chrome Frame */}
      <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)] select-none text-slate-900">
        {/* Top Window Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <span className="ml-3 text-[11px] font-mono text-slate-300 flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-blue-400" />
              Branchdeck Client Retainer Portal &bull; demo-workspace
            </span>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Spend Healthy &bull; $142.80 / $500
            </span>
          </div>
        </div>

        {/* Dashboard Canvas: Left Sidebar + Main Content */}
        <div className="flex min-h-[480px] bg-[#f8fafc]">
          {/* Left Sidebar (Hidden on mobile screens) */}
          <div className="hidden md:flex w-52 bg-white border-r border-slate-200 p-4 flex-col justify-between flex-shrink-0 text-left">
            <div className="space-y-6">
              {/* Brand Logo */}
              <div className="flex items-center gap-2.5 px-2">
                <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain rounded-lg shadow-xs" />
                <div>
                  <div className="font-extrabold text-xs text-slate-900 leading-none">Branchdeck</div>
                  <div className="text-[9px] text-slate-400 font-semibold mt-0.5">Client Portal</div>
                </div>
              </div>

              {/* Nav Items */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-100">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
                  <Cpu className="w-4 h-4 text-slate-400" />
                  <span>Integrations</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <span>Usage &amp; Cost</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
                  <GitBranch className="w-4 h-4 text-slate-400" />
                  <span>Repos</span>
                </div>
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50">
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </div>
              </div>
            </div>

            {/* Profile badge */}
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">A</div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold text-slate-900 truncate">adelmuhammed786</div>
                <div className="text-[8px] text-slate-400 truncate">adelmuhammed786@gmail.com</div>
              </div>
            </div>
          </div>

          {/* Main Dashboard Canvas Body */}
          <div className="flex-1 p-5 space-y-4 text-left overflow-hidden">
            {/* Topbar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-700 font-mono">demo-workspace</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[10px] font-bold">
                  <span className="px-2 py-0.5 bg-white rounded text-blue-700 shadow-2xs">30d</span>
                  <span className="px-2 py-0.5 text-slate-600">7d</span>
                  <span className="px-2 py-0.5 text-slate-600">MTD</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Spend Healthy &bull; No Spikes
                </span>
              </div>
            </div>

            {/* Header Title */}
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Dashboard Overview</h3>
              <p className="text-[11px] text-slate-500 font-medium">AI integration retainer overview &bull; demo-workspace</p>
            </div>

            {/* 4 KPI Cards Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Active Integrations</div>
                <div className="text-xl font-black text-slate-900 mt-1">5</div>
                <div className="text-[9px] text-emerald-600 font-semibold mt-0.5">5 total live</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Requests (30d)</div>
                <div className="text-xl font-black text-slate-900 mt-1">2,640</div>
                <div className="text-[9px] text-blue-600 font-semibold mt-0.5">2.6K calls</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Spend This Period</div>
                <div className="text-xl font-black text-slate-900 mt-1">$142.80</div>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5">of $500.00 cap &bull; 28%</div>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Avg Latency</div>
                <div className="text-xl font-black text-slate-900 mt-1">340ms</div>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5">across integrations</div>
              </div>
            </div>

            {/* Middle Grid: Spend Chart & Gauge */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-8 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800">Spend Over Time</span>
                  <span className="text-[9px] text-blue-600 font-bold font-mono">Daily Cost USD</span>
                </div>
                <svg viewBox="0 0 400 70" className="w-full h-16 stroke-blue-500 fill-blue-500/10">
                  <path d="M0,50 Q40,40 80,45 T160,25 T240,30 T320,15 T400,10 L400,70 L0,70 Z" strokeWidth="2" />
                </svg>
              </div>

              <div className="col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                <div className="text-[11px] font-bold text-slate-800">Budget Utilization</div>
                <div className="text-center py-1">
                  <div className="text-xl font-black text-slate-900 font-mono">28%</div>
                  <div className="text-[9px] text-slate-400 font-semibold">$142.80 / $500 cap</div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 w-[28%]" />
                </div>
              </div>
            </div>

            {/* Bottom Row: Active Integrations Table */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 border-b border-slate-100 pb-1.5">
                <span>Active AI Integrations</span>
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">5 Features Live</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {[
                  { name: 'AI Semantic Search', type: 'Vector Search', status: 'Merged to main', ast: '99.4%', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  { name: 'Support & Ops Agent', type: 'Ticket Assistant', status: 'PR #142 Ready', ast: '98.8%', statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
                  { name: 'Document Processing', type: 'PDF Pipeline', status: 'Active Retainer', ast: '99.1%', statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-600">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono">AST match: <strong className="text-slate-900">{item.ast}</strong></span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Click Overlay */}
      <motion.div
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl backdrop-blur-[2px]"
        style={{ background: 'rgba(7, 9, 19, 0.45)' }}
      >
        <div className="bg-white text-slate-900 text-[13px] font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-2xl transform transition-transform group-hover:scale-105">
          <Play className="w-4 h-4 text-blue-600 fill-blue-600" /> Open Live Dashboard
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HERO COMPONENT (standalone for hook order safety)
   Matches Antigravity.google layout flow and spacing.
═══════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function MarketingLanding({
  session, repoUrl, setRepoUrl, analyzing, onAnalyze, onLoadDemo, onSignIn, onSignUp, onSignOut, onOpenRepoPicker,
}: MarketingLandingProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const onOpenWaitlist = () => setIsModalOpen(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [vscodeActiveTab, setVscodeActiveTab] = useState(0);
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const typedWord = useTypingAnimation(TYPING_WORDS);
  const marqueeTexts = useMemo(() => ['Branchdeck ✦', 'AI-Powered Search ✦', 'Support & Ops Agents ✦', 'Document Processing ✦', 'Spend Governance ✦'], []);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('branchdeck-theme') || 'light';
    setIsDarkMode(savedTheme === 'dark');
    document.documentElement.dataset.theme = savedTheme;
  }, []);

  const toggleDarkMode = () => {
    const nextTheme = isDarkMode ? 'light' : 'dark';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('branchdeck-theme', nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  };

  useEffect(() => { const u = scrollY.on('change', v => setScrolled(v > 50)); return () => u(); }, [scrollY]);
  useEffect(() => { const t = setInterval(() => setActiveFeature(f => (f + 1) % FEATURES.length), 3500); return () => clearInterval(t); }, []);

  /* ── NAVBAR ── */
  const NavBar = () => (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? isDarkMode
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/80 shadow-[0_1px_12px_rgba(0,0,0,0.5)]'
          : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_12px_rgba(0,0,0,0.04)]'
        : 'bg-transparent'}`}
      initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 cursor-pointer select-none group flex-shrink-0"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Branchdeck Logo" className="w-7 h-7 object-contain rounded-lg" />
          </div>
          <span className={`text-sm sm:text-[14px] font-bold tracking-tight transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Branchdeck</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'How It Works', target: '#how-it-works' },
            { label: 'What We Build', target: '#what-we-build' },
            { label: 'Pricing', target: '#pricing' },
            { label: 'Case Studies', target: '#case-studies' },
            { label: 'FAQ', target: '#faq' }
          ].map(item => (
            <a key={item.label} href={item.target}
              onClick={(e) => {
                e.preventDefault();
                const elem = document.querySelector(item.target);
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`text-[13px] font-semibold transition-colors duration-200 relative group cursor-pointer ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {item.label}
              <span className={`absolute -bottom-0.5 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left ${isDarkMode ? 'bg-white' : 'bg-slate-900'}`} />
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className={`text-xs sm:text-[13px] font-bold px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer ${
                isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-200 hover:text-white' : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="hidden sm:inline">Contact Us</span>
              <span className="inline sm:hidden">Contact</span>
            </button>
            {session?.user ? (
              <>
                <a
                  href="/dashboard"
                  className={`text-xs sm:text-[13px] font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all shadow-sm flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>Dashboard</span>
                </a>
                <button
                  onClick={onSignOut}
                  className={`text-xs sm:text-[13px] font-bold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                    isDarkMode ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-600' : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  title="Sign Out"
                >
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              // Unauthenticated: only "Get Started" — no Sign In clutter
              <button
                onClick={onSignUp}
                className={`text-xs sm:text-[13px] font-semibold px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full transition-all shadow-sm flex items-center gap-1 sm:gap-2 cursor-pointer whitespace-nowrap ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-950 hover:bg-slate-850 text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <span>Get Started</span>
              </button>
            )}
          </div>

          {/* Theme Toggle Switch */}
          <button
            onClick={toggleDarkMode}
            className={`relative w-10 sm:w-12 h-6 sm:h-7 rounded-full p-0.5 transition-colors duration-300 border flex items-center cursor-pointer flex-shrink-0 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-neutral-100 border-neutral-350'
            }`}
            aria-label="Toggle theme"
          >
            {/* Sliding knob */}
            <motion.div
              layout
              className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-md transition-colors ${
                isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-neutral-600'
              }`}
              animate={{ x: isDarkMode ? 20 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {isDarkMode ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </motion.div>
          </button>

          {/* Mobile menu trigger is handled by StaggeredMenu */}
        </div>
      </div>
    </motion.header>
  );


  /* ── TAGLINE BAND ── */
  const TaglineBand = () => {
    const quoteWords = "Branchdeck analyzes your actual repo — not a sandbox — and ships AI search, support agents, and document processing that match your existing code patterns.".split(' ');
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    return (
      <section className={`py-28 px-6 transition-colors duration-300 border-t border-b bg-white border-slate-200/60`}>
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div ref={ref} className={`text-[clamp(1.3rem,3vw,2.4rem)] font-extrabold leading-tight tracking-tight max-w-3xl mx-auto transition-colors text-slate-900`}>
            {quoteWords.map((word, i) => (
              <span
                key={i}
                className="word-reveal inline-block mr-[0.25em]"
                style={{
                  animationDelay: isInView ? `${i * 0.045}s` : '0s',
                  animationPlayState: isInView ? 'running' : 'paused',
                  opacity: isInView ? undefined : 0,
                }}
              >
                {word}
              </span>
            ))}
          </div>
          <FadeIn delay={0.6} className="mt-12 flex items-center justify-center gap-5 flex-wrap">
            {[Network, BookOpen, ShieldAlert, Map, FileSearch, BarChart3, GitMerge, Eye, Cpu, Star, Zap, Globe].map((Icon, i) => (
              <motion.div key={i}
                whileHover={{ scale: 1.2, y: -3 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border cursor-default transition-all bg-white border-slate-200 text-slate-700 hover:border-slate-300 shadow-sm`}>
                <Icon className="w-4 h-4" />
              </motion.div>
            ))}
          </FadeIn>
        </div>
      </section>
    );
  };

  /* ── FEATURES ── */
  const Features = () => (
    <section id="features" className={`py-44 px-6 transition-colors duration-300 bg-white`}>
      <div className="max-w-7xl mx-auto">
        <FadeIn className="text-center mb-24">
          <span className={`text-[11px] font-bold uppercase tracking-[0.15em] mb-4 block transition-colors text-slate-400`}>CAPABILITIES</span>
          <h2 className={`text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-tight leading-tight transition-colors text-slate-900`}>Built for Engineering Teams Who Need AI That Fits</h2>
          <p className={`mt-5 text-[16px] font-normal leading-relaxed max-w-2xl mx-auto transition-colors text-slate-600`}>
            Four core integration offerings built directly into your repository.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="lg:col-span-4 space-y-2">
            {FEATURES.map((f, i) => (
              <motion.button key={i} onClick={() => setActiveFeature(i)}
                whileHover={{ x: activeFeature === i ? 0 : 6 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-400 ${activeFeature === i
                  ? 'bg-slate-950 border-slate-950 shadow-lg text-white'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-900'
                  }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${activeFeature === i ? 'bg-white/15' : 'bg-slate-50 border border-slate-200'
                    }`}
                    style={{ color: activeFeature === i ? 'white' : f.color }}>
                    {f.icon}
                  </div>
                  <div>
                    <div className={`text-[13px] font-bold mb-0.5 ${activeFeature === i ? 'text-white' : 'text-slate-900'}`}>{f.title}</div>
                    <div className={`text-[11px] leading-relaxed ${activeFeature === i ? 'text-white/65' : 'text-slate-500'}`}>{f.desc}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div key={activeFeature}
                initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`rounded-2xl overflow-hidden border h-[440px] relative shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition-colors bg-white border-slate-200`}>
                {/* Title bar */}
                <div className={`flex items-center gap-2 px-4 py-3 border-b transition-colors border-slate-100 bg-white`}>
                  <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" /></div>
                  <span className={`ml-2 text-[10px] font-semibold flex items-center gap-1.5 transition-colors text-slate-500`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {FEATURES[activeFeature].title} — Live Preview
                  </span>
                </div>
                {/* Feature-specific real preview */}
                <div className="h-[calc(100%-44px)] overflow-hidden">
                  <FeatureRealPreview activeFeature={activeFeature} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={staggerItem}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setActiveFeature(i)}
              className="cursor-pointer">
              <BorderGlow backgroundColor={isDarkMode ? '#0d111a' : '#ffffff'} glowColor={isDarkMode ? '60 140 250' : '60 120 240'} glowIntensity={0.9} borderRadius={16}>
                <div className="p-5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-neutral-50 border border-neutral-200'}`} style={{ color: f.color }}>
                    {f.icon}
                  </div>
                  <div className={`text-[12px] font-bold mb-1.5 transition-colors ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{f.title}</div>
                  <div className={`text-[11px] leading-relaxed transition-colors ${isDarkMode ? 'text-slate-450' : 'text-neutral-500'}`}>{f.desc.slice(0, 58)}...</div>
                  <div className={`mt-4 flex items-center gap-1 text-[11px] font-semibold transition-colors ${isDarkMode ? 'text-slate-400' : 'text-neutral-400'}`}>
                    Learn more <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
  /* ── PERFECT FOR (WHO IT'S FOR) ── */
  const PerfectFor = () => (
    <section className={`py-24 px-6 border-t border-b transition-colors duration-300 ${isDarkMode ? 'bg-[#070913] border-slate-900' : 'bg-white border-neutral-200/50'}`}>
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 border transition-colors ${
            isDarkMode 
              ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' 
              : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
          }`}>
            TARGET AUDIENCE
          </span>
          <h2 className={`text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Who It's For
          </h2>
          <p className={`mt-3 text-[15px] font-medium max-w-2xl mx-auto leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Engineering teams with a real, non-trivial codebase who want to ship AI features safely.
          </p>
        </FadeIn>

        <motion.div 
          variants={staggerContainer} 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            { icon: <GitBranch className="w-5 h-5" />, title: "Real Production Codebases", desc: "Teams with non-trivial software stacks who need native AI features built into existing architectures." },
            { icon: <ShieldAlert className="w-5 h-5" />, title: "Zero Architecture Risk", desc: "Teams who don't trust generic AI tools not to break their service boundaries or impose weird abstractions." },
            { icon: <Zap className="w-5 h-5" />, title: "Fast & Cost-Effective", desc: "Teams who want AI features without the heavy cost or slowness of hiring a traditional dev agency." }
          ].map((item, i) => (
            <motion.div key={i} variants={staggerItem}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={`p-6 border rounded-2xl flex flex-col items-start gap-4 text-left transition-colors duration-300 ${
                isDarkMode ? 'bg-[#0E1220] border-slate-800/90 shadow-md hover:border-slate-700' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
              }`}>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 shadow-sm ${
                isDarkMode ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' : 'bg-blue-50 border-blue-200/60 text-blue-600'
              }`}>
                {item.icon}
              </div>
              <div>
                <h3 className={`text-[15px] font-bold tracking-tight mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</h3>
                <p className={`text-[12px] leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );

  /* ── COMPARISON SECTION (DIFFERENTIATOR) ── */
  const ComparisonSection = () => (
    <section className={`py-32 px-6 border-t border-b transition-colors duration-300 ${isDarkMode ? 'bg-[#080A14] border-slate-900' : 'bg-white border-slate-200/60'}`}>
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 border transition-colors ${
            isDarkMode ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
          }`}>
            WHY BRANCHDECK
          </span>
          <h2 className={`text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Not an AI Agent. Not a Dev Shop. Something in Between.
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn delay={0.1} className={`p-8 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#0E1220] border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
            <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Generic AI coding tools</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Fast, but blind to your architecture. You spend more time reviewing than you saved.</p>
          </FadeIn>

          <FadeIn delay={0.2} className={`p-8 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#0E1220] border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
            <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Traditional dev agencies</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Careful, but slow and expensive, with no AI-native workflow to speed integration up.</p>
          </FadeIn>

          <FadeIn delay={0.3} className={`p-8 rounded-2xl border transition-colors relative overflow-hidden ${isDarkMode ? 'bg-blue-950/40 border-blue-600/80 text-white shadow-lg' : 'bg-blue-50/50 border-blue-300 shadow-md'}`}>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-500 mb-2">Branchdeck Approach</div>
            <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Branchdeck</h3>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>AST-informed AI integration, built to match your codebase, reviewed by your own team, with ongoing cost visibility built in from day one.</p>
          </FadeIn>
        </div>
      </div>
    </section>
  );

  /* ── HOW IT WORKS ── */
  const HowItWorks = () => (
    <section id="how-it-works" className={`py-36 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#0B0C15]' : 'bg-[#FAFAFB]'}`}>
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-20">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 border transition-colors ${
            isDarkMode 
              ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' 
              : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
          }`}>
            SOLUTION
          </span>
          <h2 className={`text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            How Branchdeck Works
          </h2>
          <p className={`mt-3 text-[15px] font-medium max-w-xl mx-auto leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Four simple steps to shipping native AI features in your repo.
          </p>
        </FadeIn>
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeIn key={i} delay={i * 0.1} className={`relative text-left p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#0E1220] border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
                <motion.div
                  whileHover={{ scale: 1.08, rotate: -2 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 shadow-md cursor-default transition-colors duration-300 ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-slate-950 text-white'}`}>
                  {step.icon}
                </motion.div>
                <div className={`text-[11px] font-extrabold uppercase tracking-widest mb-2 transition-colors ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{step.step}</div>
                <h3 className={`text-[15px] font-bold mb-2.5 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{step.title}</h3>
                <p className={`text-[12px] leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{step.desc}</p>
              </FadeIn>
            ))}
          </div>
          <div className="mt-12 text-center">
            <MagneticBtn
              onClick={onOpenWaitlist}
              className={`text-[14px] font-semibold px-8 py-3.5 rounded-full transition-all shadow-lg ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-950 hover:bg-slate-850 text-white'}`}
            >
              <BarChart3 className="w-4 h-4 text-blue-400 inline-block mr-2" />
              Request Demo
            </MagneticBtn>
          </div>
        </div>
      </div>
    </section>
  );

  /* ── USE CASES ── */
  const UseCases = () => (
    <section id="solutions" className={`py-36 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#0B0C15]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <FadeIn direction="left" className="lg:col-span-4 space-y-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-colors ${
              isDarkMode 
                ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' 
                : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
            }`}>
              END-TO-END WORKFLOW
            </span>
            <h2 className={`text-[clamp(2.2rem,3.8vw,3rem)] font-extrabold tracking-tight leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              How Branchdeck<br />Delivers AI Features
            </h2>
            <p className={`text-[14px] leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              From initial repo analysis to live spend monitoring, built for safety, speed, and complete team control.
            </p>
            <div className="pt-2 space-y-3.5">
              {[
                'Parses real AST structure & conventions',
                'Matches your existing service boundaries',
                'Delivers clean pull requests for your review',
                'Monitors live token & API spend per feature',
                'Provides a real-time client spend dashboard'
              ].map((item, i) => (
                <motion.div key={i} className={`flex items-center gap-3 text-[13px] font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <CheckCircle2 className={`w-4 h-4 flex-shrink-0 transition-colors ${isDarkMode ? 'text-emerald-500' : 'text-emerald-600'}`} /> {item}
                </motion.div>
              ))}
            </div>
          </FadeIn>
          <FadeIn direction="right" delay={0.2} className="lg:col-span-8">
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {USE_CASES.map((uc, i) => (
                <motion.div key={i} variants={staggerItem}
                  whileHover={{ y: -6, boxShadow: '0 16px 36px rgba(0,0,0,0.06)' }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={`border rounded-2xl p-6 space-y-3.5 cursor-default transition-all duration-300 ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
                  }`}>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-slate-950 text-white'}`}>
                    {uc.icon}
                  </motion.div>
                  <h3 className={`text-[13px] font-bold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{uc.title}</h3>
                  <p className={`text-[11px] leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{uc.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );

  /* ── VS CODE SECTION ── */
  const VsCodeSection = () => {
    const EXTENSION_FEATURES = [
      {
        icon: <BarChart3 className="w-5 h-5 text-blue-400" />,
        title: "Per-Feature Spend Tracking",
        subtitle: "Real-time token & API cost per feature."
      },
      {
        icon: <ShieldAlert className="w-5 h-5 text-emerald-400" />,
        title: "Spend Spike Alerts",
        subtitle: "Automated alerts before cost overruns."
      },
      {
        icon: <GitBranch className="w-5 h-5 text-indigo-400" />,
        title: "AST Pattern Match Rate",
        subtitle: "Audit score matching your repo style."
      },
      {
        icon: <GitMerge className="w-5 h-5 text-amber-400" />,
        title: "PR Review & Merge Audit",
        subtitle: "Complete log of features merged by devs."
      }
    ];

    return (
      <section id="vscode" className={`py-32 px-6 overflow-hidden border-t border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-[#070913] border-white/5 text-white' : 'bg-[#FAFAFB] border-slate-200/60 text-slate-900'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <FadeIn direction="left" className="lg:col-span-5 space-y-6">
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border transition-colors ${
                isDarkMode 
                  ? 'bg-indigo-950/60 border-indigo-800/80 text-indigo-400' 
                  : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
              }`}>
                CLIENT DASHBOARD &amp; COST GOVERNANCE
              </span>
              <h2 className={`text-[clamp(2.4rem,4.5vw,3.5rem)] font-extrabold tracking-tight leading-[1.1] transition-colors ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Full Visibility into<br />AI Usage &amp; Spend<span className="text-blue-600">.</span>
              </h2>
              <p className={`text-[14px] font-normal leading-relaxed mt-4 max-w-md transition-colors ${
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                Track real-time token costs and API usage per integrated feature. Get budget alerts before spend spikes so your AI footprint grows without growing your risk.
              </p>
              <div className="flex items-center gap-3 mt-6 flex-wrap">
                <button
                  onClick={onOpenWaitlist}
                  className={`text-[12px] font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' : 'bg-slate-950 hover:bg-slate-850 text-white shadow-slate-950/15'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Request Access</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-70" />
                </button>
              </div>
            </div>

            {/* Vertical Stack Cards */}
            <div className="space-y-3 pt-2">
              {EXTENSION_FEATURES.map((feat, idx) => {
                const isActive = vscodeActiveTab === idx;
                return (
                  <motion.div
                    key={idx}
                    onClick={() => setVscodeActiveTab(idx)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isActive
                        ? isDarkMode
                          ? 'bg-[#121629] border-indigo-500/50 shadow-lg shadow-indigo-950/30 text-white'
                          : 'bg-slate-900 border-slate-900 shadow-md text-white'
                        : isDarkMode
                          ? 'bg-white/[0.02] border-white/5 text-slate-400 hover:border-white/10 hover:bg-white/[0.05]'
                          : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl border transition-colors ${
                        isActive
                          ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-400'
                          : isDarkMode
                            ? 'bg-white/[0.04] border-white/5 text-slate-400'
                            : 'bg-slate-100 border-slate-200 text-slate-600'
                      }`}>
                        {feat.icon}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${
                          isActive 
                            ? 'text-white' 
                            : isDarkMode 
                              ? 'text-slate-200' 
                              : 'text-slate-900'
                        }`}>
                          {feat.title}
                        </div>
                        <div className={`text-[11px] mt-0.5 font-normal ${
                          isActive 
                            ? 'text-slate-300' 
                            : isDarkMode 
                              ? 'text-slate-400' 
                              : 'text-slate-500'
                        }`}>
                          {feat.subtitle}
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <ArrowRight className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-indigo-400' : 'text-blue-400'}`} />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </FadeIn>

          {/* Right Column: VS Code Window Mockup */}
          <FadeIn direction="right" delay={0.2} className="lg:col-span-7">
            <div className="bg-[#0B0D18] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col font-mono text-xs">
              
              {/* Inner Layout Container */}
              <div className="flex min-h-[460px]">
                {/* Left VS Code Activity Bar */}
                <div className="w-12 bg-[#070912] border-r border-white/5 flex flex-col items-center py-4 gap-5 text-slate-500 flex-shrink-0 select-none">
                  <Files className="w-4 h-4 opacity-50 hover:opacity-100 cursor-pointer" />
                  <Search className="w-4 h-4 opacity-50 hover:opacity-100 cursor-pointer" />
                  <GitBranch className="w-4 h-4 opacity-50 hover:opacity-100 cursor-pointer" />
                  <Play className="w-4 h-4 opacity-50 hover:opacity-100 cursor-pointer" />
                  <Boxes className="w-4 h-4 opacity-50 hover:opacity-100 cursor-pointer" />

                  {/* Active Branchdeck Extension Icon */}
                  <div className="mt-2 w-8 h-8 rounded-lg bg-indigo-950/90 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shadow-md">
                    <Box className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Main Code Editor Area */}
                <div className="flex-1 flex flex-col bg-[#0B0D18] overflow-hidden">
                  {/* Top Editor Tab Bar */}
                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-[#070912] text-xs select-none">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-[#0B0D18] border-t-2 border-indigo-500 px-3.5 py-1.5 rounded-t text-white text-xs font-mono">
                        <span className="text-[9px] font-extrabold px-1 rounded bg-blue-500/30 text-blue-400">TS</span>
                        <span>auth.service.ts</span>
                        <X className="w-3 h-3 text-slate-400 ml-2 hover:text-white cursor-pointer" />
                      </div>
                      {vscodeActiveTab === 1 && (
                        <div className="flex items-center gap-2 bg-[#070912] border-t-2 border-slate-700 px-3.5 py-1.5 rounded-t text-slate-400 text-xs font-mono">
                          <span className="text-[9px] font-extrabold px-1 rounded bg-emerald-500/30 text-emerald-400">TS</span>
                          <span>user.repository.ts</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Columns className="w-3.5 h-3.5 hover:text-slate-300 cursor-pointer" />
                      <MoreHorizontal className="w-3.5 h-3.5 hover:text-slate-300 cursor-pointer" />
                    </div>
                  </div>

                  {/* Editor Code View */}
                  <div className="p-5 text-xs leading-6 font-mono text-slate-300 overflow-x-auto flex-1 select-none relative">
                    <div className="flex gap-4">
                      {/* Line Numbers */}
                      <div className="text-slate-600 select-none text-right font-mono w-4 space-y-1">
                        <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div><div>15</div><div>17</div><div>19</div>
                      </div>
                      
                      {/* Code Content */}
                      <div className="space-y-1 flex-1">
                        <div><span className="text-purple-400 font-semibold">export class</span> <span className="text-yellow-300 font-semibold">AuthService</span> {'{'}</div>
                        <div className="pl-4"><span className="text-blue-400">constructor</span>(<span className="text-purple-300">private</span> <span className="text-slate-300">userRepo</span>: <span className="text-emerald-400">UserRepository</span>) {'{}'}</div>
                        <div className="h-2" />
                        <div className="pl-4"><span className="text-purple-400 font-semibold">async</span> <span className="text-blue-400 font-semibold">login</span>(<span className="text-slate-300">email</span>: <span className="text-emerald-400">string</span>, <span className="text-slate-300">password</span>: <span className="text-emerald-400">string</span>) {'{'}</div>
                        
                        {/* Highlighted Line 5 for Go To Definition */}
                        <div className={`pl-8 transition-colors ${vscodeActiveTab === 1 ? 'bg-indigo-950/60 -mx-4 px-4 py-0.5 border-l-2 border-indigo-400' : ''}`}>
                          <span className="text-purple-400">const</span> <span className="text-slate-200">user</span> = <span className="text-purple-400">await</span> <span className="text-purple-300">this</span>.userRepo.<span className="text-yellow-300 font-bold underline decoration-indigo-400 underline-offset-4">findByEmail</span>(email);
                        </div>

                        <div className="pl-8"><span className="text-purple-400">if</span> (!user) <span className="text-purple-400">throw new</span> <span className="text-emerald-400">Error</span>(<span className="text-amber-300">&apos;User not found&apos;</span>);</div>
                        <div className="h-2" />
                        <div className="pl-8"><span className="text-purple-400">const</span> <span className="text-slate-200">isValid</span> = <span className="text-purple-400 font-semibold">await</span> <span className="text-purple-300">this</span>.<span className="text-yellow-300">validatePassword</span>(</div>
                        <div className="pl-12 text-slate-300">password,</div>
                        <div className="pl-12 text-slate-300">user.passwordHash</div>
                        <div className="pl-8">);</div>
                        <div className="pl-8"><span className="text-purple-400">if</span> (!isValid) <span className="text-purple-400">throw new</span> <span className="text-emerald-400">Error</span>(<span className="text-amber-300">&apos;Invalid credentials&apos;</span>);</div>
                        <div className="h-2" />
                        <div className="pl-8"><span className="text-purple-400">const</span> <span className="text-slate-200">token</span> = <span className="text-purple-300">this</span>.<span className="text-yellow-300">generateToken</span>(user.id);</div>
                        <div className="pl-8"><span className="text-purple-400">return</span> {'{'} user, token {'}'};</div>
                        <div className="pl-4">{'}'}</div>
                        <div>{'}'}</div>
                      </div>
                    </div>

                    {/* DYNAMIC FEATURE OVERLAYS FOR THE 4 CARDS */}
                    <AnimatePresence mode="wait">
                      {vscodeActiveTab === 0 && (
                        <motion.div key="spend-tracking" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="mt-4 bg-[#0F172A] border border-blue-500/50 rounded-xl p-3.5 text-xs shadow-lg space-y-2 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-400 font-bold text-[11px] flex items-center gap-1.5">
                              <BarChart3 className="w-3.5 h-3.5" /> Per-Feature Spend Tracking · AuthService
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold font-mono">$0.028 / call</span>
                          </div>
                          <div className="text-slate-300 text-[11px] leading-relaxed">
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-1 mb-1">
                              <span>30-Day Tokens: <strong className="text-white">14.2K</strong></span>
                              <span>Feature Cost: <strong className="text-emerald-400">$58.40</strong></span>
                            </div>
                            <span className="text-slate-300">Attributed to <strong>AI Semantic Search</strong> integration. Spend rate within healthy threshold.</span>
                          </div>
                        </motion.div>
                      )}

                      {vscodeActiveTab === 1 && (
                        <motion.div key="spend-alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="mt-4 bg-[#062016] border border-emerald-500/50 rounded-xl p-3.5 text-xs shadow-lg space-y-2 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Spend Spike Governance
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">0 Spikes Detected</span>
                          </div>
                          <div className="text-slate-300 text-[11px] leading-relaxed font-mono">
                            <div className="flex items-center justify-between text-[10px]">
                              <span>Cap Limit: <strong className="text-slate-200">$500.00</strong></span>
                              <span>Current Spend: <strong className="text-emerald-300">$142.80 (28%)</strong></span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden border border-emerald-950">
                              <div className="bg-emerald-500 h-full w-[28%]" />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {vscodeActiveTab === 2 && (
                        <motion.div key="ast-rate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="mt-4 bg-[#141226] border border-indigo-500/50 rounded-xl p-3.5 text-xs shadow-lg space-y-2 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-indigo-400 font-bold text-[11px] flex items-center gap-1.5">
                              <GitBranch className="w-3.5 h-3.5" /> AST Pattern Match Audit Score
                            </span>
                            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">99.4% Match Rate</span>
                          </div>
                          <div className="text-[11px] text-slate-300 font-mono space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span>Repo Conventions: <span className="text-emerald-400 font-bold">NestJS Service Pattern</span></span>
                              <span className="text-slate-400">Tree-Sitter Parsed</span>
                            </div>
                            <div className="text-[10px] text-slate-400">Zero architectural deviation detected across 2.6K service calls.</div>
                          </div>
                        </motion.div>
                      )}

                      {vscodeActiveTab === 3 && (
                        <motion.div key="pr-audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="mt-4 bg-[#0D1B2A] border border-blue-500/50 rounded-xl p-3.5 text-xs shadow-lg space-y-2 font-sans">
                          <div className="flex items-center justify-between">
                            <span className="text-blue-400 font-bold text-[11px] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> Smart Architecture Walkthrough
                            </span>
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px] font-bold">AI Verified Context</span>
                          </div>
                          <div className="text-[11px] text-slate-300 leading-relaxed">
                            <span className="text-blue-300 font-semibold">Auth Subsystem Architecture:</span> Client requests pass through API Router &rarr; AuthController &rarr; AuthService &rarr; UserRepository. Password hashes verified via BCrypt with RS256 JWT key signing.
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* VS Code Bottom Status Bar */}
                  <div className="px-4 py-1.5 bg-[#070912] border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><GitBranch className="w-3 h-3 text-slate-400" /> main*</span>
                      <span>0 🛈 0 ⚠</span>
                    </div>
                    <span>Ln 12, Col 25 &nbsp; Spaces: 2 &nbsp; UTF-8 &nbsp; LF &nbsp; TypeScript</span>
                  </div>

                  {/* Bottom AI Codebase Query Box inside Editor */}
                  <div className="p-3 bg-[#070912]/90 border-t border-white/5">
                    <div className="flex items-center justify-between bg-[#131627] border border-indigo-500/30 rounded-xl px-4 py-2.5 shadow-inner">
                      <div className="flex items-center gap-3 flex-1">
                        <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 animate-pulse" />
                        <input
                          type="text"
                          readOnly
                          value={
                            vscodeActiveTab === 0 ? "Tracking real-time token spend per feature..." :
                            vscodeActiveTab === 1 ? "Monitoring budget limits & spike alerts..." :
                            vscodeActiveTab === 2 ? "Auditing AST repo pattern match rate..." :
                            "AI architecture context loaded."
                          }
                          className="bg-transparent text-xs text-slate-300 outline-none w-full cursor-pointer font-sans"
                        />
                      </div>
                      <button className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md transition-all">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    );
  };

  /* ── FOUNDER SECTION ── */
  const FounderSection = () => (
    <section className={`py-44 px-6 overflow-hidden border-t border-b transition-colors duration-300 ${isDarkMode ? 'bg-[#070913] border-slate-900' : 'bg-[#FAFAFB] border-slate-200/60'}`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
        <FadeIn direction="left" className="lg:col-span-7 space-y-7">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border transition-colors ${
            isDarkMode 
              ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' 
              : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
          }`}>
            ABOUT BRANCHDECK
          </span>
          <h2 className={`text-[clamp(2.2rem,3.5vw,2.8rem)] font-extrabold tracking-tight leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Native AI Features,<br />Built Into Your Codebase.
          </h2>
          <p className={`text-[15px] leading-relaxed max-w-xl transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Branchdeck is a productized AI-integration service for engineering teams who want AI features built directly into their actual codebase, not a generic AI coding tool and not a traditional dev agency.
          </p>
          <p className={`text-[15px] leading-relaxed max-w-xl transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Implementation and integration is 41% of enterprise AI spend. We plug into that real demand with a tree-sitter AST engine, pull-request safety mechanism, and live spend governance dashboard.
          </p>
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenWaitlist}
              className={`btn-shimmer text-[13px] font-semibold px-7 py-3.5 rounded-full transition-all shadow-sm ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-950 hover:bg-slate-850 text-white'}`}>
              Request Beta Access
            </motion.button>
          </div>
        </FadeIn>
        <FadeIn direction="right" delay={0.2} className="lg:col-span-5 flex justify-center w-full">
          <ProfileCard
            name="Adel Muhammed"
            title="AI Engineer & Full Stack Developer"
            handle="adel"
            status="Building Branchdeck"
            contactText="Get in touch"
            contactUrl="https://linkedin.com/in/adel"
            linkedinUrl="https://linkedin.com/in/adel"
            showLinkedinIcon={true}
            avatarUrl="/adel.jpg"
            miniAvatarUrl="/adel-avatar.jpg"
            showUserInfo={true}
            enableTilt={true}
            enableMobileTilt={false}
            behindGlowEnabled={true}
            behindGlowColor="rgba(34, 211, 238, 0.4)"
            innerGradient={isDarkMode ? 'linear-gradient(145deg, #0E1630 0%, #060914 100%)' : 'linear-gradient(145deg, #0A1028 0%, #040816 100%)'}
          />
        </FadeIn>
      </div>
    </section>
  );
  const FaqSection = () => {
    const faqs = [
      { q: "How is Branchdeck different from AI coding assistants like Copilot or Cursor?", a: "Those tools help your developers write code faster. Branchdeck is a service that plans, builds, and delivers complete AI feature integrations (search, agents, document processing) matched to your existing codebase, with your team reviewing the result." },
      { q: "Do you need access to our production systems?", a: "No. We work against your repository and open pull requests. Your team controls review and merge at every step." },
      { q: "What does the free demo include?", a: "One real integration, built end-to-end on your actual repository, so you can evaluate code quality and fit before any commitment." },
      { q: "How do you handle the cost of AI features once they're live?", a: "Every integration ships with spend tracking. You get real-time visibility into token and API cost per feature, with alerts before spend spikes unexpectedly." },
      { q: "What kinds of codebases do you work with?", a: "Branchdeck's AST engine supports most major languages, including Python, TypeScript, Java, Kotlin, Rust, Go, C#, C/C++, Ruby, and PHP. If you're unsure, ask during your free demo." },
      { q: "How long does an integration take?", a: "Most single-feature integrations ship within days once we've completed the initial codebase analysis." }
    ];

    return (
      <section id="faq" className={`py-36 px-6 border-t transition-colors duration-300 ${isDarkMode ? 'bg-[#070913] border-slate-900' : 'bg-white border-slate-200/60'}`}>
        <div className="max-w-3xl mx-auto">
          <FadeIn className="text-center mb-20">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 border transition-colors ${
              isDarkMode 
                ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' 
                : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
            }`}>
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className={`text-[clamp(2.2rem,3.5vw,3rem)] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Frequently Asked Questions</h2>
            <p className={`mt-3 text-[15px] font-medium max-w-xl mx-auto leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Everything you need to know about Branchdeck AI feature integrations.</p>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <FadeIn key={idx} delay={idx * 0.05}>
                <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isDarkMode ? 'bg-[#0E1220] border-slate-800 shadow-md' : 'bg-white border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]'
                }`}>
                  <button
                    onClick={() => setFaqOpenIdx(faqOpenIdx === idx ? null : idx)}
                    className={`w-full text-left p-6 flex justify-between items-center gap-4 cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}
                  >
                    <span className={`text-[13px] font-bold transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{faq.q}</span>
                    <motion.div
                      animate={{ rotate: faqOpenIdx === idx ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {faqOpenIdx === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className={`px-6 pb-6 pt-1 text-[12px] leading-relaxed border-t transition-colors ${isDarkMode ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'}`}>
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    );
  };

  /* ── CTA ── */
  const CTASection = () => (
    <section className={`py-44 px-6 relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-[#090C16]' : 'bg-[#FAFAFB]'}`}>
      {/* Data flow background */}
      <DataFlowCanvas />
      <div className="relative z-10 max-w-3xl mx-auto text-center space-y-10">
        <FadeIn>
          <h2 className={`text-[clamp(2.2rem,5vw,4rem)] font-extrabold tracking-tight leading-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            See What Branchdeck Would Build on Your Codebase
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className={`text-[16px] font-normal leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            No commitment. No production access. Just a real pull request built against your actual repo.
          </p>
        </FadeIn>
        <FadeIn delay={0.25} className="flex items-center justify-center gap-4 flex-wrap">
          <MagneticBtn onClick={onOpenWaitlist}
            className={`btn-shimmer text-[15px] font-semibold px-10 py-4 rounded-full flex items-center gap-2 transition-all shadow-xl group ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' : 'bg-slate-950 hover:bg-slate-850 text-white shadow-slate-950/20'}`}>
            Get Free Architecture Review
            <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </MagneticBtn>
        </FadeIn>
        <FadeIn delay={0.4} className={`flex justify-center gap-8 text-[10px] font-extrabold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          <span>No production access</span><span>·</span><span>Your devs merge</span><span>·</span><span>AST verified</span>
        </FadeIn>
      </div>
    </section>
  );

  /* ── FOOTER ── */
  const Footer = () => (
    <footer className={`transition-colors duration-300 border-t pt-16 pb-12 ${isDarkMode ? 'bg-[#05070E] border-slate-900' : 'bg-white border-slate-200/80'}`}>
      {/* Links grid */}
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-[13px] mb-16">
        <div className="col-span-2 md:col-span-1 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${isDarkMode ? 'bg-slate-800' : 'bg-slate-950'}`}>{LOGO_SVG}</div>
            <span className={`font-bold text-[14px] transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Branchdeck</span>
          </div>
          <p className={`text-[12px] leading-relaxed max-w-xs transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>AI-powered codebase intelligence for modern engineering teams.</p>
          <div className="flex items-center gap-3 text-slate-400">
            <a href="#" aria-label="GitHub" className={`hover:scale-110 transition-all ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-700'}`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className={`hover:scale-110 transition-all ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-700'}`}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
        {[
          { heading: 'Product', links: [
            { label: 'AST Code Parser', href: '#how-it-works' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'What We Build', href: '#what-we-build' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Security Analysis', href: '#faq' }
          ]},
          { heading: 'Company', links: [
            { label: 'About', href: '#how-it-works' },
            { label: 'Case Studies', href: '#case-studies' },
            { label: 'Contact', href: '#faq' }
          ]},
          { heading: 'Resources', links: [
            { label: 'FAQ', href: '#faq' },
            { label: 'Blog', href: '#faq' }
          ]},
          { heading: 'Legal', links: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' }
          ]}
        ].map(col => (
          <div key={col.heading} className="space-y-3">
            <div className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{col.heading}</div>
            {col.links.map(item => (
              <a key={item.label} href={item.href} className={`block text-[13px] transition-colors relative group w-fit ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                {item.label}
                <span className={`absolute -bottom-0.5 left-0 right-0 h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left ${isDarkMode ? 'bg-white' : 'bg-slate-900'}`} />
              </a>
            ))}
          </div>
        ))}
      </div>

      {/* Antigravity-style massive wordmark */}
      <div className="max-w-7xl mx-auto px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.01 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="select-none mb-12" style={{ lineHeight: 0.82 }}>
          <span
            className={`font-black tracking-tighter transition-colors duration-300 ${isDarkMode ? 'text-[#12151D]' : 'text-[#0A0A0A]'}`}
            style={{ fontSize: 'clamp(4rem,13.5vw,13.5rem)' }}>
            Branchdeck
          </span>
        </motion.div>

        {/* Bottom row: Brand name & privacy links */}
        <div className={`flex items-center justify-between text-[11px] pt-6 border-t transition-colors duration-300 ${isDarkMode ? 'text-slate-500 border-slate-900' : 'text-slate-500 border-slate-200/80 bg-white'}`}>
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center text-white p-0.5 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-950'}`}>{LOGO_SVG}</div>
            <span className={`font-bold transition-colors ${isDarkMode ? 'text-white/80' : 'text-slate-800'}`}>Branchdeck</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>Privacy</a>
            <a href="#" className={`transition-colors ${isDarkMode ? 'hover:text-white' : 'hover:text-slate-900'}`}>Terms</a>
            <span>© 2026 Branchdeck. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );

  const GetStartedModal = () => (
    <WaitlistModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  );

  /* ── CARD SWAP PREVIEW SECTION ── */
  const PreviewCardsSection = () => {
    const [winW, setWinW] = useState(1200);
    useEffect(() => {
      setWinW(window.innerWidth);
      const onResize = () => setWinW(window.innerWidth);
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }, []);

    const cardWidth = useMemo(() => Math.min(580, Math.max(300, winW - 40)), [winW]);
    const cardHeight = winW < 640 ? 380 : 360;

    return (
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-neutral-950 relative overflow-hidden">
        {/* LightRays for premium dark section feel */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.35 }}>
          <LightRays raysOrigin="top-center" raysColor="#3279F9" raysSpeed={0.6} lightSpread={0.9} rayLength={1.4} followMouse={true} mouseInfluence={0.06} pulsating={true} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-400 mb-4 block">Live Product Previews</span>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold text-white tracking-tight">See it in action</h2>
            <p className="mt-4 text-[15px] text-white/50 max-w-xl mx-auto leading-relaxed">Real views from the Branchdeck Retainer Portal dashboard — live metrics &amp; cost governance.</p>
          </FadeIn>
          <div className="flex justify-center overflow-hidden" style={{ height: cardHeight + 40 }}>
            <CardSwap width={cardWidth} height={cardHeight} cardDistance={winW < 640 ? 25 : 60} verticalDistance={winW < 640 ? 30 : 65} delay={4500} easing="elastic">
            {/* Card 1: Dashboard Overview & KPI Metrics */}
            <Card>
              <div className="w-full h-full bg-[#f8fafc] text-slate-900 flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-2xl select-none text-left">
                {/* Window Chrome Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" /></div>
                    <span className="ml-2 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-400" /> Branchdeck Client Portal &bull; Overview
                    </span>
                  </div>
                  <span className="text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                    Spend Healthy &bull; $142.80 / $500
                  </span>
                </div>
                {/* Card Canvas Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900 tracking-tight">Dashboard Overview</div>
                      <div className="text-[10px] text-slate-500 font-medium">AI integration retainer overview &bull; demo-workspace</div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md font-mono">Last 30d</span>
                  </div>

                  {/* 4 KPI Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Active Integrations</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">5</div>
                      <div className="text-[8px] text-emerald-600 font-semibold">5 total live</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Requests (30d)</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">2,640</div>
                      <div className="text-[8px] text-blue-600 font-semibold">2.6K calls</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Spend This Period</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">$142.80</div>
                      <div className="text-[8px] text-slate-500 font-semibold">of $500 cap &bull; 28%</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Avg Latency</div>
                      <div className="text-lg font-black text-slate-900 mt-0.5">340ms</div>
                      <div className="text-[8px] text-slate-500 font-semibold">mean latency</div>
                    </div>
                  </div>

                  {/* Spend Chart & Utilization Gauge */}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-8 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                        <span>Spend Over Time</span>
                        <span className="text-[8px] text-blue-600 font-mono font-bold">$18.40 daily peak</span>
                      </div>
                      <svg viewBox="0 0 400 55" className="w-full h-11 stroke-blue-500 fill-blue-500/10">
                        <path d="M0,45 Q40,35 80,40 T160,20 T240,25 T320,10 T400,8 L400,55 L0,55 Z" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="col-span-4 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-slate-800">Budget Utilization</div>
                      <div className="text-center my-0.5">
                        <div className="text-base font-black text-slate-900 font-mono">28%</div>
                        <div className="text-[8px] text-slate-400 font-semibold">$142.80 / $500 cap</div>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-blue-600 w-[28%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 2: Active Integrations & AST Match Table */}
            <Card>
              <div className="w-full h-full bg-[#f8fafc] text-slate-900 flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-2xl select-none text-left">
                {/* Window Chrome Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" /></div>
                    <span className="ml-2 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Branchdeck Client Portal &bull; Active Integrations
                    </span>
                  </div>
                  <span className="text-[9px] font-bold font-mono text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded-full">
                    5 Features Live
                  </span>
                </div>
                {/* Card Canvas Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="text-xs font-black text-slate-900 tracking-tight">Active AI Retainer Features</div>
                      <div className="text-[10px] text-slate-500 font-medium">Tree-sitter AST matched &bull; PR review safety active</div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" /> 100% PR Review Safety
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {[
                      { name: 'AI Semantic Search', type: 'Vector Search', status: 'Merged to main', ast: '99.4%', statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                      { name: 'Support & Ops Agent', type: 'Ticket Assistant', status: 'PR #142 Ready', ast: '98.8%', statusColor: 'bg-blue-50 text-blue-700 border-blue-200' },
                      { name: 'Document Processing', type: 'PDF Pipeline', status: 'Active Retainer', ast: '99.1%', statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
                      { name: 'Codebase Indexer', type: 'Tree-sitter AST', status: 'Synced 2m ago', ast: '100.0%', statusColor: 'bg-slate-100 text-slate-700 border-slate-300' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-[11px]">{item.name}</span>
                          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">{item.type}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[9px] text-slate-500 font-mono">AST match: <strong className="text-slate-900">{item.ast}</strong></span>
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2 rounded-lg bg-blue-50/70 border border-blue-100 text-[9px] text-blue-800 flex items-center justify-between font-mono">
                    <span>Zero production access required. Every change is delivered as a reviewable PR.</span>
                    <ArrowRight className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Card 3: Per-Feature Spend Governance Breakdown */}
            <Card>
              <div className="w-full h-full bg-[#f8fafc] text-slate-900 flex flex-col rounded-2xl overflow-hidden border border-slate-200 shadow-2xl select-none text-left">
                {/* Window Chrome Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" /><div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" /><div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" /></div>
                    <span className="ml-2 text-[10px] text-slate-300 font-mono flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> Branchdeck Client Portal &bull; Spend Governance
                    </span>
                  </div>
                  <span className="text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full">
                    0 Cost Spikes Detected
                  </span>
                </div>
                {/* Card Canvas Body */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <div className="text-xs font-black text-slate-900 tracking-tight">Per-Feature Token &amp; API Cost Governance</div>
                      <div className="text-[10px] text-slate-500 font-medium">Real-time attribution &bull; Monthly Retainer Cap $500.00</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 font-mono">$142.80</div>
                      <div className="text-[8px] text-slate-400 font-semibold">28% of budget</div>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    {[
                      { feature: 'AI Semantic Search', spend: '$58.40', tokens: '1.2M tokens', pct: '41%' },
                      { feature: 'Support & Ops Agent', spend: '$64.20', tokens: '1.8M tokens', pct: '45%' },
                      { feature: 'Document Processing', spend: '$20.20', tokens: '410K tokens', pct: '14%' }
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
                        <div>
                          <div className="font-bold text-slate-900 text-[11px]">{row.feature}</div>
                          <div className="text-[8px] text-slate-400 font-mono">{row.tokens} &bull; {row.pct} of period spend</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-slate-900 text-xs font-mono">{row.spend}</div>
                          <div className="text-[8px] font-bold text-emerald-600">Cost Healthy</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] flex items-center justify-between font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Automated spike throttle active at 90% cap threshold ($450.00).
                    </span>
                    <span className="font-bold text-white">Active</span>
                  </div>
                </div>
              </div>
            </Card>
          </CardSwap>
        </div>
      </div>
    </section>
  );
};



  /* ── PRICING SECTION ── */
  const PricingSection = () => (
    <section id="pricing" className={`py-32 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#060812]' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 border transition-colors ${
            isDarkMode ? 'bg-blue-950/60 border-blue-800/80 text-blue-400' : 'bg-blue-50 border-blue-200/80 text-blue-600 shadow-sm'
          }`}>
            PRICING &amp; RETAINER
          </span>
          <h2 className={`text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Start Free. Scale on Retainer.
          </h2>
          <p className={`mt-4 text-[14px] leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            We build one integration on your actual repo, free, so you can see the fit before committing. From there, most teams move to a retainer that covers ongoing maintenance, new AI feature integrations as you need them, and continuous spend monitoring — so your AI footprint grows without growing your risk.
          </p>
        </FadeIn>

        <FadeIn className={`rounded-2xl border overflow-hidden shadow-sm transition-colors ${isDarkMode ? 'bg-[#0E1220] border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={`border-b transition-colors ${isDarkMode ? 'border-slate-800 bg-slate-900/50 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Plan</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">What's Included</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs">Best For</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-xs text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
                <tr>
                  <td className="p-4 font-bold">Free Demo</td>
                  <td className="p-4 text-xs">One integration, built end-to-end on your repo</td>
                  <td className="p-4 text-xs text-slate-400">Teams evaluating fit</td>
                  <td className="p-4 text-right">
                    <button onClick={onOpenWaitlist} className="px-4 py-1.5 rounded-full text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto">
                      <span>Request Free Demo</span>
                      <ArrowRight className="w-3 h-3 opacity-70" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-bold">Project</td>
                  <td className="p-4 text-xs">Single feature integration, fixed scope</td>
                  <td className="p-4 text-xs text-slate-400">One-off AI feature need</td>
                  <td className="p-4 text-right">
                    <button onClick={onOpenWaitlist} className="px-4 py-1.5 rounded-full text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto">
                      <span>Get Started</span>
                      <ArrowRight className="w-3 h-3 opacity-70" />
                    </button>
                  </td>
                </tr>
                <tr className={isDarkMode ? 'bg-blue-950/30' : 'bg-blue-50/60'}>
                  <td className="p-4 font-bold text-blue-500">Retainer</td>
                  <td className="p-4 text-xs font-medium">Ongoing integrations, maintenance, spend governance dashboard</td>
                  <td className="p-4 text-xs font-medium">Teams shipping AI features continuously</td>
                  <td className="p-4 text-right">
                    <button onClick={onOpenWaitlist} className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 ml-auto">
                      <span>Contact Sales</span>
                      <ArrowRight className="w-3 h-3 opacity-70" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </FadeIn>
      </div>
    </section>
  );

  /* ── PROBLEM SECTION ── */
  const ProblemSection = () => (
    <section className={`py-32 px-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#060812]' : 'bg-[#FAFAFB]'}`}>
      <div className="max-w-6xl mx-auto">
        <FadeIn className="text-center mb-16 max-w-3xl mx-auto">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-4 border transition-colors ${
            isDarkMode ? 'bg-rose-950/60 border-rose-800/80 text-rose-400' : 'bg-rose-50 border-rose-200/80 text-rose-600 shadow-sm'
          }`}>
            THE CODEBASE REALITY
          </span>
          <h2 className={`text-[clamp(2.2rem,4vw,3.2rem)] font-extrabold tracking-tight transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Most AI Integrations Don't Survive Contact With a Real Codebase
          </h2>
          <p className={`mt-4 text-[14px] leading-relaxed transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            AI coding tools are trained on clean, sandboxed examples. Your codebase isn't clean — it has years of inherited patterns, inconsistent conventions, and business logic nobody wrote down. Generic AI tooling either breaks on contact with that reality, or produces code your team won't trust enough to merge.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FadeIn delay={0.1} className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#0E1220] border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className={`text-[15px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              "We tried an AI coding agent and it rewrote half our service layer."
            </h3>
            <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Generic tools don't understand your architecture — they impose their own.
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#0E1220] border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className={`text-[15px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              "We don't know what our AI features actually cost us."
            </h3>
            <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Token spend spirals silently until the invoice arrives.
            </p>
          </FadeIn>

          <FadeIn delay={0.3} className={`p-6 rounded-2xl border transition-colors ${isDarkMode ? 'bg-[#0E1220] border-slate-800' : 'bg-white border-slate-200/80 shadow-sm'}`}>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-4">
              <GitMerge className="w-5 h-5" />
            </div>
            <h3 className={`text-[15px] font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              "Our devs won't merge code they didn't write and can't explain."
            </h3>
            <p className={`text-[12px] leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Trust breaks the moment a PR doesn't look like it came from your team.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );

  return (
    <div className={`min-h-screen selection:bg-blue-600 selection:text-white relative transition-colors duration-300 ${isDarkMode ? 'bg-[#070913] text-white' : 'bg-white text-slate-900'}`}>
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 origin-left z-[100] pointer-events-none" />
      {NavBar()}
      <main>
        <Hero 
          onLoadDemo={onLoadDemo} 
          onSignUp={onSignUp}
          onSignIn={onSignIn}
          session={session}
          setIsModalOpen={setIsModalOpen} 
          setIsContactModalOpen={setIsContactModalOpen}
          typedWord={typedWord} 
          isDarkMode={isDarkMode}
        />
        {TaglineBand()}
        <div className={`py-8 overflow-hidden border-b transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-[#FAFBFD] border-neutral-200'}`}>
          <ScrollVelocity
            texts={marqueeTexts}
            velocity={80}
            className={`text-[clamp(1.4rem,4vw,2.8rem)] font-black uppercase tracking-tighter font-sans transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-neutral-800'}`}
            numCopies={6}
            damping={50}
            stiffness={400}
          />
        </div>
        <div id="what-we-build">{Features()}</div>
        {PerfectFor()}
        {ProblemSection()}
        {ComparisonSection()}
        {HowItWorks()}
        {PricingSection()}
        {UseCases()}
        <div id="case-studies">{PreviewCardsSection()}</div>
        <section style={{ height: 360 }} className={`overflow-hidden border-t border-b transition-colors duration-300 ${isDarkMode ? 'border-slate-800' : 'border-neutral-200'}`}>
          <FlowingMenu
            items={[
              { link: '#what-we-build', text: 'AI Semantic Search', image: '/preview-callflow.png' },
              { link: '#what-we-build', text: 'Support & Ops Agents', image: '/preview-story.png' },
              { link: '#what-we-build', text: 'Document Processing', image: '/preview-impact.png' },
              { link: '#how-it-works', text: 'AST Repo Parser', image: '/preview-callflow.png' },
              { link: '#pricing', text: 'Spend Governance Dashboard', image: '/preview-impact.png' },
            ]}
            speed={18}
            textColor={isDarkMode ? '#ffffff' : '#0a0b0f'}
            bgColor={isDarkMode ? '#0a0b0f' : '#f4f5f9'}
            marqueeBgColor="#3279F9"
            marqueeTextColor="#ffffff"
          />
        </section>
        {VsCodeSection()}
        {FounderSection()}
        {FaqSection()}
        {CTASection()}
      </main>
      {Footer()}
      {GetStartedModal()}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />
    </div>
  );
}