import { NotificationItem, LiveFeedEvent, SeverityLevel } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_LIVE_FEED } from '../mock/data';
import { fetchFromBackend } from './apiConfig';

interface BackendReport {
  id: string;
  description: string | null;
  category: string | null;
  status: string;
  created_at: string | null;
  lat: number;
  lon: number;
}

function mapReportToNotification(r: BackendReport, idx: number): NotificationItem {
  const sev: SeverityLevel = 'High';
  const dt = r.created_at ? new Date(r.created_at) : new Date();
  const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return {
    id: `notif-report-${r.id}`,
    title: `New Citizen Report: ${r.category || 'Pollution Incident'}`,
    message: r.description
      ? r.description.slice(0, 90) + (r.description.length > 90 ? '…' : '')
      : 'A citizen submitted a new pollution report via AirSentinel mobile app. Requires review.',
    timestamp: timeStr,
    isRead: false,
    type: 'report',
    severity: sev,
    linkId: r.id,
  };
}

function mapReportToFeedEvent(r: BackendReport): LiveFeedEvent {
  const dt = r.created_at ? new Date(r.created_at) : new Date();
  const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return {
    id: `feed-report-${r.id}`,
    type: 'citizen_report',
    title: `Citizen Incident: ${r.category || 'Pollution Spike'}`,
    description:
      r.description?.slice(0, 100) ||
      'AirSentinel mobile user flagged a real-time pollution event in their vicinity.',
    location: r.lat && r.lon ? `Lat ${r.lat.toFixed(3)}, Lon ${r.lon.toFixed(3)}` : 'Delhi NCR',
    timestamp: timeStr,
    severity: 'High',
    relatedEntityId: r.id,
    relatedEntityType: 'report',
  };
}

let notifsDatabase: NotificationItem[] = [];
let feedDatabase: LiveFeedEvent[] = [];
let lastFetchedReportIds = new Set<string>();

async function syncFromBackend() {
  try {
    const data = await fetchFromBackend<{ reports: BackendReport[] }>('/reports?limit=20');
    if (!data || !Array.isArray(data.reports)) return;

    const newReports = data.reports.filter((r) => !lastFetchedReportIds.has(r.id));

    // Mark IDs
    data.reports.forEach((r) => lastFetchedReportIds.add(r.id));

    if (newReports.length === 0) return;

    // Prepend new notification items (deduplicate by id)
    const existingNotifIds = new Set(notifsDatabase.map((n) => n.id));
    const newNotifs = newReports
      .map((r, i) => mapReportToNotification(r, i))
      .filter((n) => !existingNotifIds.has(n.id));
    notifsDatabase = [...newNotifs, ...notifsDatabase];

    // Prepend new live feed events
    const existingFeedIds = new Set(feedDatabase.map((e) => e.id));
    const newFeedEvents = newReports
      .map(mapReportToFeedEvent)
      .filter((e) => !existingFeedIds.has(e.id));
    feedDatabase = [...newFeedEvents, ...feedDatabase];
  } catch (e) {
    // Silently fallback to existing data
  }
}

// Bootstrap sync
syncFromBackend();

export const notificationsService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    await syncFromBackend();
    return [...notifsDatabase];
  },

  markAsRead: async (id: string): Promise<void> => {
    notifsDatabase = notifsDatabase.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  },

  markAllAsRead: async (): Promise<void> => {
    notifsDatabase = notifsDatabase.map((n) => ({ ...n, isRead: true }));
  },
};

export const liveFeedService = {
  getLiveFeed: async (): Promise<LiveFeedEvent[]> => {
    await syncFromBackend();
    return [...feedDatabase];
  },

  addFeedEvent: (event: Omit<LiveFeedEvent, 'id'>) => {
    const newEvent: LiveFeedEvent = {
      ...event,
      id: `feed-${Date.now()}`,
    };
    feedDatabase = [newEvent, ...feedDatabase];
    return newEvent;
  },
};
