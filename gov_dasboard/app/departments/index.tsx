import React from 'react';
import { View, Text } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DepartmentStatus } from '../../components/departments/DepartmentStatus';
import { Building2, ShieldCheck, Activity, Users } from 'lucide-react-native';

export default function DepartmentsScreen() {
  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        <View className="pb-4 border-b border-slate-800">
          <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Government Department Operations & Nodal Matrix
          </Text>
          <Text className="text-slate-400 text-xs md:text-sm mt-1">
            Inter-Agency Coordination, Squad Allocation, Response Rates & Statutory Jurisdiction
          </Text>
        </View>

        <DepartmentStatus />
      </View>
    </DashboardLayout>
  );
}
