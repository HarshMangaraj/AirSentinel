import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { KpiCards } from '../../components/dashboard/KpiCards';
import { EnvironmentalMap } from '../../components/map/EnvironmentalMap';
import { AlertList } from '../../components/alerts/AlertList';
import { AirQualityOverview } from '../../components/dashboard/AirQualityOverview';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { ReportsTable } from '../../components/reports/ReportsTable';
import { DepartmentStatus } from '../../components/departments/DepartmentStatus';
import { LiveFeed } from '../../components/dashboard/LiveFeed';
import { ShieldAlert, Sparkles, Navigation, AlertOctagon } from 'lucide-react-native';
import { useAuthStore } from '../../store/useAuthStore';

export default function DashboardScreen() {
  const { currentUser } = useAuthStore();

  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        {/* Authority Command Header */}
        <View className="flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800/80 mb-2">
          <View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Government Environmental Command Center
              </Text>
              <View className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full ml-2">
                <Text className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  Live Operations
                </Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs md:text-sm mt-1">
              National Capital Region • Continuous CAAQMS Ingestion & Inter-Agency Rapid Response
            </Text>
          </View>

          <View className="mt-3 md:mt-0 flex-row items-center space-x-3">
            <View className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
              <Text className="text-slate-400 text-[11px]">Active Officer:</Text>
              <Text className="text-slate-200 text-xs font-semibold">{currentUser.name}</Text>
            </View>
          </View>
        </View>

        {/* 1. Overview KPI Cards */}
        <KpiCards />

        {/* 2. Top Multi-Column: Live Environmental Map (Left 7 cols) + Recent Alerts (Right 5 cols) */}
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <View className="lg:col-span-7 flex-col">
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <Navigation size={18} color="#34D399" />
                <Text className="text-white font-bold text-base ml-1">
                  Live Environmental Geospatial Command
                </Text>
              </View>
              <Text className="text-slate-400 text-xs">Continuous Telemetry Heatmap</Text>
            </View>
            <EnvironmentalMap height={460} />
          </View>

          <View className="lg:col-span-5 flex-col">
            <AlertList maxItems={3} showViewAll />
          </View>
        </View>

        {/* 3. Air Quality Overview & Trend Analytics */}
        <AirQualityOverview />

        {/* 4. Quick Authority Actions */}
        <QuickActions />

        {/* 5. Mid-Section: Recent Reports Table */}
        <ReportsTable maxItems={5} showViewAll />

        {/* 6. Lower Multi-Column: Department Status (Left 7 cols) + Live Activity Feed (Right 5 cols) */}
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <View className="lg:col-span-7">
            <DepartmentStatus />
          </View>

          <View className="lg:col-span-5">
            <LiveFeed maxItems={5} />
          </View>
        </View>
      </View>
    </DashboardLayout>
  );
}
