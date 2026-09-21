import type { EmergencyTypeShare } from '../../data/mockOverview';
import styles from './TopEmergencyTypes.module.css';

interface TopEmergencyTypesProps {
  data: EmergencyTypeShare[];
}

/**
 * Ranked list with inline meter bars — an ordinal magnitude comparison, not
 * a full chart, so it skips axes/gridlines. Meter fill uses the sequential
 * brand hue; the unfilled track is a lighter step of the same ramp per the
 * dataviz skill's meter spec.
 */
export function TopEmergencyTypes({ data }: TopEmergencyTypesProps) {
  const max = Math.max(...data.map((d) => d.count));

  return (
    <ul className={styles.list}>
      {data.map((item) => (
        <li key={item.name} className={styles.row}>
          <div className={styles.labelRow}>
            <span className={styles.name}>{item.name}</span>
            <span className={`${styles.count} tabular-nums`}>{item.count}</span>
          </div>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
