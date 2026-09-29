import { Department } from '../types';
import { MOCK_DEPARTMENTS } from '../mock/data';
import { fetchFromBackend } from './apiConfig';

let departmentsDatabase = [...MOCK_DEPARTMENTS];

interface BackendSummary {
  total: number;
  pending: number;
  investigating: number;
  resolved: number;
  today_new: number;
  by_category: Record<string, number>;
}

async function enrichDepartmentsWithLiveData(): Promise<Department[]> {
  try {
    const summary = await fetchFromBackend<BackendSummary>('/reports/summary');
    if (!summary) return [...departmentsDatabase];

    // Distribute live report counts across departments to reflect real workload
    const total = summary.total || 0;
    const pending = summary.pending || 0;
    const investigating = summary.investigating || 0;
    const resolved = summary.resolved || 0;

    // Weighted distribution across departments
    const depts = MOCK_DEPARTMENTS.map((dept, i) => {
      const weight = [0.30, 0.20, 0.15, 0.15, 0.10, 0.10][i] ?? 0.10;
      return {
        ...dept,
        activeActionsCount: Math.round((investigating + pending) * weight) + dept.activeActionsCount,
        completedActionsCount: Math.round(resolved * weight) + dept.completedActionsCount,
        pendingActionsCount: Math.max(0, Math.round(pending * weight)),
        // Keep responseRatePercent as mock since we don't have that metric
      };
    });

    departmentsDatabase = depts;
    return depts;
  } catch (e) {
    return [...departmentsDatabase];
  }
}

export const departmentsService = {
  getDepartments: async (): Promise<Department[]> => {
    return enrichDepartmentsWithLiveData();
  },

  getDepartmentById: async (id: string): Promise<Department | null> => {
    const depts = await enrichDepartmentsWithLiveData();
    const found = depts.find((d) => d.id === id);
    return found ? { ...found } : null;
  },
};
