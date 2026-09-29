import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Filter, ShieldAlert } from 'lucide-react-native';
import { alertsService } from '../../services/alerts';
import { AlertCard } from './AlertCard';

interface AlertListProps {
  maxItems?: number;
  showViewAll?: boolean;
}

export const AlertList: React.FC<AlertListProps> = ({ maxItems = 4, showViewAll = true }) => {
  const router = useRouter();
  const [severityFilter, setSeverityFilter] = useState('All');

  const { data: alerts, isLoading, isError, refetch } = useQuery({
    queryKey: ['recent-alerts', severityFilter],
    queryFn: () => alertsService.getAlerts({ severity: severityFilter }),
  });

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 items-center justify-center">
            <AlertTriangle size={18} color="#EF4444" />
          </View>
          <View className="ml-2.5">
            <Text className="text-white font-bold text-base">Recent Pollution Alerts</Text>
            <Text className="text-slate-400 text-xs">Real-time Anomaly Detections & AI Attribution</Text>
          </View>
        </View>

        {showViewAll && (
          <TouchableOpacity
            onPress={() => router.push('/alerts')}
            className="flex-row items-center space-x-1 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700"
          >
            <Text className="text-emerald-400 text-xs font-semibold">View All ({alerts?.length || 0})</Text>
            <ArrowRight size={13} color="#34D399" />
          </TouchableOpacity>
        )}
      </View>

      {/* Severity Quick Filters */}
      <View className="flex-row items-center space-x-1.5 mb-3.5 flex-wrap gap-1">
        {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
          <TouchableOpacity
            key={sev}
            onPress={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg border text-xs font-semibold ${
              severityFilter === sev
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                severityFilter === sev ? 'text-emerald-300' : 'text-slate-400'
              }`}
            >
              {sev}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content State Handling */}
      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="small" color="#EF4444" />
          <Text className="text-slate-400 text-xs mt-2">Fetching active alerts...</Text>
        </View>
      ) : isError ? (
        <View className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl items-center">
          <Text className="text-red-300 text-xs mb-2">Failed to load alerts</Text>
          <TouchableOpacity onPress={() => refetch()} className="px-3 py-1 bg-red-900/50 rounded-md">
            <Text className="text-xs text-red-200">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !alerts || alerts.length === 0 ? (
        <View className="py-8 items-center justify-center bg-slate-950/40 rounded-xl">
          <ShieldAlert size={32} color="#64748B" />
          <Text className="text-slate-400 text-xs mt-2">No active alerts matching criteria</Text>
        </View>
      ) : (
        <View>
          {alerts.slice(0, maxItems).map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </View>
      )}
    </View>
  );
};
