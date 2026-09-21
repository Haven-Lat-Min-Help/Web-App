import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import styles from './Topbar.module.css';

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  onMenuClick: () => void;
}

/** Page header: mobile menu button, title/subtitle, and a page-specific actions slot. */
export function Topbar({ title, subtitle, actions, onMenuClick }: TopbarProps) {
  return (
    <header className={styles.topbar}>
      <button
        type="button"
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
