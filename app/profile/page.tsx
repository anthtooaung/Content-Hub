'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, User, Trash2, ExternalLink, Check, AlertCircle } from 'lucide-react';

interface SocialConnection {
  id: string;
  provider: string;
  provider_username: string | null;
  connected_at: string;
  is_active: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  social_connections: SocialConnection[];
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
    } catch (err) {
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
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete account');

      // Sign out and redirect to home
      window.location.href = '/';
    } catch (err) {
      setError('Failed to delete account');
      setDeleting(false);
    }
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

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google': return 'Google';
      case 'facebook': return 'Facebook';
      default: return provider;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="mx-auto max-w-[600px] px-4 py-12">
        {/* Profile Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || 'Profile'}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User size={32} className="text-primary" />
            )}
          </div>
          <h1 className="text-xl font-bold text-text-primary">
            {profile?.name || 'User'}
          </h1>
          <p className="text-sm text-text-muted">{profile?.email}</p>
          <p className="mt-1 text-xs text-text-muted">
            Member since {new Date(profile?.created_at || '').toLocaleDateString()}
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-control bg-error-soft px-4 py-3 text-sm text-error">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2 rounded-control bg-success-soft px-4 py-3 text-sm text-success">
            <Check size={16} />
            {success}
          </div>
        )}

        {/* Connected Accounts */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-text-primary">Connected Accounts</h2>
          <p className="mb-6 text-sm text-text-muted">
            Connect your social accounts to publish content directly to your platforms.
          </p>

          <div className="space-y-3">
            {/* Google */}
            <div className="flex items-center justify-between rounded-control border border-border p-4">
              <div className="flex items-center gap-3">
                {getProviderIcon('google')}
                <div>
                  <p className="font-medium text-text-primary">Google</p>
                  {profile?.social_connections.find(c => c.provider === 'google') ? (
                    <p className="text-xs text-success">
                      Connected as {profile.social_connections.find(c => c.provider === 'google')?.provider_username || 'account'}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted">Not connected</p>
                  )}
                </div>
              </div>
              {profile?.social_connections.find(c => c.provider === 'google') ? (
                <button
                  onClick={() => {
                    const conn = profile.social_connections.find(c => c.provider === 'google');
                    if (conn) handleDisconnect(conn.id);
                  }}
                  className="text-sm font-medium text-error hover:underline"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => signIn('google', { callbackUrl: '/profile' })}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Connect
                </button>
              )}
            </div>

            {/* Facebook */}
            <div className="flex items-center justify-between rounded-control border border-border p-4">
              <div className="flex items-center gap-3">
                {getProviderIcon('facebook')}
                <div>
                  <p className="font-medium text-text-primary">Facebook</p>
                  {profile?.social_connections.find(c => c.provider === 'facebook') ? (
                    <p className="text-xs text-success">
                      Connected as {profile.social_connections.find(c => c.provider === 'facebook')?.provider_username || 'account'}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted">Not connected</p>
                  )}
                </div>
              </div>
              {profile?.social_connections.find(c => c.provider === 'facebook') ? (
                <button
                  onClick={() => {
                    const conn = profile.social_connections.find(c => c.provider === 'facebook');
                    if (conn) handleDisconnect(conn.id);
                  }}
                  className="text-sm font-medium text-error hover:underline"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  onClick={() => signIn('facebook', { callbackUrl: '/profile' })}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 rounded-xl border border-error/20 bg-surface p-6">
          <h2 className="mb-2 text-lg font-semibold text-error">Danger Zone</h2>
          <p className="mb-4 text-sm text-text-muted">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-control border border-error/30 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/5"
            >
              <Trash2 size={16} />
              Delete Account
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="rounded-control bg-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-error/90 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-control border border-primary-300 bg-primary-50 px-4 py-2 text-sm font-medium text-primary transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:border-primary hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
