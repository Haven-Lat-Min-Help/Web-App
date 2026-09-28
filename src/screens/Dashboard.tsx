import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, CircleCheck, Clock3, PhoneMissed, RefreshCw } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { EmergencyVolumeChart } from '../components/charts/EmergencyVolumeChart';
import { TopEmergencyTypes } from '../components/charts/TopEmergencyTypes';
import { LiveCallsTable } from '../components/tables/LiveCallsTable';
import { CoverageGaps, NetworkHealth } from '../components/dashboard/DashboardPanels';
import type { NetworkDashboard } from '../data/networkDashboard';
import { apiFetch, ApiError } from '../config/api';
import styles from './Dashboard.module.css';

/** Live calls and on-duty counts go stale fast; 30 s keeps them honest without hammering the API. */
const POLL_MS = 30_000;

function formatSeconds(seconds: number | null): string {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

/**
 * Network overview — the super admin's landing page, from GET /calls/dashboard.
 * Polls every 30 s while the tab is visible (and refreshes on return to it),
 * so live calls and who is on duty stay current. A failed refresh keeps the
 * last good data on screen and says so, rather than blanking the page.
 */
export function Dashboard() {
  const [data, setData] = useState<NetworkDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await apiFetch<NetworkDashboard>('/calls/dashboard'));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const updatedAt = data
    ? new Date(data.generated_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;
  const unanswered = data ? data.today.missed + data.today.no_staff : 0;

  return (
    <AppShell
      title="Network overview"
      subtitle="Across every hospital on Haven · today is IST"
      actions={
        <div className={styles.actions}>
          {updatedAt && <span className={styles.updated}>Updated {updatedAt}</span>}
          <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw size={15} />
            Refresh
          </Button>
        </div>
      }
    >
      {error && (
        <p role="alert" className={styles.error}>
          {data ? `Couldn't refresh — showing data from ${updatedAt}. ${error}` : error}
        </p>
      )}
      {!data && !error && <p className={styles.empty}>Loading…</p>}

      {data && (
        <>
          <div className={styles.statGrid}>
            <StatCard icon={PhoneCall} label="Calls today" value={data.today.total.toLocaleString()} />
            <StatCard
              icon={CircleCheck}
              label="Answer rate today"
              value={data.today.answer_rate === null ? '—' : `${Math.round(data.today.answer_rate * 100)}%`}
            />
            <StatCard
              icon={Clock3}
              label="Median time to answer"
              value={formatSeconds(data.today.median_answer_seconds)}
            />
            <StatCard
              icon={PhoneMissed}
              label="Unanswered today"
              value={String(unanswered)}
              tone={unanswered > 0 ? 'critical' : 'default'}
            />
          </div>

          <div className={styles.chartGrid}>
            <Card title="Calls — last 24 hours" className={styles.volumeCard}>
              <EmergencyVolumeChart data={data.hourly} />
            </Card>
            <Card title="Top emergency types — 30 days">
              <TopEmergencyTypes data={data.aid_mix} />
            </Card>
          </div>

          <div className={styles.panelGrid}>
            <Card title="Coverage gaps">
              <CoverageGaps uncoveredNow={data.uncovered_now} uncoveredAtAll={data.uncovered_aid_types} />
            </Card>
            <Card
              title="Network health"
              action={
                <Link to="/hospitals" className={styles.cardLink}>
                  View hospitals
                </Link>
              }
            >
              <NetworkHealth staff={data.staff} network={data.network} />
            </Card>
          </div>

          <Card title={`Live calls (${data.live_calls.length})`} padded={false} className={styles.casesCard}>
            <LiveCallsTable calls={data.live_calls} now={Date.parse(data.generated_at)} />
          </Card>
        </>
      )}
    </AppShell>
  );
}
