import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  ArrowRight,
  Eye,
  UserCheck,
  CheckCircle2,
  Filter,
  ShieldCheck,
} from 'lucide-react-native';
import { reportsService } from '../../services/reports';
import { PollutionReport, ReportType } from '../../types';
import { getStatusBadge, getAqiBgClass } from '../../utils';
import { useUIStore } from '../../store/useUIStore';
import { ReportCard } from './ReportCard';

interface ReportsTableProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export const ReportsTable: React.FC<ReportsTableProps> = ({
  maxItems = 5,
  showViewAll = true,
}) => {
  const router = useRouter();
  const { setSelectedReport, setAssignModalOpen, setAssignTargetEntity } = useUIStore();

  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const { data: reports, isLoading, isError, refetch } = useQuery({
    queryKey: ['recent-reports', statusFilter, typeFilter],
    queryFn: () =>
      reportsService.getReports({
        status: statusFilter,
        issueType: typeFilter,
      }),
  });

  const handleAssignClick = (report: PollutionReport) => {
    setAssignTargetEntity({
      type: 'report',
      id: report.id,
      title: `${report.reportCode} - ${report.issueType}`,
    });
    setAssignModalOpen(true);
  };

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 items-center justify-center">
            <FileText size={18} color="#60A5FA" />
          </View>
          <View className="ml-2.5">
            <Text className="text-white font-bold text-base">
              Field & Citizen Pollution Reports
            </Text>
            <Text className="text-slate-400 text-xs">
              Verified Public & Officer Grievance Management Docket
            </Text>
          </View>
        </View>

        {showViewAll && (
          <TouchableOpacity
            onPress={() => router.push('/reports')}
            className="flex-row items-center space-x-1 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700"
          >
            <Text className="text-emerald-400 text-xs font-semibold">
              View All ({reports?.length || 0})
            </Text>
            <ArrowRight size={13} color="#34D399" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <View className="flex-row items-center space-x-1.5 mb-4 flex-wrap gap-1">
        {['All', 'Pending', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
          <TouchableOpacity
            key={st}
            onPress={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
              statusFilter === st
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                statusFilter === st ? 'text-blue-300' : 'text-slate-400'
              }`}
            >
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading / Error / Empty States */}
      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="small" color="#60A5FA" />
          <Text className="text-slate-400 text-xs mt-2">Loading reports docket...</Text>
        </View>
      ) : isError ? (
        <View className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl items-center">
          <Text className="text-red-300 text-xs mb-2">Failed to load reports data</Text>
          <TouchableOpacity onPress={() => refetch()} className="px-3 py-1 bg-red-900/50 rounded-md">
            <Text className="text-xs text-red-200">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !reports || reports.length === 0 ? (
        <View className="py-10 items-center justify-center bg-slate-950/40 rounded-xl">
          <FileText size={32} color="#64748B" />
          <Text className="text-slate-400 text-xs mt-2">No reports matching current filter</Text>
        </View>
      ) : (
        <>
          {/* Desktop Table View */}
          <View className="hidden md:flex overflow-x-auto">
            <View className="w-full border border-slate-800 rounded-xl overflow-hidden">
              {/* Table Header */}
              <View className="bg-slate-950/80 px-4 py-3 flex-row items-center border-b border-slate-800">
                <Text className="w-1/6 text-xs font-bold text-slate-400 uppercase">Date & Time</Text>
                <Text className="w-1/4 text-xs font-bold text-slate-400 uppercase">Location & Zone</Text>
                <Text className="w-1/5 text-xs font-bold text-slate-400 uppercase">Issue Type</Text>
                <Text className="w-1/12 text-xs font-bold text-slate-400 uppercase">AQI</Text>
                <Text className="w-1/6 text-xs font-bold text-slate-400 uppercase">Status</Text>
                <Text className="w-1/6 text-xs font-bold text-slate-400 uppercase text-right">Actions</Text>
              </View>

              {/* Table Rows */}
              <View className="divide-y divide-slate-850">
                {reports.slice(0, maxItems).map((report) => {
                  const statusClass = getStatusBadge(report.status);
                  return (
                    <View
                      key={report.id}
                      className="px-4 py-3 flex-row items-center hover:bg-slate-800/40 transition-colors bg-slate-900/50"
                    >
                      <View className="w-1/6">
                        <Text className="text-white text-xs font-semibold">{report.timestamp}</Text>
                        <Text className="text-slate-500 text-[10px]">{report.reportCode}</Text>
                      </View>

                      <View className="w-1/4 pr-2">
                        <Text className="text-white text-xs font-medium" numberOfLines={1}>
                          {report.location}
                        </Text>
                        <Text className="text-slate-400 text-[10px]">{report.ward} • {report.zone}</Text>
                      </View>

                      <View className="w-1/5">
                        <Text className="text-slate-200 text-xs font-semibold">{report.issueType}</Text>
                        <Text className="text-slate-500 text-[10px]" numberOfLines={1}>
                          By {report.reporterName}
                        </Text>
                      </View>

                      <View className="w-1/12">
                        <View className={`px-2 py-0.5 rounded border inline-flex ${getAqiBgClass(report.aqiAtReportTime)}`}>
                          <Text className="text-[11px] font-bold">{report.aqiAtReportTime}</Text>
                        </View>
                      </View>

                      <View className="w-1/6">
                        <View className={`px-2 py-0.5 rounded border inline-flex ${statusClass}`}>
                          <Text className="text-[10px] font-semibold">{report.status}</Text>
                        </View>
                        {report.assignedDepartmentName && (
                          <Text className="text-slate-400 text-[10px] mt-0.5" numberOfLines={1}>
                            {report.assignedDepartmentName}
                          </Text>
                        )}
                      </View>

                      <View className="w-1/6 flex-row items-center justify-end space-x-1.5">
                        {report.status === 'Pending' && (
                          <TouchableOpacity
                            onPress={() => handleAssignClick(report)}
                            className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-lg flex-row items-center mr-1"
                          >
                            <UserCheck size={12} color="#60A5FA" />
                            <Text className="text-blue-300 text-[10px] font-bold ml-1">Assign</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          onPress={() => setSelectedReport(report)}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 rounded-lg flex-row items-center"
                        >
                          <Eye size={12} color="#34D399" />
                          <Text className="text-emerald-300 text-[10px] font-bold ml-1">Review</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Mobile Card List View */}
          <View className="md:hidden">
            {reports.slice(0, maxItems).map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </View>
        </>
      )}
    </View>
  );
};
