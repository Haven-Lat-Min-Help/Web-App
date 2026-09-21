import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

/** White rounded panel — the base surface every dashboard section sits on. */
export function Card({ title, action, padded = true, className, children, ...props }: CardProps) {
  const classes = [styles.card, className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      {(title || action) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {action}
        </div>
      )}
      <div className={padded ? styles.body : undefined}>{children}</div>
    </div>
  );
}
