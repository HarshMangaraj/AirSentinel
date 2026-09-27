import { GovAction, ActionStatus, ActionPriority, ActionVerification } from '../types';
import { MOCK_ACTIONS } from '../mock/data';

let actionsDatabase = [...MOCK_ACTIONS];

export const actionsService = {
  getActions: async (filters?: {
    status?: string;
    departmentId?: string;
    priority?: string;
    search?: string;
  }): Promise<GovAction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

    let results = [...actionsDatabase];

    if (filters?.status && filters.status !== 'All') {
      results = results.filter((a) => a.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.departmentId && filters.departmentId !== 'All') {
      results = results.filter((a) => a.departmentId === filters.departmentId);
    }

    if (filters?.priority && filters.priority !== 'All') {
      results = results.filter((a) => a.priority.toLowerCase() === filters.priority?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.actionCode.toLowerCase().includes(q) ||
          a.targetLocation.toLowerCase().includes(q) ||
          a.departmentName.toLowerCase().includes(q) ||
          a.assignedTo.toLowerCase().includes(q)
      );
    }

    return results;
  },

  getActionById: async (id: string): Promise<GovAction | null> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const found = actionsDatabase.find((a) => a.id === id);
    return found ? { ...found } : null;
  },

  approveAction: async (id: string, approverName: string): Promise<GovAction> => {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const index = actionsDatabase.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Action not found');

    const updated = {
      ...actionsDatabase[index],
      status: 'Approved' as ActionStatus,
      approvedBy: approverName,
      approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    actionsDatabase[index] = updated;
    return updated;
  },

  updateActionStatus: async (id: string, status: ActionStatus): Promise<GovAction> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const index = actionsDatabase.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Action not found');

    const updated = {
      ...actionsDatabase[index],
      status,
      ...(status === 'Completed'
        ? { completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        : {}),
    };

    actionsDatabase[index] = updated;
    return updated;
  },

  createEmergencyAction: async (data: {
    title: string;
    description: string;
    type: GovAction['type'];
    priority: ActionPriority;
    departmentId: string;
    departmentName: string;
    targetLocation: string;
    assignedTo: string;
    approvedBy: string;
    resourcesDeployed?: string[];
  }): Promise<GovAction> => {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const newAction: GovAction = {
      id: `act-${Date.now()}`,
      actionCode: `ACT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: 'Approved',
      departmentId: data.departmentId,
      departmentName: data.departmentName,
      targetLocation: data.targetLocation,
      targetCoordinates: { latitude: 28.6139, longitude: 77.209 },
      assignedTo: data.assignedTo,
      approvedBy: data.approvedBy,
      approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resourcesDeployed: data.resourcesDeployed || ['Rapid Emergency Deployment Team'],
    };

    actionsDatabase.unshift(newAction);
    return newAction;
  },

  verifyActionImpact: async (
    actionId: string,
    postInterventionAQI: number,
    postInterventionPM25: number,
    verifiedBy: string
  ): Promise<GovAction> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = actionsDatabase.findIndex((a) => a.id === actionId);
    if (index === -1) throw new Error('Action not found');

    const action = actionsDatabase[index];
    const baselineAQI = action.verification?.baselineAQI || 280;
    const baselinePM25 = action.verification?.baselinePM25 || 190;

    const diffAQI = ((postInterventionAQI - baselineAQI) / baselineAQI) * 100;
    const diffPM25 = ((postInterventionPM25 - baselinePM25) / baselinePM25) * 100;

    const verification: ActionVerification = {
      id: `ver-${Date.now()}`,
      actionId,
      baselineAQI,
      baselinePM25,
      postInterventionAQI,
      postInterventionPM25,
      percentageChangeAQI: Number(diffAQI.toFixed(1)),
      percentageChangePM25: Number(diffPM25.toFixed(1)),
      measurementDurationHours: 2.0,
      verificationStatus: diffAQI < -10 ? 'Verified Improvement' : 'Marginal Change',
      estimatedImpactConfidence: 89,
      disclaimer:
        'Calculated as estimated impact comparing local microclimate telemetry against meteorological diffusion factors. Correlation does not claim sole causation.',
      verifiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verifiedBy,
    };

    const updated: GovAction = {
      ...action,
      status: 'Verified',
      verification,
    };

    actionsDatabase[index] = updated;
    return updated;
  },
};
