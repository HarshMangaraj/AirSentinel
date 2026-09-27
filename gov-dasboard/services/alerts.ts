import { PollutionAlert, AlertStatus } from '../types';
import { MOCK_ALERTS } from '../mock/data';

let alertsDatabase = [...MOCK_ALERTS];

export const alertsService = {
  getAlerts: async (filters?: {
    severity?: string;
    status?: string;
    zone?: string;
    search?: string;
  }): Promise<PollutionAlert[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    let results = [...alertsDatabase];

    if (filters?.severity && filters.severity !== 'All') {
      results = results.filter((a) => a.severity.toLowerCase() === filters.severity?.toLowerCase());
    }

    if (filters?.status && filters.status !== 'All') {
      results = results.filter((a) => a.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.zone && filters.zone !== 'All') {
      results = results.filter((a) => a.zone.toLowerCase() === filters.zone?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.location.toLowerCase().includes(q) ||
          a.alertCode.toLowerCase().includes(q) ||
          a.sensorModel.toLowerCase().includes(q) ||
          a.probableSource.toLowerCase().includes(q)
      );
    }

    return results;
  },

  getAlertById: async (id: string): Promise<PollutionAlert | null> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const found = alertsDatabase.find((a) => a.id === id);
    return found ? { ...found } : null;
  },

  updateAlertStatus: async (
    id: string,
    status: AlertStatus,
    actorName: string,
    note?: string
  ): Promise<PollutionAlert> => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const index = alertsDatabase.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Alert not found');

    const updated = {
      ...alertsDatabase[index],
      status,
      activityHistory: [
        ...alertsDatabase[index].activityHistory,
        {
          id: `ah-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: `Status changed to ${status}`,
          actor: actorName,
          note,
        },
      ],
    };

    alertsDatabase[index] = updated;
    return updated;
  },

  assignDepartmentToAlert: async (
    alertId: string,
    departmentId: string,
    departmentName: string,
    officerName: string,
    actor: string
  ): Promise<PollutionAlert> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = alertsDatabase.findIndex((a) => a.id === alertId);
    if (index === -1) throw new Error('Alert not found');

    const updated = {
      ...alertsDatabase[index],
      assignedDepartmentId: departmentId,
      assignedDepartmentName: departmentName,
      assignedOfficer: officerName,
      status: 'Assigned' as AlertStatus,
      activityHistory: [
        ...alertsDatabase[index].activityHistory,
        {
          id: `ah-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: `Assigned to ${departmentName} (${officerName})`,
          actor,
        },
      ],
    };

    alertsDatabase[index] = updated;
    return updated;
  },
};
