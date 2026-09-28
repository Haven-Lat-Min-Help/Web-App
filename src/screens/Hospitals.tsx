import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { BranchesTable, setupIssues, type NetworkBranch } from '../components/tables/BranchesTable';
import { apiFetch, ApiError } from '../config/api';
import styles from './Hospitals.module.css';

type StatusFilter = 'all' | 'ready' | 'needs_setup' | 'inactive';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'ready', label: 'Ready' },
  { value: 'needs_setup', label: 'Needs setup' },
  { value: 'inactive', label: 'Inactive' },
];

function matchesStatus(branch: NetworkBranch, filter: StatusFilter): boolean {
  const inactive = !branch.is_active || !branch.organization.is_active;
  switch (filter) {
    case 'all':
      return true;
    case 'inactive':
      return inactive;
    case 'ready':
      return !inactive && setupIssues(branch).length === 0;
    case 'needs_setup':
      return !inactive && setupIssues(branch).length > 0;
  }
}

/**
 * Hospitals — every branch on Haven with the organization it belongs to.
 * Fetches GET /branches/network once on mount and filters client-side (search,
 * organization, status), which is fine up to a few hundred branches; the
 * endpoint's comment says what changes past that. Read-only: branches are
 * created and edited by their org/branch admins in the OrganizationApp.
 */
export function Hospitals() {
  const [branches, setBranches] = useState<NetworkBranch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [orgId, setOrgId] = useState('all');
  const [status, setStatus] = useState<StatusFilter>('all');

  useEffect(() => {
    let cancelled = false;

    apiFetch<{ branches: NetworkBranch[] }>('/branches/network')
      .then((data) => {
        if (!cancelled) setBranches(data.branches);
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

  // The org dropdown lists only orgs that have branches — an org with none
  // would always filter to an empty table.
  const organizations = useMemo(() => {
    const byId = new Map<string, string>();
    for (const branch of branches ?? []) byId.set(branch.organization.id, branch.organization.name);
    return [...byId].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [branches]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (branches ?? []).filter(
      (branch) =>
        (orgId === 'all' || branch.organization.id === orgId) &&
        matchesStatus(branch, status) &&
        (!needle ||
          [branch.name, branch.organization.name, branch.city, branch.state, branch.pincode].some((field) =>
            field?.toLowerCase().includes(needle),
          )),
    );
  }, [branches, query, orgId, status]);

  const filtered = query.trim() !== '' || orgId !== 'all' || status !== 'all';

  function clearFilters() {
    setQuery('');
    setOrgId('all');
    setStatus('all');
  }

  return (
    <AppShell title="Hospitals" subtitle="Every branch on Haven and the organization it belongs to">
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {!error && branches === null && <p className={styles.empty}>Loading…</p>}
      {branches && branches.length === 0 && (
        <p className={styles.empty}>
          No branches yet — organization admins add them from the Organization app.
        </p>
      )}

      {branches && branches.length > 0 && (
        <>
          <div className={styles.filters}>
            <label className={styles.search}>
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search branch, organization, city or pincode"
                aria-label="Search branches"
              />
            </label>
            <select
              className={styles.select}
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              aria-label="Filter by organization"
            >
              <option value="all">All organizations</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <p className={styles.count} aria-live="polite">
            {filtered
              ? `${visible.length} of ${branches.length} branches`
              : `${branches.length} branches across ${organizations.length} organizations`}
            {filtered && (
              <button type="button" className={styles.clear} onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </p>

          <Card padded={false}>
            {visible.length > 0 ? (
              <BranchesTable branches={visible} onSelectOrganization={setOrgId} />
            ) : (
              <p className={styles.noMatch}>No branches match these filters.</p>
            )}
          </Card>
        </>
      )}
    </AppShell>
  );
}
