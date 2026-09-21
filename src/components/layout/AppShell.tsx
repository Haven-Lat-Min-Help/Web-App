import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from './AppShell.module.css';

interface AppShellProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Shared authenticated-app frame: sidebar + topbar + content well. Every
 * page behind RequireSuperAdmin should render through this so the nav,
 * spacing and responsive behavior stay identical as more pages are added.
 */
export function AppShell({ title, subtitle, actions, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className={styles.main}>
        <div className={styles.content}>
          <Topbar
            title={title}
            subtitle={subtitle}
            actions={actions}
            onMenuClick={() => setMobileNavOpen(true)}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
