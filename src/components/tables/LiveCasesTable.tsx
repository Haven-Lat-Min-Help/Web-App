import type { LiveCase } from '../../data/mockOverview';
import { StatusBadge } from '../ui/StatusBadge';
import styles from './LiveCasesTable.module.css';

interface LiveCasesTableProps {
  cases: LiveCase[];
}

export function LiveCasesTable({ cases }: LiveCasesTableProps) {
  return (
    <div className={`${styles.scrollWrap} thin-scroll`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Patient</th>
            <th scope="col">Location</th>
            <th scope="col">Hospital</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.id}>
              <td className={styles.muted}>{c.time}</td>
              <td className={styles.strong}>{c.patient}</td>
              <td className={styles.muted}>{c.location}</td>
              <td className={styles.muted}>{c.hospital}</td>
              <td>
                <StatusBadge tone={c.status} label={c.statusLabel} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
