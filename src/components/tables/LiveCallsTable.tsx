import type { LiveCall } from '../../data/networkDashboard';
import { StatusBadge } from '../ui/StatusBadge';
import styles from './LiveCallsTable.module.css';

interface LiveCallsTableProps {
  calls: LiveCall[];
  /** Reference time for "x ago" — the dashboard's clock, so every row agrees. */
  now: number;
}

function elapsed(since: string, now: number): string {
  const seconds = Math.max(0, Math.round((now - Date.parse(since)) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

/**
 * Calls ringing or ongoing right now. Deliberately no caller column: the super
 * admin sees the emergency and who answered, never who called — the same
 * minimum-necessary line staff are held to.
 */
export function LiveCallsTable({ calls, now }: LiveCallsTableProps) {
  if (calls.length === 0) {
    return <p className={styles.empty}>No calls in progress right now.</p>;
  }

  return (
    <div className={`${styles.scrollWrap} thin-scroll`}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Started</th>
            <th scope="col">Emergency</th>
            <th scope="col">Status</th>
            <th scope="col">Answered by</th>
            <th scope="col">Talk time</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr key={call.id}>
              <td className={`${styles.muted} tabular-nums`}>{elapsed(call.created_at, now)} ago</td>
              <td className={styles.strong}>{call.aid_type_names.join(', ') || '—'}</td>
              <td>
                {call.status === 'ringing' ? (
                  <StatusBadge tone="warning" label="Ringing" />
                ) : (
                  <StatusBadge tone="good" label="On call" />
                )}
              </td>
              <td className={styles.muted}>
                {call.branch_name ? (
                  <>
                    {call.branch_name}
                    <span className={styles.meta}>{call.org_name}</span>
                  </>
                ) : (
                  '—'
                )}
              </td>
              <td className={`${styles.muted} tabular-nums`}>
                {call.answered_at ? elapsed(call.answered_at, now) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
