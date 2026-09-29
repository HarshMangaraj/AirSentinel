import { PollutionReport, ReportStatus } from '../types';
import { MOCK_REPORTS } from '../mock/data';

let reportsDatabase = [...MOCK_REPORTS];

export const reportsService = {
  getReports: async (filters?: {
    status?: string;
    issueType?: string;
    zone?: string;
    search?: string;
  }): Promise<PollutionReport[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    let results = [...reportsDatabase];

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
    await new Promise((resolve) => setTimeout(resolve, 150));
    const found = reportsDatabase.find((r) => r.id === id);
    return found ? { ...found } : null;
  },

  updateReportStatus: async (
    id: string,
    status: ReportStatus,
    actor: string,
    notes?: string
  ): Promise<PollutionReport> => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const index = reportsDatabase.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Report not found');

    const updated = {
      ...reportsDatabase[index],
      status,
      history: [
        ...reportsDatabase[index].history,
        {
          id: `rh-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status,
          actor,
          notes,
        },
      ],
    };

    reportsDatabase[index] = updated;
    return updated;
  },

  assignDepartmentToReport: async (
    reportId: string,
    departmentId: string,
    departmentName: string,
    actor: string,
    notes?: string
  ): Promise<PollutionReport> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = reportsDatabase.findIndex((r) => r.id === reportId);
    if (index === -1) throw new Error('Report not found');

    const updated = {
      ...reportsDatabase[index],
      assignedDepartmentId: departmentId,
      assignedDepartmentName: departmentName,
      status: 'Assigned' as ReportStatus,
      history: [
        ...reportsDatabase[index].history,
        {
          id: `rh-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Assigned' as ReportStatus,
          actor,
          notes: notes || `Assigned to ${departmentName}`,
        },
      ],
    };

    reportsDatabase[index] = updated;
    return updated;
  },
};
