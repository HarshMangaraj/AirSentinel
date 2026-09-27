import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Building2, ArrowRight } from 'lucide-react-native';
import { departmentsService } from '../../services/departments';
import { DepartmentCard } from './DepartmentCard';

export const DepartmentStatus: React.FC = () => {
  const router = useRouter();

  const { data: departments, isLoading, isError, refetch } = useQuery({
    queryKey: ['departments-status-overview'],
    queryFn: departmentsService.getDepartments,
  });

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
            <Building2 size={18} color="#34D399" />
          </View>
          <View className="ml-2.5">
            <Text className="text-white font-bold text-base">
              Department Operations & Readiness
            </Text>
            <Text className="text-slate-400 text-xs">
              Live Inter-Agency Action Tracking & Enforcement Progress
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/departments')}
          className="flex-row items-center space-x-1 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700"
        >
          <Text className="text-emerald-400 text-xs font-semibold">
            All Departments ({departments?.length || 0})
          </Text>
          <ArrowRight size={13} color="#34D399" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="small" color="#10B981" />
          <Text className="text-slate-400 text-xs mt-2">Loading department statuses...</Text>
        </View>
      ) : isError ? (
        <View className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl items-center">
          <Text className="text-red-300 text-xs mb-2">Failed to load department statuses</Text>
          <TouchableOpacity onPress={() => refetch()} className="px-3 py-1 bg-red-900/50 rounded-md">
            <Text className="text-xs text-red-200">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !departments || departments.length === 0 ? (
        <View className="py-8 items-center justify-center">
          <Text className="text-slate-400 text-xs">No department data found</Text>
        </View>
      ) : (
        <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </View>
      )}
    </View>
  );
};
