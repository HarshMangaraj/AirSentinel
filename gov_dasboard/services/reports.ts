import { PollutionReport, ReportStatus, ReportType } from '../types';
import { MOCK_REPORTS } from '../mock/data';
import { fetchFromBackend, SUPABASE_URL, SUPABASE_KEY } from './apiConfig';

/** Write a status-change event to Supabase so mobile app gets real-time updates. */
async function pushStatusUpdate(
  reportId: string,
  oldStatus: string,
  newStatus: string,
  updatedBy: string,
  assignedTo?: string,
  notes?: string
) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/report_status_updates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        report_id: reportId,
        old_status: oldStatus,
        new_status: newStatus,
        assigned_to: assignedTo || null,
        admin_notes: notes || null,
        updated_by: updatedBy,
      }),
    });
  } catch (e) {
    console.warn('Failed to push status update to Supabase:', e);
  }
}

interface BackendReport {
  id: string;
  description: string | null;
  category: string | null;
  media_url: string | null;
  lat: number;
  lon: number;
  status: string;
  created_at: string | null;
  status_updated_at?: string | null;
}

function mapCategoryToIssueType(category?: string | null): ReportType {
  const cat = (category || '').toLowerCase();
  if (cat.includes('burn') || cat.includes('garbage')) return 'Open Burning';
  if (cat.includes('dust') || cat.includes('construction')) return 'Construction Pollution';
  if (cat.includes('factory') || cat.includes('industrial') || cat.includes('emission')) return 'Industrial Pollution';
  if (cat.includes('traffic') || cat.includes('vehicle')) return 'Traffic Pollution';
  if (cat.includes('smoke')) return 'Smoke';
  return 'Industrial Pollution';
}

function mapStatusToUiStatus(status?: string | null): ReportStatus {
  const s = (status || '').toLowerCase();
  if (s === 'resolved' || s === 'verified') return 'Resolved';
  if (s === 'investigating' || s === 'under_review' || s === 'in progress' || s === 'in_progress' || s === 'reviewed') return 'In Progress';
  if (s === 'assigned') return 'Assigned';
  if (s === 'rejected' || s === 'dismissed') return 'Rejected';
  return 'Pending';
}

function mapBackendReport(r: BackendReport): PollutionReport {
  const uiStatus = mapStatusToUiStatus(r.status);
  const issueType = mapCategoryToIssueType(r.category);
  const code = `REP-CIT-${r.id.slice(0, 5).toUpperCase()}`;
  const dt = r.created_at ? new Date(r.created_at) : new Date();

  return {
    id: r.id,
    reportCode: code,
    reporterName: 'AirSentinel Citizen (Mobile App)',
    reporterContact: 'Verified Citizen ID',
    isCitizenReport: true,
    location: r.lat && r.lon ? `Lat ${r.lat.toFixed(4)}, Lon ${r.lon.toFixed(4)}` : 'Delhi NCR Region',
    ward: 'Civil Ward 14',
    zone: 'NCR Central Environmental Zone',
    coordinates: {
      latitude: r.lat || 28.6139,
      longitude: r.lon || 77.209,
    },
    issueType,
    description: r.description || `Citizen reported high pollution spike (${issueType}) via AirSentinel app. Requires inspection.`,
    timestamp: dt.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: uiStatus,
    aqiAtReportTime: 325,
    photoUrl: r.media_url || undefined,
    aiClassification: `High Risk - Citizen Photo Verification`,
    probableSource: r.category || 'Local Point Emission',
    confidenceScore: 94,
    weatherSnapshot: {
      temperature: 29,
      humidity: 54,
      windSpeed: 11,
      windDirection: 'NW',
    },
    nearbySensors: [
      {
        sensorId: 's-anand-vihar',
        name: 'Anand Vihar CAAQMS',
        distanceKm: 2.1,
        currentAQI: 362,
      },
    ],
    history: [
      {
        id: `rh-${r.id}`,
        timestamp: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: uiStatus,
        actor: 'Citizen Mobile App',
        notes: 'Submitted incident details and GPS coordinates for inspection.',
      },
    ],
  };
}

let cachedMergedReports: PollutionReport[] = [];

export const reportsService = {
  getReports: async (filters?: {
    status?: string;
    issueType?: string;
    zone?: string;
    search?: string;
  }): Promise<PollutionReport[]> => {
    try {
      const data = await fetchFromBackend<{ reports: BackendReport[] }>('/reports');
      if (data && Array.isArray(data.reports) && data.reports.length > 0) {
        cachedMergedReports = data.reports.map(mapBackendReport);
      }
    } catch (e) {
      console.warn('Backend fetch /reports failed:', e);
    }

    let results = [...cachedMergedReports];

    if (filters?.status && filters.status !== 'All') {
      results = results.filter((r) => r.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.issueType && filters.issueType !== 'All') {
      results = results.filter((r) => r.issueType.toLowerCase() === filters.issueType?.toLowerCase());
    }

    if (filters?.zone && filters.zone !== 'All') {
      results = results.filter((r) => r.zone.toLowerCase() === filters.zone?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.location.toLowerCase().includes(q) ||
          r.reportCode.toLowerCase().includes(q) ||
          r.reporterName.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.issueType.toLowerCase().includes(q)
      );
    }

    return results;
  },

  getReportById: async (id: string): Promise<PollutionReport | null> => {
    try {
      const data = await fetchFromBackend<BackendReport>(`/reports/${id}`);
      if (data && data.id) {
        return mapBackendReport(data);
      }
    } catch (e) {}
    const found = cachedMergedReports.find((r) => r.id === id);
    return found ? { ...found } : null;
  },

  updateReportStatus: async (
    id: string,
    status: ReportStatus,
    actor: string,
    notes?: string
  ): Promise<PollutionReport> => {
    const oldStatus = cachedMergedReports.find((r) => r.id === id)?.status || 'Pending';

    // Sync status back to backend using valid DB enum values:
    // "pending" | "reviewed" | "verified" | "dismissed"
    try {
      const backendStatus =
        status === 'Resolved'    ? 'verified'
        : status === 'In Progress' ? 'reviewed'
        : status === 'Assigned'    ? 'reviewed'
        : status === 'Rejected'    ? 'dismissed'
        : 'pending';
      await fetchFromBackend(`/reports/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: backendStatus, admin_notes: notes }),
      });
    } catch (e) {
      console.warn('Failed to sync report status to backend:', e);
    }

    // Broadcast to all mobile users via Supabase real-time
    await pushStatusUpdate(id, oldStatus, status, actor, undefined, notes);

    const index = cachedMergedReports.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Report not found');

    const updated: PollutionReport = {
      ...cachedMergedReports[index],
      status,
      history: [
        ...cachedMergedReports[index].history,
        {
          id: `rh-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status,
          actor,
          notes,
        },
      ],
    };

    cachedMergedReports[index] = updated;
    return updated;
  },

  assignDepartmentToReport: async (
    reportId: string,
    departmentId: string,
    departmentName: string,
    actor: string,
    notes?: string
  ): Promise<PollutionReport> => {
    const oldStatus = cachedMergedReports.find((r) => r.id === reportId)?.status || 'Pending';

    try {
      await fetchFromBackend(`/reports/${reportId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'assigned',
          assigned_department: departmentName,
          admin_notes: notes,
        }),
      });
    } catch (e) {}

    // Broadcast assignment to all mobile users via Supabase real-time
    await pushStatusUpdate(
      reportId,
      oldStatus,
      'Assigned',
      actor,
      departmentName,
      notes || `Assigned to ${departmentName} for field inspection.`
    );

    const index = cachedMergedReports.findIndex((r) => r.id === reportId);
    if (index === -1) throw new Error('Report not found');

    const updated: PollutionReport = {
      ...cachedMergedReports[index],
      assignedDepartmentId: departmentId,
      assignedDepartmentName: departmentName,
      status: 'Assigned',
      history: [
        ...cachedMergedReports[index].history,
        {
          id: `rh-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Assigned',
          actor,
          notes: notes || `Assigned to ${departmentName} for field inspection.`,
        },
      ],
    };

    cachedMergedReports[index] = updated;
    return updated;
  },
};
