'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Ticket, Trash2, ExternalLink, Check, AlertCircle, AlertTriangle } from 'lucide-react';

interface SocialConnection {
  id: string;
  provider: string;
  provider_username: string | null;
  connected_at: string;
  is_active: boolean;
}

interface TicketInfo {
  remaining: number;
  total: number;
  usedToday: number;
  resetAt: string;
  canGenerate: boolean;
  generationsLeft: number;
  nextRefreshAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  social_connections: SocialConnection[];
  tickets: TicketInfo;
}

function formatTimeUntil(dateStr: string): string {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return 'now';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatRefreshTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Tick every minute for live countdown
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update countdown
      setProfile(p => p ? { ...p } : null);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      const data = await res.json();
      setProfile(data);
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect', connectionId }),
      });
      if (!res.ok) throw new Error('Failed to disconnect');
      setSuccess('Account disconnected');
      fetchProfile();
    } catch {
      setError('Failed to disconnect account');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/profile', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      window.location.href = '/';
    } catch {
      setError('Failed to delete account');
      setDeleting(false);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return email[0].toUpperCase();
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        );
      case 'facebook':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      default:
        return <ExternalLink size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  const tickets = profile?.tickets;
  const ticketPercent = tickets ? Math.round((tickets.remaining / tickets.total) * 100) : 100;
  const isLow = tickets && tickets.remaining <= 4 && tickets.remaining > 0;
  const isCritical = tickets && tickets.remaining === 0;
  const resetTimeLeft = tickets ? formatTimeUntil(tickets.nextRefreshAt) : '';
  const refreshTime = tickets ? formatRefreshTime(tickets.nextRefreshAt) : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[640px] px-4 py-6">
        <div className="flex flex-col gap-4">
          {/* Back Button */}
          <button
            onClick={() => router.push('/generate')}
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:border-slate-300"
          >
            <ArrowLeft size={16} />
            Back to Generate
          </button>

          {/* Profile Header */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-4 px-6 py-6 border-b border-slate-100">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name || 'Profile'}
                  className="h-[72px] w-[72px] rounded-full object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-blue-50 border-2 border-blue-200 text-2xl font-bold text-blue-600">
                  {getInitials(profile?.name || null, profile?.email || '')}
                </div>
              )}
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {profile?.name || 'User'}
                </h1>
                <p className="text-sm text-slate-500">
                  {profile?.email} · Member since {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              <Check size={16} />
              {success}
            </div>
          )}

          {/* Low Ticket Warning */}
          {isLow && (
            <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                Only <strong>{tickets.remaining} tickets</strong> left — enough for {tickets.generationsLeft} more generation{tickets.generationsLeft !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Critical: No tickets */}
          {isCritical && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>
                <strong>No tickets remaining</strong> — resets in {resetTimeLeft}
              </span>
            </div>
          )}

          {/* Ticket Dashboard */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <Ticket size={20} className="text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">Generation Tickets</span>
              </div>
              <span className="text-xs text-slate-400">Resets daily</span>
            </div>
            <div className="px-6 py-5">
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-slate-900">
                    {tickets?.remaining} / {tickets?.total}
                  </span>
                  <span className="text-sm text-slate-500">{ticketPercent}% remaining</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${ticketPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-left">
                  <div className="text-lg font-bold text-slate-900">{tickets?.remaining}</div>
                  <div className="text-xs text-slate-400">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900">{tickets?.usedToday}</div>
                  <div className="text-xs text-slate-400">Used today</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{tickets?.generationsLeft}</div>
                  <div className="text-xs text-slate-400">Generations left</div>
                </div>
              </div>

              {/* Reset Timer */}
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
                <Clock size={16} className="shrink-0" />
                <span>
                  Tickets reset in <strong>{resetTimeLeft}</strong> — next refresh at <strong>{refreshTime}</strong>
                </span>
              </div>
            </div>

            {/* Usage Info */}
            <div className="px-6 pb-6">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">How tickets work</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  Each generation costs 3 tickets
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  15 tickets refresh every 24 hours
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  Each platform counts as 1 generation
                </div>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Account Details</h3>
            </div>
            <div className="px-6 py-1">
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-sm text-slate-500">Email</span>
                <span className="text-sm font-medium text-slate-900">{profile?.email}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-50">
                <span className="text-sm text-slate-500">Login method</span>
                <span className="text-sm font-medium text-slate-900 capitalize">Email</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-sm text-slate-500">Member since</span>
                <span className="text-sm font-medium text-slate-900">
                  {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Connected Accounts</h3>
            </div>
            <div className="px-6 py-4 space-y-2">
              {/* Google */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  {getProviderIcon('google')}
                  <div>
                    <p className="text-sm font-medium text-slate-900">Google</p>
                    {profile?.social_connections.find(c => c.provider === 'google') ? (
                      <p className="text-xs text-green-600">
                        Connected as {profile.social_connections.find(c => c.provider === 'google')?.provider_username || 'account'}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Not connected</p>
                    )}
                  </div>
                </div>
                {profile?.social_connections.find(c => c.provider === 'google') ? (
                  <button
                    onClick={() => {
                      const conn = profile.social_connections.find(c => c.provider === 'google');
                      if (conn) handleDisconnect(conn.id);
                    }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => signIn('google', { callbackUrl: '/profile' })}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Connect
                  </button>
                )}
              </div>

              {/* Facebook */}
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-center gap-3">
                  {getProviderIcon('facebook')}
                  <div>
                    <p className="text-sm font-medium text-slate-900">Facebook</p>
                    {profile?.social_connections.find(c => c.provider === 'facebook') ? (
                      <p className="text-xs text-green-600">
                        Connected as {profile.social_connections.find(c => c.provider === 'facebook')?.provider_username || 'account'}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">Not connected</p>
                    )}
                  </div>
                </div>
                {profile?.social_connections.find(c => c.provider === 'facebook') ? (
                  <button
                    onClick={() => {
                      const conn = profile.social_connections.find(c => c.provider === 'facebook');
                      if (conn) handleDisconnect(conn.id);
                    }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => signIn('facebook', { callbackUrl: '/profile' })}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-red-200 bg-white shadow-sm">
            <div className="px-6 py-4">
              <h3 className="text-sm font-semibold text-red-600 mb-1">Danger Zone</h3>
              <p className="text-xs text-slate-500 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Yes, delete my account'}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
