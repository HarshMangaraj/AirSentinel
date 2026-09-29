import React from 'react';
import { View, Text } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { KpiCards } from '../../components/dashboard/KpiCards';
import { EnvironmentalMap } from '../../components/map/EnvironmentalMap';
import { PriorityTriageQueue } from '../../components/dashboard/PriorityTriageQueue';
import { AirQualityOverview } from '../../components/dashboard/AirQualityOverview';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { Navigation } from 'lucide-react-native';

export default function DashboardScreen() {
  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        {/* Authority Command Header */}
        <View className="flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800/80 mb-1">
          <View>
            <View className="flex-row items-center space-x-2">
              <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
                Environmental Command Center
              </Text>
              <View className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full ml-2">
                <Text className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  Live Operations
                </Text>
              </View>
            </View>
            <Text className="text-slate-400 text-xs md:text-sm mt-1">
              National Capital Region &bull; Continuous CAAQMS Ingestion &amp; Inter-Agency Rapid Response
            </Text>
          </View>
        </View>

        {/* 1. Core Pulse KPI Cards (Sensors, Critical Alerts, Pending Reports, Actions) */}
        <KpiCards />

        {/* 2. Primary Situational Row: Geospatial Command (Left 7 cols) + Priority Triage Queue (Right 5 cols) */}
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <View className="lg:col-span-7 flex-col">
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <Navigation size={18} color="#34D399" />
                <Text className="text-white font-bold text-base ml-1">
                  Geospatial Situational Command
                </Text>
              </View>
              <Text className="text-slate-400 text-xs">Continuous Telemetry Heatmap</Text>
            </View>
            <EnvironmentalMap height={440} />
          </View>

          <View className="lg:col-span-5 flex-col">
            <PriorityTriageQueue />
          </View>
        </View>

        {/* 3. Secondary Analysis & Directive Row: Air Quality Intelligence (Left 7 cols) + Quick Directives (Right 5 cols) */}
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <View className="lg:col-span-7">
            <AirQualityOverview />
          </View>

          <View className="lg:col-span-5">
            <QuickActions />
          </View>
        </View>
      </View>
    </DashboardLayout>
  );
}
