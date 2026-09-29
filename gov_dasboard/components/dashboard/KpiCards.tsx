import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Radio, AlertTriangle, FileText, ShieldCheck, ArrowUpRight, TrendingUp, CheckCircle2 } from 'lucide-react-native';
import { airQualityService } from '../../services/airQuality';

export const KpiCards: React.FC = () => {
  const router = useRouter();

  const { data: kpiData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: airQualityService.getKPIData,
  });

  if (isLoading) {
    return (
      <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((n) => (
          <View key={n} className="h-28 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 items-center justify-center">
            <ActivityIndicator size="small" color="#10B981" />
          </View>
        ))}
      </View>
    );
  }

  if (isError || !kpiData) {
    return (
      <View className="p-4 bg-red-950/30 border border-red-800/40 rounded-2xl mb-6 flex-row items-center justify-between">
        <Text className="text-red-300 text-sm">Failed to fetch KPI data.</Text>
        <TouchableOpacity onPress={() => refetch()} className="px-3 py-1 bg-red-900/40 rounded-lg">
          <Text className="text-red-200 text-xs font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cards = [
    {
      title: 'Total Sensors',
      value: kpiData.totalSensors.value,
      subtext: `${kpiData.totalSensors.onlineCount} Online • ${kpiData.totalSensors.offlineCount} Offline`,
      icon: Radio,
      color: '#10B981',
      bgGradient: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      route: '/live-map',
    },
    {
      title: 'Active Alerts',
      value: kpiData.activeAlerts.value,
      subtext: `${kpiData.activeAlerts.newCount} New • ${kpiData.activeAlerts.criticalCount} Critical`,
      icon: AlertTriangle,
      color: '#EF4444',
      bgGradient: 'from-red-500/10 to-orange-500/5',
      borderColor: 'border-red-500/30',
      route: '/alerts',
    },
    {
      title: 'Reports (24h)',
      value: kpiData.reports24h.value,
      subtext: `${kpiData.reports24h.pendingReviewCount ?? kpiData.reports24h.pendingCount ?? 0} Pending Review • +${kpiData.reports24h.percentageChange24h}% today`,
      icon: FileText,
      color: '#3B82F6',
      bgGradient: 'from-blue-500/10 to-indigo-500/5',
      borderColor: 'border-blue-500/30',
      route: '/reports',
    },
    {
      title: 'Actions Taken',
      value: kpiData.actionsTaken.value,
      subtext: `${kpiData.actionsTaken.completedCount} Completed • ${kpiData.actionsTaken.inProgressCount} In Progress`,
      icon: ShieldCheck,
      color: '#A855F7',
      bgGradient: 'from-purple-500/10 to-violet-500/5',
      borderColor: 'border-purple-500/30',
      route: '/actions',
    },
  ];

  return (
    <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => router.push(card.route as any)}
            className={`p-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border ${card.borderColor} rounded-2xl shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-transform`}
          >
            {/* Top ambient glow bar */}
            <View
              className="absolute top-0 left-0 right-0 h-1 opacity-70"
              style={{ backgroundColor: card.color }}
            />

            <View className="flex-row items-center justify-between">
              <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                {card.title}
              </Text>
              <View
                className="w-8 h-8 rounded-xl items-center justify-center border"
                style={{
                  backgroundColor: `${card.color}15`,
                  borderColor: `${card.color}35`,
                }}
              >
                <Icon size={16} color={card.color} strokeWidth={2.2} />
              </View>
            </View>

            <View className="mt-2.5">
              <Text className="text-white text-3xl font-black tracking-tight">
                {card.value}
              </Text>
              <View className="flex-row items-center mt-1.5 space-x-1">
                {card.title === 'Reports (24h)' ? (
                  <TrendingUp size={12} color="#60A5FA" />
                ) : (
                  <CheckCircle2 size={12} color={card.color} />
                )}
                <Text className="text-slate-300 text-xs ml-1 font-medium" numberOfLines={1}>
                  {card.subtext}
                </Text>
              </View>
            </View>

            <View className="absolute bottom-2.5 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={14} color="#94A3B8" />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
