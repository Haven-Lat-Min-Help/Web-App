import type { InputHTMLAttributes } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/** Labeled text input — the base field every admin form should render through. */
export function FormField({ label, id, className, ...props }: FormFieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>
        {label}
      </label>
      <input id={fieldId} className={[styles.input, className].filter(Boolean).join(' ')} {...props} />
    </div>
  );
}
