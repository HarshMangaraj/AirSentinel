import { create } from 'zustand';
import { PollutionAlert, PollutionReport, GovAction } from '../types';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;

  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;

  // Selected details modals
  selectedAlert: PollutionAlert | null;
  setSelectedAlert: (alert: PollutionAlert | null) => void;

  selectedReport: PollutionReport | null;
  setSelectedReport: (report: PollutionReport | null) => void;

  selectedAction: GovAction | null;
  setSelectedAction: (action: GovAction | null) => void;

  // Quick Action Dialogs
  approveModalOpen: boolean;
  setApproveModalOpen: (open: boolean) => void;

  assignModalOpen: boolean;
  setAssignModalOpen: (open: boolean) => void;
  assignTargetEntity: { type: 'alert' | 'report' | 'action'; id: string; title: string } | null;
  setAssignTargetEntity: (target: { type: 'alert' | 'report' | 'action'; id: string; title: string } | null) => void;

  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;

  reportGeneratorModalOpen: boolean;
  setReportGeneratorModalOpen: (open: boolean) => void;

  verificationModalOpen: boolean;
  setVerificationModalOpen: (open: boolean) => void;
  verificationTargetAction: GovAction | null;
  setVerificationTargetAction: (action: GovAction | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),

  userMenuOpen: false,
  setUserMenuOpen: (open) => set({ userMenuOpen: open }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  searchModalOpen: false,
  setSearchModalOpen: (open) => set({ searchModalOpen: open }),

  selectedAlert: null,
  setSelectedAlert: (alert) => set({ selectedAlert: alert }),

  selectedReport: null,
  setSelectedReport: (report) => set({ selectedReport: report }),

  selectedAction: null,
  setSelectedAction: (action) => set({ selectedAction: action }),

  approveModalOpen: false,
  setApproveModalOpen: (open) => set({ approveModalOpen: open }),

  assignModalOpen: false,
  setAssignModalOpen: (open) => set({ assignModalOpen: open }),
  assignTargetEntity: null,
  setAssignTargetEntity: (target) => set({ assignTargetEntity: target }),

  emergencyModalOpen: false,
  setEmergencyModalOpen: (open) => set({ emergencyModalOpen: open }),

  reportGeneratorModalOpen: false,
  setReportGeneratorModalOpen: (open) => set({ reportGeneratorModalOpen: open }),

  verificationModalOpen: false,
  setVerificationModalOpen: (open) => set({ verificationModalOpen: open }),
  verificationTargetAction: null,
  setVerificationTargetAction: (action) => set({ verificationTargetAction: action }),
}));
