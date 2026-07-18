'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Link2, Sun, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import AppLayout from '@/components/AppLayout';
import Toast, { useToast } from '@/components/Toast';

interface PlatformRow {
  id: string;
  name: string;
  icon: string;
  iconBg: string;
  connected: boolean;
  autoPost: boolean;
  accountLabel?: string;
}

const defaultPlatforms: PlatformRow[] = [
  { id: 'tiktok', name: 'TikTok', icon: 'TT', iconBg: 'bg-tiktok', connected: true, autoPost: true, accountLabel: '@janedoe_business' },
  { id: 'instagram', name: 'Instagram', icon: 'IG', iconBg: 'bg-instagram', connected: false, autoPost: false },
  { id: 'facebook', name: 'Facebook', icon: 'FB', iconBg: 'bg-facebook', connected: true, autoPost: true, accountLabel: "Jane's Business Page" },
];

const themes = [
  { id: 'light', label: 'Light', icon: '☀️', desc: 'Default' },
  { id: 'dark', label: 'Dark', icon: '🌙', desc: 'Easy on eyes' },
  { id: 'system', label: 'System', icon: '💻', desc: 'Match OS' },
] as const;

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast, showToast, hideToast } = useToast();
  const [platforms, setPlatforms] = useState<PlatformRow[]>(defaultPlatforms);
  const [activeTheme, setActiveTheme] = useState<string>('system');

  const userName = (session?.user?.name as string) || 'Jane Doe';
  const userEmail = (session?.user?.email as string) || 'jane@example.com';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const toggleAutoPost = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, autoPost: !p.autoPost } : p))
    );
    showToast('Auto-post setting updated');
  };

  const toggleConnection = (id: string) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, connected: !p.connected, autoPost: p.connected ? false : p.autoPost } : p))
    );
  };

  return (
    <AppLayout>
      <Toast message={toast.message} show={toast.show} onHide={hideToast} />

      <div className="mx-auto max-w-[800px] px-8 py-10 max-md:px-4 max-md:py-6">
        <h1 className="mb-6 text-[24px] font-semibold text-text-primary">Settings</h1>

        {/* Profile Section */}
        <section className="mb-5 rounded-panel border border-border bg-surface p-6">
          <SectionHeader
            icon={<User size={18} />}
            title="Profile"
            desc="Your account information"
          />
          <div className="flex items-center gap-4 rounded-card bg-surface-subtle p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-[20px] font-semibold text-white">
              {initials}
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">{userName}</h3>
              <p className="text-[13px] text-text-muted">{userEmail}</p>
            </div>
          </div>
        </section>

        {/* Platforms Section */}
        <section className="mb-5 rounded-panel border border-border bg-surface p-6">
          <SectionHeader
            icon={<Link2 size={18} />}
            title="Platform Connections"
            desc="Connect your accounts and configure auto-posting"
          />

          <div className="rounded-control border border-border overflow-hidden">
            {platforms.map((platform, index) => (
              <div
                key={platform.id}
                className={clsx(
                  'flex items-center justify-between px-5 py-4 transition-colors duration-150',
                  index < platforms.length - 1 && 'border-b border-border'
                )}
              >
                {/* Left: Icon + Platform Name */}
                <div className="flex items-center gap-3">
                  <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white', platform.iconBg)}>
                    {platform.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-text-primary">{platform.name}</div>
                    {platform.connected && platform.accountLabel && (
                      <div className="text-[12px] text-text-muted">{platform.accountLabel}</div>
                    )}
                  </div>
                </div>

                {/* Right: Connect/Disconnect Button + Toggle */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleConnection(platform.id)}
                    className={clsx(
                      'rounded-control border px-4 py-2 text-[13px] font-semibold transition-colors duration-150',
                      platform.connected
                        ? 'border-border bg-surface text-text-secondary hover:bg-surface-subtle hover:border-border-strong'
                        : 'border-primary bg-primary text-white hover:bg-primary-600'
                    )}
                  >
                    {platform.connected ? 'Disconnect' : 'Connect'}
                  </button>

                  <button
                    onClick={() => toggleAutoPost(platform.id)}
                    disabled={!platform.connected}
                    aria-label={`Toggle auto-post for ${platform.name}`}
                    className={clsx(
                      'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150',
                      platform.autoPost && platform.connected ? 'bg-primary' : 'bg-border-strong',
                      !platform.connected && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={clsx(
                        'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-150',
                        platform.autoPost && platform.connected && 'translate-x-5'
                      )}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Preferences Section */}
        <section className="mb-5 rounded-panel border border-border bg-surface p-6">
          <SectionHeader
            icon={<Sun size={18} />}
            title="Preferences"
            desc="Customize your experience"
          />

          <p className="mb-3 text-sm font-medium text-text-primary">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setActiveTheme(theme.id)}
                className={clsx(
                  'rounded-control border-2 p-3.5 text-center transition-colors duration-150',
                  activeTheme === theme.id
                    ? 'border-primary bg-primary-50'
                    : 'border-border bg-surface hover:border-border-strong'
                )}
              >
                <div className="mb-1 text-xl">{theme.icon}</div>
                <div className="text-sm font-medium text-text-primary">{theme.label}</div>
                <div className="text-[11px] text-text-muted">{theme.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Logout Section */}
        <section className="rounded-panel border border-red-200 bg-error-soft p-5">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2.5 rounded-control border border-error bg-surface px-5 py-2.5 text-sm font-medium text-error transition-colors duration-150 hover:bg-error hover:text-white"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </section>
      </div>
    </AppLayout>
  );
}

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-control bg-primary-50 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-base font-semibold text-text-primary">{title}</div>
        <div className="text-[13px] text-text-muted">{desc}</div>
      </div>
    </div>
  );
}
