import { Users, Clock3, Building2, AlertTriangle, Download } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { EmergencyVolumeChart } from '../components/charts/EmergencyVolumeChart';
import { TopEmergencyTypes } from '../components/charts/TopEmergencyTypes';
import { LiveCasesTable } from '../components/tables/LiveCasesTable';
import {
  networkStats,
  emergencyVolume,
  topEmergencyTypes,
  liveCases,
} from '../data/mockOverview';
import styles from './Dashboard.module.css';

/**
 * Network overview — the super admin's landing page. Stats, chart and live
 * cases currently read from src/data/mockOverview.ts (clearly flagged as
 * placeholder there): Backend has no network-wide stats endpoints yet, so
 * this UI is built ahead of that API. Swapping the mock import for a real
 * fetch is the only change needed once those endpoints exist.
 */
export function Dashboard() {
  return (
    <AppShell
      title="Network overview"
      subtitle="Across every hospital on Haven"
      actions={
        <Button variant="secondary" size="sm">
          <Download size={15} />
          Export
        </Button>
      }
    >
      <div className={styles.statGrid}>
        <StatCard icon={Users} label="Patients today" value={networkStats.totalPatients.toLocaleString()} />
        <StatCard
          icon={Clock3}
          label="Avg. response time"
          value={`${networkStats.avgResponseSeconds}s`}
        />
        <StatCard icon={Building2} label="Active hospitals" value={String(networkStats.activeHospitals)} />
        <StatCard
          icon={AlertTriangle}
          label="Critical alerts"
          value={String(networkStats.criticalAlerts)}
          tone="critical"
        />
      </div>

      <div className={styles.chartGrid}>
        <Card title="Emergency volume — last 12 hours" className={styles.volumeCard}>
          <EmergencyVolumeChart data={emergencyVolume} />
        </Card>
        <Card title="Top emergency types">
          <TopEmergencyTypes data={topEmergencyTypes} />
        </Card>
      </div>

      <Card title="Live cases" padded={false} className={styles.casesCard}>
        <LiveCasesTable cases={liveCases} />
      </Card>
    </AppShell>
  );
}
