'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Send, CheckCircle2, Copy, Check, ExternalLink, MessageSquare, PhoneCall } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubject?: string;
}

export default function ContactModal({ isOpen, onClose, defaultSubject = 'Branchdeck AI Integration Inquiry' }: ContactModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const directEmail = 'adelmuhammed786@gmail.com';

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(directEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const bodyText = `Name: ${name || 'N/A'}\nEmail: ${email || 'N/A'}\nCompany: ${company || 'N/A'}\n\nMessage:\n${message || 'Hi Adel, I would like to learn more about Branchdeck AI integrations.'}`;
    const mailtoUrl = `mailto:${directEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

    // Trigger direct mail client
    window.location.href = mailtoUrl;

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden z-10 my-auto"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 relative">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded-full">
                    Direct Contact
                  </span>
                  <h3 className="text-xl font-bold text-white leading-tight mt-0.5">Get in Touch with Adel</h3>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Have questions about custom AI feature integrations, retainer plans, or deploying Branchdeck on your codebase? Connect directly.
              </p>

              {/* Direct email badge */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between bg-white/5 rounded-xl px-3.5 py-2">
                <span className="text-xs font-mono text-slate-200 font-semibold">{directEmail}</span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Form / Success view */}
            <div className="p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Email Draft Opened!</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Your email client should open with Adel's address (<strong className="text-slate-800">{directEmail}</strong>). If it didn't open automatically, click copy above to email directly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Adel Muhammed"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Topic / Service Needed</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="Branchdeck AI Integration Inquiry">AI Feature Integration Retainer</option>
                      <option value="AI Semantic Search Integration">AI Semantic Search on Repo</option>
                      <option value="Support & Ops Agent Inquiry">Support & Ops Agents</option>
                      <option value="Document Processing Pipeline">Document Processing Pipeline</option>
                      <option value="Custom Demo Request">Custom Codebase Demo Request</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell Adel about your repo, stack, or AI feature goals..."
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl py-3 transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Adel</span>
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
