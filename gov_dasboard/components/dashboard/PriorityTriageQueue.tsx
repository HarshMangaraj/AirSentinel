import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  FileText,
  UserCheck,
  Eye,
  ArrowRight,
  ShieldAlert,
  Flame,
  Clock,
  MapPin,
  CheckCircle,
} from 'lucide-react-native';
import { alertsService } from '../../services/alerts';
import { reportsService } from '../../services/reports';
import { useUIStore } from '../../store/useUIStore';
import { getAqiBgClass } from '../../utils';

export const PriorityTriageQueue: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'reports' | 'alerts'>('reports');

  const {
    setSelectedReport,
    setSelectedAlert,
    setAssignModalOpen,
    setAssignTargetEntity,
  } = useUIStore();

  // Fetch pending reports awaiting triage
  const {
    data: reports,
    isLoading: reportsLoading,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['triage-pending-reports'],
    queryFn: () => reportsService.getReports({ status: 'Pending' }),
  });

  // Fetch high / critical alerts
  const {
    data: alerts,
    isLoading: alertsLoading,
    refetch: refetchAlerts,
  } = useQuery({
    queryKey: ['triage-critical-alerts'],
    queryFn: () => alertsService.getAlerts({ severity: 'Critical' }),
  });

  const pendingReports = reports?.filter((r) => r.status === 'Pending') || [];
  const criticalAlerts = alerts || [];

  const handleAssignReport = (report: any) => {
    setAssignTargetEntity({
      type: 'report',
      id: report.id,
      title: `${report.reportCode} - ${report.issueType}`,
    });
    setAssignModalOpen(true);
  };

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl flex-col h-full justify-between">
      {/* Header */}
      <View>
        <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <View className="flex-row items-center space-x-2">
            <View className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 items-center justify-center">
              <ShieldAlert size={18} color="#F59E0B" />
            </View>
            <View className="ml-2.5">
              <Text className="text-white font-bold text-base">Priority Triage Queue</Text>
              <Text className="text-slate-400 text-xs">Immediate Interventions Needing Action</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push(activeTab === 'reports' ? '/reports' : '/alerts')}
            className="flex-row items-center space-x-1 px-2.5 py-1 bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700"
          >
            <Text className="text-emerald-400 text-xs font-semibold">View Docket</Text>
            <ArrowRight size={12} color="#34D399" />
          </TouchableOpacity>
        </View>

        {/* Tab Toggle */}
        <View className="flex-row items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 mb-3 space-x-1">
          <TouchableOpacity
            onPress={() => setActiveTab('reports')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex-row items-center justify-center space-x-1.5 ${
              activeTab === 'reports'
                ? 'bg-blue-600/30 border border-blue-500/40 text-blue-300'
                : 'hover:bg-slate-900'
            }`}
          >
            <FileText size={13} color={activeTab === 'reports' ? '#93C5FD' : '#94A3B8'} />
            <Text
              className={`text-xs font-semibold ml-1 ${
                activeTab === 'reports' ? 'text-blue-300' : 'text-slate-400'
              }`}
            >
              Grievances ({pendingReports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('alerts')}
            className={`flex-1 py-1.5 px-2 rounded-lg flex-row items-center justify-center space-x-1.5 ${
              activeTab === 'alerts'
                ? 'bg-red-600/30 border border-red-500/40 text-red-300'
                : 'hover:bg-slate-900'
            }`}
          >
            <Flame size={13} color={activeTab === 'alerts' ? '#FCA5A5' : '#94A3B8'} />
            <Text
              className={`text-xs font-semibold ml-1 ${
                activeTab === 'alerts' ? 'text-red-300' : 'text-slate-400'
              }`}
            >
              Critical Spikes ({criticalAlerts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* List Content */}
        {activeTab === 'reports' ? (
          reportsLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="small" color="#60A5FA" />
              <Text className="text-slate-400 text-xs mt-2">Loading pending reports...</Text>
            </View>
          ) : pendingReports.length === 0 ? (
            <View className="py-10 items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800/40">
              <CheckCircle size={28} color="#10B981" />
              <Text className="text-slate-300 text-xs font-semibold mt-2">All Grievances Triaged</Text>
              <Text className="text-slate-500 text-[11px] mt-0.5">No reports awaiting assignment</Text>
            </View>
          ) : (
            <View className="space-y-2.5">
              {pendingReports.slice(0, 3).map((report) => (
                <View
                  key={report.id}
                  className="p-3 bg-slate-950/80 border border-slate-800/90 rounded-xl hover:border-blue-500/40 transition-colors"
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <View className="flex-row items-center space-x-1.5">
                      <View className="px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded">
                        <Text className="text-blue-300 text-[10px] font-bold">
                          {report.reportCode}
                        </Text>
                      </View>
                      <Text className="text-slate-300 font-bold text-xs" numberOfLines={1}>
                        {report.issueType}
                      </Text>
                    </View>
                    <View className={`px-2 py-0.2 rounded border ${getAqiBgClass(report.aqiAtReportTime)}`}>
                      <Text className="text-[10px] font-black">{report.aqiAtReportTime} AQI</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center text-slate-400 text-[11px] mb-2 space-x-2">
                    <View className="flex-row items-center">
                      <MapPin size={11} color="#94A3B8" />
                      <Text className="text-slate-300 text-[11px] ml-1 font-medium" numberOfLines={1}>
                        {report.location}
                      </Text>
                    </View>
                    <Text className="text-slate-500 text-[11px]">• {report.timestamp}</Text>
                  </View>

                  {report.description && (
                    <Text className="text-slate-300 text-xs mb-2 leading-4" numberOfLines={2}>
                      {report.description}
                    </Text>
                  )}

                  <View className="flex-row items-center justify-between pt-2 border-t border-slate-800/80">
                    <TouchableOpacity
                      onPress={() => setSelectedReport(report)}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg flex-row items-center"
                    >
                      <Eye size={12} color="#94A3B8" />
                      <Text className="text-slate-300 text-[11px] font-medium ml-1">Inspect</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleAssignReport(report)}
                      className="px-2.5 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-lg flex-row items-center"
                    >
                      <UserCheck size={12} color="#93C5FD" />
                      <Text className="text-blue-200 text-[11px] font-bold ml-1">
                        Dispatch Team
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : alertsLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#EF4444" />
            <Text className="text-slate-400 text-xs mt-2">Checking critical anomalies...</Text>
          </View>
        ) : criticalAlerts.length === 0 ? (
          <View className="py-10 items-center justify-center bg-slate-950/40 rounded-xl border border-slate-800/40">
            <CheckCircle size={28} color="#10B981" />
            <Text className="text-slate-300 text-xs font-semibold mt-2">No Critical Spikes</Text>
            <Text className="text-slate-500 text-[11px] mt-0.5">Telemetry within standard limits</Text>
          </View>
        ) : (
          <View className="space-y-2.5">
            {criticalAlerts.slice(0, 3).map((alert) => (
              <View
                key={alert.id}
                className="p-3 bg-slate-950/80 border border-red-900/40 rounded-xl hover:border-red-500/50 transition-colors"
              >
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center space-x-1.5">
                    <View className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded">
                      <Text className="text-red-400 text-[10px] font-bold uppercase">Critical</Text>
                    </View>
                    <Text className="text-white font-bold text-xs" numberOfLines={1}>
                      {alert.location}
                    </Text>
                  </View>
                  <View className="px-2 py-0.2 bg-red-950/60 border border-red-800/80 rounded">
                    <Text className="text-red-300 text-[10px] font-extrabold">{alert.aqi} AQI</Text>
                  </View>
                </View>

                <Text className="text-slate-300 text-[11px] mb-2 leading-4" numberOfLines={2}>
                  {alert.predictionSummary || alert.probableSource}
                </Text>

                <View className="flex-row items-center justify-between pt-2 border-t border-slate-800/80">
                  <Text className="text-slate-500 text-[10px]">Sensor: {alert.sensorModel || alert.sensorId}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedAlert(alert)}
                    className="px-2.5 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 rounded-lg flex-row items-center"
                  >
                    <Eye size={12} color="#FCA5A5" />
                    <Text className="text-red-200 text-[11px] font-bold ml-1">Take Action</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Footer Quick Metric */}
      <View className="mt-4 pt-3 border-t border-slate-800/80 flex-row items-center justify-between">
        <Text className="text-slate-400 text-[11px]">
          Live Triage SLA: <Text className="text-emerald-400 font-semibold">&lt; 15 min response</Text>
        </Text>
        <TouchableOpacity
          onPress={() => {
            refetchReports();
            refetchAlerts();
          }}
        >
          <Text className="text-slate-500 hover:text-slate-300 text-[11px]">Refresh Queue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
