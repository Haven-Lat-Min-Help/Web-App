import { useState } from 'react';
import { hourLabel, type HourlyCalls } from '../../data/networkDashboard';
import styles from './EmergencyVolumeChart.module.css';

interface EmergencyVolumeChartProps {
  data: HourlyCalls[];
}

const CHART_HEIGHT = 160;
/** Room under the bars for the hour labels; must match .gridLines' bottom inset. */
const LABEL_ROW = 24;
const BAR_MAX_WIDTH = 24;
/** Floor for the y scale so a quiet day still gets 4 distinct gridlines. */
const MIN_SCALE = 4;

/**
 * Hourly calls, stacked by outcome: answered (brand green), unanswered —
 * missed or nobody live — in the serious tone, and the rest (cancelled by the
 * caller, or still ringing) as a light step of the green ramp. Stack order
 * puts answered on the baseline so it's the one directly comparable series.
 *
 * Mark spec as before: bars capped at 24px, rounded top, 2px gap, hairline
 * gridlines, one direct label (the peak hour). Hover tooltip per bar and a
 * table view — the accessible twin of the chart.
 */
export function EmergencyVolumeChart({ data }: EmergencyVolumeChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const peak = Math.max(0, ...data.map((d) => d.total));
  const scale = Math.max(MIN_SCALE, peak);
  const peakIndex = peak > 0 ? data.findIndex((d) => d.total === peak) : -1;
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => Math.round((scale / gridSteps) * i)).reverse();

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <ul className={styles.legend} aria-label="Legend">
          <li>
            <span className={`${styles.swatch} ${styles.answered}`} /> Answered
          </li>
          <li>
            <span className={`${styles.swatch} ${styles.unanswered}`} /> Unanswered
          </li>
          <li>
            <span className={`${styles.swatch} ${styles.other}`} /> Cancelled / ringing
          </li>
        </ul>
        <button
          type="button"
          className={styles.tableToggle}
          onClick={() => setShowTable((v) => !v)}
          aria-pressed={showTable}
        >
          {showTable ? 'View as chart' : 'View as table'}
        </button>
      </div>

      {showTable ? (
        <table className={styles.table}>
          <caption className={styles.tableCaption}>Calls per hour (IST), last 24 hours</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              <th scope="col">Answered</th>
              <th scope="col">Unanswered</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.hour}>
                <td>{hourLabel(d.hour)}</td>
                <td className="tabular-nums">{d.answered}</td>
                <td className="tabular-nums">{d.unanswered}</td>
                <td className="tabular-nums">{d.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.chartArea}>
          <div className={styles.gridLines} style={{ bottom: LABEL_ROW }}>
            {gridValues.map((value) => (
              <div key={value} className={styles.gridRow}>
                <span className={styles.gridLabel}>{value}</span>
                <span className={styles.gridLine} />
              </div>
            ))}
          </div>

          <div className={styles.bars} style={{ height: CHART_HEIGHT + LABEL_ROW, paddingBottom: LABEL_ROW }}>
            {data.map((d, index) => {
              const other = Math.max(0, d.total - d.answered - d.unanswered);
              const isActive = activeIndex === index;
              const label = hourLabel(d.hour);
              return (
                <div key={d.hour} className={styles.barColumn}>
                  {isActive && (
                    <div className={styles.tooltip} role="status">
                      {label} · <strong>{d.answered}</strong> answered · <strong>{d.unanswered}</strong> unanswered
                      {other > 0 && (
                        <>
                          {' '}
                          · <strong>{other}</strong> other
                        </>
                      )}
                    </div>
                  )}
                  <div className={styles.barTrack} style={{ height: CHART_HEIGHT }}>
                    <button
                      type="button"
                      className={`${styles.bar} ${isActive ? styles.barActive : ''}`}
                      style={{ height: `${(d.total / scale) * 100}%`, maxWidth: BAR_MAX_WIDTH }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => setActiveIndex(null)}
                      aria-label={`${label}: ${d.answered} answered, ${d.unanswered} unanswered, ${other} other`}
                    >
                      {index === peakIndex && <span className={styles.peakLabel}>{d.total}</span>}
                      {/* .stack is column-reverse, so the first segment sits on the baseline */}
                      <span className={styles.stack}>
                        <span className={`${styles.segment} ${styles.answered}`} style={{ flexGrow: d.answered }} />
                        <span className={`${styles.segment} ${styles.unanswered}`} style={{ flexGrow: d.unanswered }} />
                        <span className={`${styles.segment} ${styles.other}`} style={{ flexGrow: other }} />
                      </span>
                    </button>
                  </div>
                  {index % 3 === 0 && (
                    <span className={`${styles.barLabel} ${index % 6 !== 0 ? styles.barLabelMinor : ''}`}>
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
