import type { AidTypeCalls } from '../../data/networkDashboard';
import styles from './TopEmergencyTypes.module.css';

interface TopEmergencyTypesProps {
  data: AidTypeCalls[];
}

/**
 * Ranked list with inline meter bars — an ordinal magnitude comparison, not
 * a full chart, so it skips axes/gridlines. Meter fill uses the sequential
 * brand hue; the unfilled track is a lighter step of the same ramp per the
 * dataviz skill's meter spec. A call can carry several aid types, so the
 * counts can add up to more than the number of calls.
 */
export function TopEmergencyTypes({ data }: TopEmergencyTypesProps) {
  if (data.length === 0) {
    return <p className={styles.empty}>No calls in the last 30 days.</p>;
  }

  const max = Math.max(...data.map((d) => d.calls));

  return (
    <ul className={styles.list}>
      {data.map((item) => (
        <li key={item.name} className={styles.row}>
          <div className={styles.labelRow}>
            <span className={styles.name}>{item.name}</span>
            <span className={`${styles.count} tabular-nums`}>{item.calls}</span>
          </div>
          <div className={styles.track}>
            <div className={styles.fill} style={{ width: `${(item.calls / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
