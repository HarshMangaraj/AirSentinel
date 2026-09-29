export interface ReportStatusMeta {
  key: 'pending' | 'reviewing' | 'assigned' | 'in_progress' | 'resolved' | 'dismissed';
  label: string;
  color: string;
  icon: string;
}

export function normalizeStatus(rawStatus?: string | null): string {
  const s = (rawStatus || '').toLowerCase().trim().replace(/ /g, '_');
  if (s === 'resolved' || s === 'verified') return 'resolved';
  if (s === 'in_progress' || s === 'investigating' || s === 'action_taken' || s === 'action_in_progress') return 'in_progress';
  if (s === 'assigned') return 'assigned';
  if (s === 'reviewing' || s === 'reviewed' || s === 'under_review') return 'reviewing';
  if (s === 'dismissed' || s === 'rejected') return 'dismissed';
  return 'pending';
}

export function getReportStatusMeta(rawStatus?: string | null): ReportStatusMeta {
  const norm = normalizeStatus(rawStatus);
  switch (norm) {
    case 'resolved':
      return { key: 'resolved', label: 'Resolved ✓', color: '#10B981', icon: 'check-circle' };
    case 'in_progress':
      return { key: 'in_progress', label: 'In Progress', color: '#0EA5E9', icon: 'tool' };
    case 'assigned':
      return { key: 'assigned', label: 'Assigned', color: '#6366F1', icon: 'user-check' };
    case 'reviewing':
      return { key: 'reviewing', label: 'Under Review', color: '#F59E0B', icon: 'eye' };
    case 'dismissed':
      return { key: 'dismissed', label: 'Dismissed', color: '#EF4444', icon: 'x-circle' };
    case 'pending':
    default:
      return { key: 'pending', label: 'Pending Review', color: '#F59E0B', icon: 'inbox' };
  }
}
