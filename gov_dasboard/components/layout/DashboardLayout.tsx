import React from 'react';
import { View, ScrollView } from 'react-native';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Footer } from './Footer';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationPanel } from './NotificationPanel';
import { UserMenuDropdown } from './UserMenuDropdown';
import { AlertDetailsModal } from '../alerts/AlertDetailsModal';
import { ReportDetailsModal } from '../reports/ReportDetailsModal';
import { ActionApprovalModal } from '../actions/ActionApprovalModal';
import { DepartmentAssignmentModal } from '../actions/DepartmentAssignmentModal';
import { EmergencyResponseModal } from '../actions/EmergencyResponseModal';
import { ReportGeneratorModal } from '../reports/ReportGeneratorModal';
import { ActionVerificationModal } from '../actions/ActionVerificationModal';

import { CitizenReportAlertBanner } from '../common/CitizenReportAlertBanner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <View className="flex-1 flex-row bg-slate-950 h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <View className="flex-1 flex-col h-full overflow-hidden">
        <TopHeader />

        <ScrollView
          className="flex-1 bg-slate-950"
          contentContainerStyle={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
          showsVerticalScrollIndicator
        >
          <View className="flex-1 p-4 md:p-6">
            <CitizenReportAlertBanner />
            {children}
          </View>
          <Footer />
        </ScrollView>
      </View>

      {/* Global Modals */}
      <GlobalSearchModal />
      <NotificationPanel />
      <UserMenuDropdown />
      <AlertDetailsModal />
      <ReportDetailsModal />
      <ActionApprovalModal />
      <DepartmentAssignmentModal />
      <EmergencyResponseModal />
      <ReportGeneratorModal />
      <ActionVerificationModal />
    </View>
  );
};
