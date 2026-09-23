import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Button } from '../components/ui/Button';
import { OrganizationCard, type Organization } from '../components/organizations/OrganizationCard';
import { apiFetch, ApiError } from '../config/api';
import styles from './Organizations.module.css';

/**
 * Organizations list — the super admin's landing page for org management.
 * Fetches GET /organizations on mount; "Add organization" routes to the
 * creation form at /organizations/new (see CreateOrganization.tsx).
 */
export function Organizations() {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ organizations: Organization[] }>('/organizations')
      .then((data) => {
        if (!cancelled) setOrganizations(data.organizations);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell
      title="Organizations"
      subtitle="Every organization on Haven"
      actions={
        <Button size="sm" onClick={() => navigate('/organizations/new')}>
          <Plus size={15} />
          Add organization
        </Button>
      }
    >
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {!error && organizations === null && <p className={styles.empty}>Loading…</p>}
      {organizations && organizations.length === 0 && (
        <p className={styles.empty}>No organizations yet — click "Add organization" to create one.</p>
      )}
      {organizations && organizations.length > 0 && (
        <div className={styles.grid}>
          {organizations.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
