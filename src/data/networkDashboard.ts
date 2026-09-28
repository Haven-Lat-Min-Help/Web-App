/**
 * Response shape of GET /calls/dashboard (Backend network_dashboard RPC,
 * 20260929000000_network_branches_and_dashboard.sql). Nothing here identifies
 * a caller: calls are counts, aid types and the branch that answered.
 */

export interface HourlyCalls {
  /** 0-23, IST — the server buckets in IST so the browser's zone can't shift it. */
  hour: number;
  answered: number;
  /** missed + no_staff: nobody took it. */
  unanswered: number;
  /** Every call that started this hour, including cancelled and still-ringing. */
  total: number;
}

export interface AidTypeCalls {
  name: string;
  calls: number;
}

export interface LiveCall {
  id: string;
  status: 'ringing' | 'ongoing';
  created_at: string;
  answered_at: string | null;
  /** Null while ringing. */
  branch_name: string | null;
  org_name: string | null;
  aid_type_names: string[];
}

export interface NetworkDashboard {
  today: {
    total: number;
    answered: number;
    missed: number;
    no_staff: number;
    cancelled: number;
    /** 0-1; null when no call has an outcome yet today. */
    answer_rate: number | null;
    /** Null when nothing was answered today. */
    median_answer_seconds: number | null;
  };
  staff: {
    active: number;
    /** Staff of an active branch in an active org — the only ones who can go on duty. */
    ready: number;
    on_duty: number;
  };
  network: {
    organizations: number;
    branches: number;
    branches_ready: number;
    branches_without_admin: number;
    branches_without_location: number;
    branches_without_staff: number;
    expired_invites: number;
    active_blocks: number;
  };
  hourly: HourlyCalls[];
  aid_mix: AidTypeCalls[];
  /** Aid types no ready staff member treats at all. */
  uncovered_aid_types: string[];
  /** Aid types nobody on duty treats right now — a call for these would ring no one. */
  uncovered_now: string[];
  live_calls: LiveCall[];
  generated_at: string;
}

/** 0-23 -> "12 AM", "1 PM" … */
export function hourLabel(hour: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  return `${hour % 12 === 0 ? 12 : hour % 12} ${suffix}`;
}
