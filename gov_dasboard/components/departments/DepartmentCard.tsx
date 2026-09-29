import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, ChevronRight, Activity, CheckCircle2, Clock } from 'lucide-react-native';
import { Department } from '../../types';
import { getStatusBadge } from '../../utils';

interface DepartmentCardProps {
  department: Department;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({ department }) => {
  const router = useRouter();
  const statusClass = getStatusBadge(department.status);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/actions?departmentId=${department.id}` as any)}
      activeOpacity={0.85}
      className="p-4 bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 rounded-2xl mb-3 shadow-md transition-all group"
    >
      {/* Top Header: Dept Name, Code & Status */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-2.5 flex-1 mr-2">
          <View
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${department.colorHex}20` }}
          >
            <Building2 size={18} color={department.colorHex} />
          </View>
          <View className="ml-2 flex-1">
            <Text className="text-white font-bold text-sm" numberOfLines={1}>
              {department.name}
            </Text>
            <Text className="text-slate-400 text-xs">
              Code: <Text className="text-slate-200 font-semibold">{department.code}</Text> • Nodal: {department.headOfficer}
            </Text>
          </View>
        </View>

        <View className={`px-2.5 py-0.5 rounded border ${statusClass}`}>
          <Text className="text-xs font-semibold">{department.status}</Text>
        </View>
      </View>

      {/* Jurisdiction info */}
      <Text className="text-slate-400 text-xs mt-1 mb-3" numberOfLines={1}>
        Jurisdiction: <Text className="text-slate-300">{department.assignedJurisdiction}</Text>
      </Text>

      {/* Metrics Row: Active, Completed, Pending, Response Rate */}
      <View className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
        <View className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 items-center">
          <Text className="text-slate-400 text-[10px] uppercase font-semibold">Active</Text>
          <Text className="text-amber-400 font-black text-base">
            {department.activeActionsCount}
          </Text>
        </View>

        <View className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 items-center">
          <Text className="text-slate-400 text-[10px] uppercase font-semibold">Completed</Text>
          <Text className="text-emerald-400 font-black text-base">
            {department.completedActionsCount}
          </Text>
        </View>

        <View className="p-2 bg-slate-950/80 rounded-xl border border-slate-800 items-center">
          <Text className="text-slate-400 text-[10px] uppercase font-semibold">Response Rate</Text>
          <Text className="text-blue-400 font-black text-base">
            {department.responseRatePercent}%
          </Text>
        </View>
      </View>

      {/* Footer link */}
      <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-slate-800/60">
        <Text className="text-xs text-emerald-400 font-medium group-hover:underline">
          View Assigned Interventions
        </Text>
        <ChevronRight size={14} color="#34D399" />
      </View>
    </TouchableOpacity>
  );
};
