import { LayoutGrid, Landmark, Building2, Inbox, MessagesSquare, Settings, LogOut, X } from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import havenLogo from '../../assets/haven-logo.png';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  /** Present = a real route (rendered as a NavLink); absent = comingSoon. */
  path?: string;
  /** Nav destinations without a path aren't built yet — surfaced, not hidden. */
  comingSoon?: boolean;
  badge?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', icon: LayoutGrid, path: '/dashboard' },
  { label: 'Organizations', icon: Landmark, path: '/organizations' },
  { label: 'Hospitals', icon: Building2, comingSoon: true },
  { label: 'Requests', icon: Inbox, comingSoon: true, badge: true },
  { label: 'Assistant logs', icon: MessagesSquare, comingSoon: true },
];

interface SidebarProps {
  /** Mobile off-canvas visibility; ignored at desktop widths (always visible). */
  open: boolean;
  onClose: () => void;
}

/**
 * Left sidebar shell: logo, primary nav, settings + sign-out footer. Items
 * with a `path` render as NavLinks; the rest render as visibly disabled so
 * the nav matches the design without pretending pages exist that haven't
 * been built. Below --breakpoint-nav it becomes an off-canvas drawer
 * controlled by `open`/`onClose` (see AppShell).
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.assign('/login');
  }

  return (
    <>
      {open && <div className={styles.scrim} onClick={onClose} aria-hidden="true" />}
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <img src={havenLogo} alt="" className={styles.logoMark} />
          <span className={styles.logoText}>Haven</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {NAV_ITEMS.map(({ label, icon: Icon, path, comingSoon, badge }) =>
            path ? (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
              >
                <Icon size={18} strokeWidth={2} />
                <span>{label}</span>
                {badge && <span className={styles.navBadge} aria-hidden="true" />}
              </NavLink>
            ) : (
              <button
                key={label}
                type="button"
                className={styles.navItem}
                disabled={comingSoon}
                title={comingSoon ? `${label} — coming soon` : undefined}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{label}</span>
                {badge && <span className={styles.navBadge} aria-hidden="true" />}
                {comingSoon && <span className={styles.soonTag}>Soon</span>}
              </button>
            ),
          )}
        </nav>

        <div className={styles.footer}>
          <NavLink
            to="/profile"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <Settings size={18} strokeWidth={2} />
            <span>Settings</span>
          </NavLink>
          <button type="button" className={styles.navItem} onClick={handleSignOut}>
            <LogOut size={18} strokeWidth={2} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
