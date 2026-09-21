import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import havenLogo from '../assets/haven-logo.png';
import styles from './AdminLogin.module.css';

/**
 * Sign-in only — no signup form here. Super admin accounts are provisioned
 * out-of-band via Backend's `npm run create-super-admin` script, never
 * through client-facing signup (see 20260911060000_secure_role_from_app_metadata.sql
 * for why role can only be granted that way).
 */
export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Invalid email or password');
      setSubmitting(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || profile?.role !== 'super_admin') {
      await supabase.auth.signOut();
      setError('This account is not authorized for admin access');
      setSubmitting(false);
      return;
    }

    navigate('/dashboard', { replace: true });
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <img src={havenLogo} alt="Haven" className={styles.logo} />
          <span className={styles.wordmark}>Haven</span>
        </div>

        <div className={styles.heading}>
          <h1 className={styles.title}>Admin sign in</h1>
          <p className={styles.subtitle}>Network-wide oversight for Haven hospitals.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              placeholder="you@haven.app"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className={styles.submit}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
