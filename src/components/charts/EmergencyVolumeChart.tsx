import { useState } from 'react';
import type { HourlyVolume } from '../../data/mockOverview';
import styles from './EmergencyVolumeChart.module.css';

interface EmergencyVolumeChartProps {
  data: HourlyVolume[];
}

const CHART_HEIGHT = 160;
const BAR_MAX_WIDTH = 24;

/**
 * Single-series hourly bar chart. Follows the dataviz skill's mark spec:
 * bars capped at 24px, 4px rounded top, square baseline, 2px surface gap
 * between bars, hairline recessive gridlines, one direct label (the peak
 * hour) rather than a number on every bar. No legend — a single series
 * doesn't need one; the card title already names what's plotted.
 *
 * Ships a per-bar hover tooltip plus a table-view toggle (the accessible
 * twin of the chart), per the skill's interaction + accessibility rules.
 */
export function EmergencyVolumeChart({ data }: EmergencyVolumeChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const max = Math.max(...data.map((d) => d.count));
  const peakIndex = data.findIndex((d) => d.count === max);
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) =>
    Math.round((max / gridSteps) * i),
  ).reverse();

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
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
          <caption className={styles.tableCaption}>Emergency volume, last 12 hours</caption>
          <thead>
            <tr>
              <th scope="col">Hour</th>
              <th scope="col">Emergencies</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.hourLabel}>
                <td>{d.hourLabel}</td>
                <td className="tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className={styles.chartArea}>
          <div className={styles.gridLines} style={{ height: CHART_HEIGHT }}>
            {gridValues.map((value) => (
              <div key={value} className={styles.gridRow}>
                <span className={styles.gridLabel}>{value}</span>
                <span className={styles.gridLine} />
              </div>
            ))}
          </div>

          <div className={styles.bars} style={{ height: CHART_HEIGHT }}>
            {data.map((d, index) => {
              const heightPct = max === 0 ? 0 : (d.count / max) * 100;
              const isPeak = index === peakIndex;
              const isActive = activeIndex === index;
              return (
                <div key={d.hourLabel} className={styles.barColumn}>
                  {isActive && (
                    <div className={styles.tooltip} role="status">
                      <strong>{d.count}</strong> emergencies · {d.hourLabel}
                    </div>
                  )}
                  <div className={styles.barTrack}>
                    <button
                      type="button"
                      className={`${styles.bar} ${isPeak || isActive ? styles.barEmphasis : ''}`}
                      style={{ height: `${heightPct}%`, maxWidth: BAR_MAX_WIDTH }}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => setActiveIndex(null)}
                      aria-label={`${d.hourLabel}: ${d.count} emergencies`}
                    >
                      {isPeak && <span className={styles.peakLabel}>{d.count}</span>}
                    </button>
                  </div>
                  <span className={styles.barLabel}>{d.hourLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
