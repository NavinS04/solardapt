import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

/*
 * Admin/CRM shell. In production this entire segment is wrapped by Clerk
 * middleware with RBAC (admin / staff / viewer) — see middleware.ts and
 * BUILD_SPEC §8. The placeholder banner below makes the gate explicit until
 * Clerk keys are supplied.
 */
const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/pipeline', label: 'Pipeline' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-1">
      <div className="border-b border-warn/30 bg-warn/10 px-4 py-2 text-center text-xs text-muted-foreground">
        Protected area — gated by Clerk auth + RBAC in production (keys not yet configured).
      </div>
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r border-border bg-bg-surface/40 p-5 md:block">
          <Logo />
          <nav className="mt-8 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
