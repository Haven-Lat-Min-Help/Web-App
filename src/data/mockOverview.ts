/**
 * MOCK DATA — placeholder for the network overview page.
 *
 * Backend has no endpoints for network-wide stats, live cases, or emergency
 * volume yet (it currently only serves /hospitals/nearby, /chat, /aid-types,
 * /location, /resources — see Backend/src/routes). This file exists so the
 * Overview UI can be built and reviewed now; swap it for a real fetch once
 * those endpoints exist. Shapes here are deliberately close to what a real
 * API response would look like, to make that swap mechanical.
 */

import type { StatusTone } from '../components/ui/StatusBadge';

export interface NetworkStats {
  totalPatients: number;
  avgResponseSeconds: number;
  activeHospitals: number;
  criticalAlerts: number;
}

export interface HourlyVolume {
  hourLabel: string;
  count: number;
}

export interface EmergencyTypeShare {
  name: string;
  count: number;
}

export interface LiveCase {
  id: string;
  time: string;
  patient: string;
  location: string;
  hospital: string;
  status: StatusTone;
  statusLabel: string;
}

export const networkStats: NetworkStats = {
  totalPatients: 1254,
  avgResponseSeconds: 38,
  activeHospitals: 96,
  criticalAlerts: 3,
};

export const emergencyVolume: HourlyVolume[] = [
  { hourLabel: '9 AM', count: 12 },
  { hourLabel: '10 AM', count: 18 },
  { hourLabel: '11 AM', count: 15 },
  { hourLabel: '12 PM', count: 22 },
  { hourLabel: '1 PM', count: 27 },
  { hourLabel: '2 PM', count: 24 },
  { hourLabel: '3 PM', count: 30 },
  { hourLabel: '4 PM', count: 34 },
  { hourLabel: '5 PM', count: 29 },
  { hourLabel: '6 PM', count: 21 },
  { hourLabel: '7 PM', count: 17 },
  { hourLabel: '8 PM', count: 14 },
];

export const topEmergencyTypes: EmergencyTypeShare[] = [
  { name: 'Cardiac arrest', count: 86 },
  { name: 'Burns', count: 64 },
  { name: 'Road accident trauma', count: 58 },
  { name: 'Choking', count: 31 },
  { name: 'Severe bleeding', count: 24 },
];

export const liveCases: LiveCase[] = [
  {
    id: 'c-9231',
    time: '2 min ago',
    patient: 'Rakesh K.',
    location: 'Indiranagar, Bengaluru',
    hospital: 'St. Anthony Hospital',
    status: 'critical',
    statusLabel: 'Critical',
  },
  {
    id: 'c-9230',
    time: '6 min ago',
    patient: 'Fatima S.',
    location: 'Koramangala, Bengaluru',
    hospital: 'Manipal Hospitals — Old Airport Road',
    status: 'serious',
    statusLabel: 'Serious',
  },
  {
    id: 'c-9228',
    time: '14 min ago',
    patient: 'Arjun M.',
    location: 'Whitefield, Bengaluru',
    hospital: 'Manipal Hospitals — Whitefield',
    status: 'warning',
    statusLabel: 'Pending',
  },
  {
    id: 'c-9225',
    time: '22 min ago',
    patient: 'Priya N.',
    location: 'HSR Layout, Bengaluru',
    hospital: 'Apollo Hospitals — Bannerghatta',
    status: 'good',
    statusLabel: 'Stable',
  },
  {
    id: 'c-9219',
    time: '41 min ago',
    patient: 'Deepak V.',
    location: 'Jayanagar, Bengaluru',
    hospital: 'Fortis Hospital — Bannerghatta',
    status: 'good',
    statusLabel: 'Stable',
  },
];
