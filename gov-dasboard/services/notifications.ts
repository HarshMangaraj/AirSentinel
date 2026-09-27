import { NotificationItem, LiveFeedEvent } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_LIVE_FEED } from '../mock/data';

let notifsDatabase = [...MOCK_NOTIFICATIONS];
let feedDatabase = [...MOCK_LIVE_FEED];

export const notificationsService = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...notifsDatabase];
  },

  markAsRead: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    notifsDatabase = notifsDatabase.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  },

  markAllAsRead: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    notifsDatabase = notifsDatabase.map((n) => ({ ...n, isRead: true }));
  },
};

export const liveFeedService = {
  getLiveFeed: async (): Promise<LiveFeedEvent[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
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
