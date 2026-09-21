import type { ComponentType } from 'react';
import styles from './StatCard.module.css';

export type StatTone = 'default' | 'critical';

interface StatCardProps {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  value: string;
  /** Signed change vs a named period, e.g. "+4.2% vs last week". */
  delta?: { text: string; direction: 'up' | 'down'; isGood: boolean };
  tone?: StatTone;
}

/**
 * Stat tile: label + value + optional delta (dataviz skill figure contract).
 * `tone="critical"` is reserved for genuinely urgent counts (e.g. active
 * critical cases) — same rule as Haven's emergency red everywhere else in
 * the product: never used for ordinary emphasis.
 */
export function StatCard({ icon: Icon, label, value, delta, tone = 'default' }: StatCardProps) {
  return (
    <div className={`${styles.card} ${tone === 'critical' ? styles.critical : ''}`}>
      <div className={styles.iconWrap}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      <div className={styles.body}>
        <p className={styles.label}>{label}</p>
        <p className={`${styles.value} tabular-nums`}>{value}</p>
        {delta && (
          <p className={`${styles.delta} ${delta.isGood ? styles.deltaGood : styles.deltaBad}`}>
            {delta.direction === 'up' ? '↑' : '↓'} {delta.text}
          </p>
        )}
      </div>
    </div>
  );
}
