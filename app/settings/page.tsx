'use client';

import { useSession, signOut } from 'next-auth/react';
import { User, Palette, LogOut } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import Toast, { useToast } from '@/components/Toast';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast, showToast, hideToast } = useToast();

  const userName = (session?.user?.name as string) || '';
  const userEmail = (session?.user?.email as string) || '';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

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

        {/* Preferences Section */}
        <section className="mb-5 rounded-panel border border-border bg-surface p-6">
          <SectionHeader
            icon={<Palette size={18} />}
            title="Preferences"
            desc="Customize your experience"
          />

          <p className="mb-3 text-sm font-medium text-text-primary">Theme</p>
          <ThemeSwitcher />
        </section>

        {/* Logout Section */}
        <section className="rounded-panel border border-red-200 bg-error-soft p-5">
          <h3 className="mb-1 text-base font-semibold text-text-primary">Log Out</h3>
          <p className="mb-4 text-[13px] text-text-muted">
            Sign out of your account. You can always log back in later.
          </p>
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
