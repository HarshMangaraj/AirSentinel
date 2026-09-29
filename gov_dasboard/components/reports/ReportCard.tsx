import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FileText, Eye, UserCheck, CheckCircle2, Clock, MapPin, AlertTriangle } from 'lucide-react-native';
import { PollutionReport } from '../../types';
import { getStatusBadge, getAqiBgClass } from '../../utils';
import { useUIStore } from '../../store/useUIStore';

interface ReportCardProps {
  report: PollutionReport;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { setSelectedReport, setAssignModalOpen, setAssignTargetEntity } = useUIStore();
  const statusClass = getStatusBadge(report.status);

  const handleAssign = (e: any) => {
    setAssignTargetEntity({
      type: 'report',
      id: report.id,
      title: `${report.reportCode} - ${report.issueType}`,
    });
    setAssignModalOpen(true);
  };

  return (
    <View className="p-3.5 bg-slate-900/90 border border-slate-800/90 rounded-2xl mb-3 shadow-md">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-2">
          <Text className="text-emerald-400 font-bold text-xs">{report.reportCode}</Text>
          <View className={`px-2 py-0.5 rounded border ${statusClass}`}>
            <Text className="text-[10px] font-semibold">{report.status}</Text>
          </View>
          <View className={`px-2 py-0.5 rounded border ${getAqiBgClass(report.aqiAtReportTime)}`}>
            <Text className="text-[10px] font-bold">AQI {report.aqiAtReportTime}</Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-1">
          <Clock size={12} color="#64748B" />
          <Text className="text-slate-400 text-[11px] ml-1">{report.timestamp}</Text>
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-white font-bold text-sm">
          {report.issueType} • {report.location}
        </Text>
        <Text className="text-slate-300 text-xs mt-1" numberOfLines={2}>
          {report.description}
        </Text>
        <Text className="text-slate-500 text-[11px] mt-1">
          Reported by: <Text className="text-slate-300">{report.reporterName}</Text>
        </Text>
      </View>

      <View className="flex-row items-center justify-between pt-2 border-t border-slate-800/80">
        <Text className="text-slate-400 text-xs">
          Dept: <Text className="text-slate-200 font-medium">{report.assignedDepartmentName || 'Unassigned'}</Text>
        </Text>

        <View className="flex-row items-center space-x-2">
          {report.status === 'Pending' && (
            <TouchableOpacity
              onPress={handleAssign}
              className="px-2.5 py-1 bg-blue-600/20 border border-blue-500/40 rounded-lg flex-row items-center mr-2"
            >
              <UserCheck size={12} color="#60A5FA" />
              <Text className="text-blue-300 text-[11px] font-semibold ml-1">Assign</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setSelectedReport(report)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex-row items-center"
          >
            <Eye size={12} color="#34D399" />
            <Text className="text-emerald-300 text-[11px] font-semibold ml-1">Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
