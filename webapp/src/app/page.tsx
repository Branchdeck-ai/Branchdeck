'use client';

import React, { useState, useEffect } from 'react';
import MarketingLanding from '@/components/MarketingLanding';
import AuthModal from '@/components/AuthModal';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { isAdminUser } from '@/lib/admin';

export default function HomePage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup'>('signin');

  /* ─── Auth initialisation ─────────────────────────────────── */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const handleSignedInSession = async (sess: any, source: string) => {
      console.log(`[Auth] Session via ${source}. User:`, sess?.user?.email);
      setSession(sess);
      setAuthLoading(false);

      if (sess) {
        if (isAdminUser(sess.user?.email)) {
          localStorage.setItem('branchdeck_onboarded', 'true');
        }
        const onboarded = localStorage.getItem('branchdeck_onboarded') === 'true';
        const skipRedirect = window.location.search.includes('skip_redirect');

        if (!onboarded && !skipRedirect) {
          try {
            await fetch('/api/dashboard/organizations/provision', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sess.access_token}`,
              },
              body: JSON.stringify({ user_id: sess.user?.id, email: sess.user?.email }),
            });
          } catch (e) {
            console.error('[Auth] Auto-provisioning error:', e);
          }
          window.location.href = '/onboarding';
        } else if (!skipRedirect) {
          window.location.href = '/dashboard';
        }
      }
    };

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        handleSignedInSession(s, 'getSession()');
      } else {
        setAuthLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (s) {
        handleSignedInSession(s, 'onAuthStateChange');
      } else {
        setSession(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ─── Open auth modal / redirect signed-in user ───────────── */
  const openAuth = async (mode: 'signin' | 'signup' = 'signin') => {
    let activeSession = session;
    if (!activeSession && isSupabaseConfigured) {
      try {
        const { data } = await supabase.auth.getSession();
        activeSession = data.session;
      } catch {}
    }

    if (activeSession) {
      const onboarded = localStorage.getItem('branchdeck_onboarded') === 'true';
      window.location.href = onboarded ? '/dashboard' : '/onboarding';
      return;
    }

    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  const handleLogOut = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
  };

  /* ─── Minimal loading guard while auth resolves ───────────── */
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── Marketing landing page ──────────────────────────────── */
  return (
    <>
      <MarketingLanding
        session={session}
        repoUrl=""
        setRepoUrl={() => {}}
        analyzing={false}
        onAnalyze={() => {}}
        onSignIn={() => openAuth('signin')}
        onSignUp={() => openAuth('signup')}
        onSignOut={handleLogOut}
        onOpenRepoPicker={() => { window.location.href = '/dashboard'; }}
        /* "Open Live Dashboard" → demo mode: full AI cost & analytics dashboard, no login required */
        onLoadDemo={() => { window.location.href = '/dashboard?demo=1'; }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(newSession) => {
          if (newSession) setSession(newSession);
          setIsAuthOpen(false);
        }}
        initialMode={authInitialMode}
      />
    </>
  );
}
