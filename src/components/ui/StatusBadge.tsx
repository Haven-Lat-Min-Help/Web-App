import styles from './StatusBadge.module.css';

export type StatusTone = 'good' | 'warning' | 'serious' | 'critical' | 'neutral';

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
}

/**
 * Status pill: a colored dot plus a dark-ink text label, never colored text
 * alone. warning/serious fall below 3:1 contrast as raw text on white (see
 * tokens.css), so the label always renders in --color-ink and the tone only
 * shows up as the dot + tinted background — contrast then never depends on
 * the status color itself.
 */
export function StatusBadge({ tone, label }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
