import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  Flame,
  Zap,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';

export const QuickActions: React.FC = () => {
  const {
    setApproveModalOpen,
    setAssignModalOpen,
    setReportGeneratorModalOpen,
    setEmergencyModalOpen,
  } = useUIStore();

  const { hasPermission } = useAuthStore();

  const actions = [
    {
      id: 'approve',
      title: 'Approve Action',
      description: 'Review and authorize pending field interventions.',
      icon: CheckCircle2,
      color: '#10B981',
      bgClass: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60',
      iconBg: 'bg-emerald-500/20',
      permission: 'approve_actions' as const,
      onClick: () => setApproveModalOpen(true),
    },
    {
      id: 'assign',
      title: 'Assign Department',
      description: 'Delegate pollution incident to specialized nodal agency.',
      icon: Building2,
      color: '#3B82F6',
      bgClass: 'bg-blue-500/10 border-blue-500/30 hover:border-blue-500/60',
      iconBg: 'bg-blue-500/20',
      permission: 'assign_actions' as const,
      onClick: () => setAssignModalOpen(true),
    },
    {
      id: 'report',
      title: 'Generate Report',
      description: 'Compile official statutory environmental audit document.',
      icon: FileSpreadsheet,
      color: '#A855F7',
      bgClass: 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/60',
      iconBg: 'bg-purple-500/20',
      permission: 'generate_reports' as const,
      onClick: () => setReportGeneratorModalOpen(true),
    },
    {
      id: 'emergency',
      title: 'Emergency Response',
      description: 'Trigger immediate GRAP Stage-IV emergency protocols.',
      icon: Flame,
      color: '#EF4444',
      bgClass: 'bg-red-500/10 border-red-500/30 hover:border-red-500/60',
      iconBg: 'bg-red-500/20',
      permission: 'emergency_response' as const,
      onClick: () => setEmergencyModalOpen(true),
    },
  ];

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 items-center justify-center">
            <Zap size={18} color="#F59E0B" />
          </View>
          <View className="ml-2.5">
            <Text className="text-white font-bold text-base">Quick Authority Directives</Text>
            <Text className="text-slate-400 text-xs">
              Direct Command & Inter-Agency Execution Workflows
            </Text>
          </View>
        </View>
      </View>

      {/* Grid of 4 Action Cards */}
      <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          const allowed = hasPermission(act.permission);

          return (
            <TouchableOpacity
              key={act.id}
              onPress={act.onClick}
              disabled={!allowed}
              className={`p-4 rounded-xl border flex-col justify-between transition-all group ${
                act.bgClass
              } ${!allowed ? 'opacity-40' : ''}`}
            >
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <View className={`w-9 h-9 rounded-xl items-center justify-center ${act.iconBg}`}>
                    <Icon size={18} color={act.color} />
                  </View>
                  {!allowed && (
                    <View className="px-1.5 py-0.5 bg-slate-800 rounded">
                      <Text className="text-[10px] text-slate-400 font-semibold">Restricted</Text>
                    </View>
                  )}
                </View>

                <Text className="text-white font-bold text-sm mt-1">{act.title}</Text>
                <Text className="text-slate-300 text-xs mt-1 leading-4">{act.description}</Text>
              </View>

              <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                <Text
                  className="text-xs font-semibold group-hover:underline"
                  style={{ color: act.color }}
                >
                  Execute Directive
                </Text>
                <ArrowRight size={13} color={act.color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
