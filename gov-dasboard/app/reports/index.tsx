import React from 'react';
import { View, Text } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ReportsTable } from '../../components/reports/ReportsTable';

export default function ReportsScreen() {
  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        <View className="pb-4 border-b border-slate-800">
          <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Field & Citizen Grievance Reports
          </Text>
          <Text className="text-slate-400 text-xs md:text-sm mt-1">
            Official Statutory Grievance Redressal, Field Evidence Inspection & Multi-Department Assignment
          </Text>
        </View>

        <ReportsTable maxItems={50} showViewAll={false} />
      </View>
    </DashboardLayout>
  );
}
