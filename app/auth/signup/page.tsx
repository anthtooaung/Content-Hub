'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong.');
        return;
      }

      router.push('/auth/signin');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-page px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-bold text-text-primary">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <Sparkles size={16} />
        </div>
        Content Hub
      </Link>

      <div className="w-full max-w-[400px] rounded-panel border border-border bg-surface p-8 shadow-card">
        <h1 className="mb-1 text-[24px] font-semibold text-text-primary">Create your account</h1>
        <p className="mb-6 text-sm text-text-secondary">Get started with Content Hub</p>

        {error && (
          <div className="mb-4 rounded-control bg-error-soft px-3 py-3 text-sm text-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-11 w-full rounded-control border border-border-strong px-3 text-sm outline-none transition-shadow focus:border-primary focus:shadow-focus"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-control bg-primary text-base font-semibold text-white transition-all hover:bg-primary-600 disabled:pointer-events-none disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Get started'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link href="/auth/signin" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
