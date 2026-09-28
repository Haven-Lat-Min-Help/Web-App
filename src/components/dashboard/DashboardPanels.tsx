import type { NetworkDashboard } from '../../data/networkDashboard';
import styles from './DashboardPanels.module.css';

interface CoverageGapsProps {
  uncoveredNow: string[];
  uncoveredAtAll: string[];
}

/**
 * Which emergencies would ring nobody. "Right now" is the urgent list (nobody
 * on duty treats it); "no staff at all" is the structural one (nobody on the
 * whole network could ever be on duty for it). An aid type in the second list
 * is always in the first too, so it's only shown once — under "no staff".
 */
export function CoverageGaps({ uncoveredNow, uncoveredAtAll }: CoverageGapsProps) {
  const atAll = new Set(uncoveredAtAll);
  const offDutyOnly = uncoveredNow.filter((name) => !atAll.has(name));

  if (uncoveredNow.length === 0 && uncoveredAtAll.length === 0) {
    return <p className={styles.allClear}>Every emergency type has someone on duty right now.</p>;
  }

  return (
    <div className={styles.gaps}>
      {offDutyOnly.length > 0 && (
        <section>
          <h3 className={styles.gapTitle}>Nobody on duty right now</h3>
          <ul className={styles.chips}>
            {offDutyOnly.map((name) => (
              <li key={name} className={`${styles.chip} ${styles.chipWarning}`}>
                {name}
              </li>
            ))}
          </ul>
        </section>
      )}
      {uncoveredAtAll.length > 0 && (
        <section>
          <h3 className={styles.gapTitle}>No trained staff anywhere on Haven</h3>
          <ul className={styles.chips}>
            {uncoveredAtAll.map((name) => (
              <li key={name} className={`${styles.chip} ${styles.chipCritical}`}>
                {name}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

interface NetworkHealthProps {
  staff: NetworkDashboard['staff'];
  network: NetworkDashboard['network'];
}

/**
 * The setup state of the network as label/value rows. Gap rows (the "without"
 * counts) are flagged only when non-zero, so an all-clear network reads calm.
 */
export function NetworkHealth({ staff, network }: NetworkHealthProps) {
  const rows: { label: string; value: string; flag?: boolean }[] = [
    { label: 'Staff on duty now', value: `${staff.on_duty} of ${staff.ready}` },
    { label: 'Active organizations', value: String(network.organizations) },
    { label: 'Branches ready', value: `${network.branches_ready} of ${network.branches}` },
    { label: 'Branches without an admin', value: String(network.branches_without_admin), flag: network.branches_without_admin > 0 },
    {
      label: 'Branches without a map location',
      value: String(network.branches_without_location),
      flag: network.branches_without_location > 0,
    },
    { label: 'Branches without staff', value: String(network.branches_without_staff), flag: network.branches_without_staff > 0 },
    { label: 'Expired invites', value: String(network.expired_invites), flag: network.expired_invites > 0 },
    { label: 'Blocked callers', value: String(network.active_blocks) },
  ];

  return (
    <dl className={styles.health}>
      {rows.map((row) => (
        <div key={row.label} className={styles.healthRow}>
          <dt>{row.label}</dt>
          <dd className={`tabular-nums ${row.flag ? styles.flag : ''}`}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
