import { StatusBadge, type StatusTone } from '../ui/StatusBadge';
import styles from './BranchesTable.module.css';

export type AdminStatus = 'none' | 'pending' | 'expired' | 'active';

/** One row of GET /branches/network (see list_network_branches). */
export interface NetworkBranch {
  id: string;
  name: string;
  organization: { id: string; name: string; is_active: boolean };
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  has_location: boolean;
  is_active: boolean;
  admin_status: AdminStatus;
  admin_name: string | null;
  hospital_types: string[];
  active_staff: number;
  on_duty: number;
  created_at: string;
}

/**
 * What stops a branch from being reachable in the mobile app, in the order an
 * admin would fix them. Empty = ready. Deactivation isn't listed: it's a
 * decision, not a setup gap, and shows as the row's status instead.
 */
export function setupIssues(branch: NetworkBranch): string[] {
  const issues: string[] = [];
  if (branch.admin_status === 'none') issues.push('No admin');
  if (branch.admin_status === 'expired') issues.push('Admin invite expired');
  if (!branch.has_location) issues.push('No map location');
  if (branch.active_staff === 0) issues.push('No staff');
  return issues;
}

function branchStatus(branch: NetworkBranch): { tone: StatusTone; label: string } {
  if (!branch.organization.is_active) return { tone: 'neutral', label: 'Org inactive' };
  if (!branch.is_active) return { tone: 'neutral', label: 'Inactive' };
  if (setupIssues(branch).length > 0) return { tone: 'warning', label: 'Needs setup' };
  return { tone: 'good', label: 'Ready' };
}

const ADMIN_STATUS_LABEL: Record<AdminStatus, string> = {
  none: 'Not invited',
  pending: 'Invite pending',
  expired: 'Invite expired',
  active: 'Active',
};

interface BranchesTableProps {
  branches: NetworkBranch[];
  /** Clicking an organization name narrows the list to that organization. */
  onSelectOrganization: (orgId: string) => void;
}

export function BranchesTable({ branches, onSelectOrganization }: BranchesTableProps) {
  return (
    <div className={`${styles.scrollWrap} thin-scroll`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Branch</th>
            <th scope="col">Organization</th>
            <th scope="col">Location</th>
            <th scope="col">Branch admin</th>
            <th scope="col">Staff</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => {
            const status = branchStatus(branch);
            const issues = setupIssues(branch);
            const place = [branch.city, branch.state].filter(Boolean).join(', ');
            return (
              <tr key={branch.id}>
                <td>
                  <span className={styles.strong}>{branch.name}</span>
                  {branch.hospital_types.length > 0 && (
                    <span className={styles.meta}>{branch.hospital_types.join(' · ')}</span>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={styles.orgLink}
                    onClick={() => onSelectOrganization(branch.organization.id)}
                    title={`Show only ${branch.organization.name}`}
                  >
                    {branch.organization.name}
                  </button>
                </td>
                <td>
                  <span className={styles.body}>{place || '—'}</span>
                  {!branch.has_location && <span className={styles.meta}>No map pin</span>}
                </td>
                <td>
                  <span className={styles.body}>{branch.admin_name ?? '—'}</span>
                  <span className={styles.meta}>{ADMIN_STATUS_LABEL[branch.admin_status]}</span>
                </td>
                <td className="tabular-nums">
                  <span className={styles.body}>{branch.active_staff}</span>
                  <span className={styles.meta}>{branch.on_duty} on duty</span>
                </td>
                <td>
                  <StatusBadge tone={status.tone} label={status.label} />
                  {status.label === 'Needs setup' && <span className={styles.meta}>{issues.join(', ')}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
