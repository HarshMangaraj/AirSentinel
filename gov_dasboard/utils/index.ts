import { SeverityLevel, AQICategory, AlertStatus, ReportStatus, ActionStatus } from '../types';

export const getAqiCategory = (aqi: number): AQICategory => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Poor';
  if (aqi <= 300) return 'Very Poor';
  if (aqi <= 400) return 'Severe';
  return 'Hazardous';
};

export const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return '#10B981'; // Green
  if (aqi <= 100) return '#84CC16'; // Light Green/Yellow
  if (aqi <= 200) return '#F59E0B'; // Orange/Yellow
  if (aqi <= 300) return '#EF4444'; // Red
  if (aqi <= 400) return '#9333EA'; // Purple / Severe
  return '#7F1D1D'; // Dark Maroon / Hazardous
};

export const getAqiBgClass = (aqi: number): string => {
  if (aqi <= 50) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (aqi <= 100) return 'bg-lime-500/15 text-lime-400 border-lime-500/30';
  if (aqi <= 200) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  if (aqi <= 300) return 'bg-red-500/15 text-red-400 border-red-500/30';
  if (aqi <= 400) return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  return 'bg-rose-950/40 text-rose-300 border-rose-700/50';
};

export const getSeverityColor = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'Critical':
      return '#EF4444';
    case 'High':
      return '#F97316';
    case 'Medium':
      return '#F59E0B';
    case 'Low':
      return '#10B981';
    default:
      return '#64748B';
  }
};

export const getSeverityBadge = (severity: SeverityLevel) => {
  switch (severity) {
    case 'Critical':
      return {
        bg: 'bg-red-500/15 border-red-500/40 text-red-400',
        dot: 'bg-red-500',
        text: 'Critical',
      };
    case 'High':
      return {
        bg: 'bg-orange-500/15 border-orange-500/40 text-orange-400',
        dot: 'bg-orange-500',
        text: 'High',
      };
    case 'Medium':
      return {
        bg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
        dot: 'bg-amber-500',
        text: 'Medium',
      };
    case 'Low':
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
        dot: 'bg-emerald-500',
        text: 'Low',
      };
    default:
      return {
        bg: 'bg-slate-500/15 border-slate-500/40 text-slate-400',
        dot: 'bg-slate-500',
        text: severity,
      };
  }
};

export const getStatusBadge = (status: AlertStatus | ReportStatus | ActionStatus | string) => {
  switch (status) {
    case 'New':
    case 'Pending':
    case 'Pending Approval':
      return 'bg-blue-500/15 border-blue-500/30 text-blue-400';
    case 'Under Review':
    case 'Assigned':
    case 'Approved':
    case 'Dispatched':
      return 'bg-amber-500/15 border-amber-500/30 text-amber-400';
    case 'Action In Progress':
    case 'In Progress':
      return 'bg-purple-500/15 border-purple-500/30 text-purple-400';
    case 'Resolved':
    case 'Completed':
    case 'Verified':
    case 'On Track':
      return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400';
    case 'Rejected':
    case 'Dismissed':
    case 'Cancelled':
      return 'bg-rose-500/15 border-rose-500/30 text-rose-400';
    default:
      return 'bg-slate-500/15 border-slate-500/30 text-slate-400';
  }
};
