'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Eye, EyeOff } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/generate');
        router.refresh();
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left: Illustration Panel */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-primary to-primary-700 p-12 text-white relative overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_60%)]" />
        <h2 className="text-[28px] font-bold mb-3 relative z-10 text-center">
          Create content that converts
        </h2>
        <p className="text-base opacity-85 max-w-[320px] text-center leading-relaxed relative z-10">
          AI-powered social media posts for your business. Describe your campaign, pick your platforms, and get ready-to-post content in seconds.
        </p>
        {/* Mockup */}
        <div className="mt-8 w-[280px] h-[180px] bg-white/10 border border-white/20 rounded-xl relative z-10 flex flex-col items-center justify-center gap-2">
          <div className="w-[60%] h-2 bg-white/30 rounded" />
          <div className="w-[40%] h-2 bg-white/30 rounded" />
          <div className="flex gap-2 mt-3">
            <div className="w-[60px] h-[60px] bg-white/15 rounded-lg" />
            <div className="w-[60px] h-[60px] bg-white/15 rounded-lg" />
            <div className="w-[60px] h-[60px] bg-white/15 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex flex-1 items-center justify-center p-12 max-lg:p-8">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-bold text-text-primary lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Sparkles size={16} />
            </div>
            Content Hub
          </Link>

          {/* Desktop logo */}
          <Link href="/" className="mb-8 hidden lg:flex items-center gap-2 text-lg font-bold text-text-primary">
            <Sparkles size={24} className="text-primary" />
            Content Hub
          </Link>

          <h1 className="mb-1 text-[24px] font-bold text-text-primary">Welcome back</h1>
          <p className="mb-7 text-sm text-text-muted">Sign in to continue generating content</p>

          {/* Social Buttons */}
          <div className="flex gap-2.5 mb-5">
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/generate' })}
              className="flex-1 flex items-center justify-center gap-2 rounded-control border-2 border-primary-200 bg-primary-50 px-4 py-2.5 text-[13px] font-semibold text-primary transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => signIn('facebook', { callbackUrl: '/generate' })}
              className="flex-1 flex items-center justify-center gap-2 rounded-control border-2 border-primary-200 bg-primary-50 px-4 py-2.5 text-[13px] font-semibold text-primary transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted whitespace-nowrap">or continue with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {error && (
            <div className="mb-4 rounded-control bg-error-soft px-3 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="h-[42px] w-full rounded-control border border-border px-3.5 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-text-secondary">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-[42px] w-full rounded-control border border-border pr-10 pl-3.5 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-text-secondary cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary" />
                Remember me
              </label>
              <span className="text-[13px] font-medium text-primary cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-control bg-primary text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-600 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] disabled:pointer-events-none disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  Signing in
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full [animation:spin_0.6s_linear_infinite]" />
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
