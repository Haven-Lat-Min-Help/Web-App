import { Building2, MapPin } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import styles from './OrganizationCard.module.css';

export interface Organization {
  id: string;
  name: string;
  main_branch_name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  is_active: boolean;
  created_at: string;
}

interface OrganizationCardProps {
  organization: Organization;
}

/** Summary tile for the organizations list: name, branch/location, and an activity status badge. */
export function OrganizationCard({ organization }: OrganizationCardProps) {
  const location = [organization.city, organization.state].filter(Boolean).join(', ');

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <Building2 size={18} strokeWidth={2.25} />
        </div>
        <StatusBadge
          tone={organization.is_active ? 'good' : 'neutral'}
          label={organization.is_active ? 'Active' : 'Inactive'}
        />
      </div>
      <h3 className={styles.name}>{organization.name}</h3>
      <p className={styles.branch}>{organization.main_branch_name}</p>
      {location && (
        <p className={styles.location}>
          <MapPin size={13} strokeWidth={2} />
          {location}
        </p>
      )}
    </div>
  );
}
