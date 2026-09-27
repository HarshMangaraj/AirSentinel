import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  TrendingDown,
  Sparkles,
  Plus,
  ShieldCheck,
} from 'lucide-react-native';
import { actionsService } from '../../services/actions';
import { GovAction } from '../../types';
import { getStatusBadge } from '../../utils';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';

export default function ActionsScreen() {
  const { setVerificationModalOpen, setVerificationTargetAction, setEmergencyModalOpen } = useUIStore();
  const { hasPermission } = useAuthStore();

  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: actions, isLoading, isError, refetch } = useQuery({
    queryKey: ['actions-screen-list', statusFilter, priorityFilter, search],
    queryFn: () =>
      actionsService.getActions({
        status: statusFilter,
        priority: priorityFilter,
        search,
      }),
  });

  const handleOpenVerification = (action: GovAction) => {
    setVerificationTargetAction(action);
    setVerificationModalOpen(true);
  };

  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <View className="flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800">
          <View>
            <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Action Center & Impact Verification
            </Text>
            <Text className="text-slate-400 text-xs md:text-sm mt-1">
              Field Enforcement Tracking, Directives & Scientific Air Quality Verification
            </Text>
          </View>

          {hasPermission('emergency_response') && (
            <TouchableOpacity
              onPress={() => setEmergencyModalOpen(true)}
              className="mt-3 md:mt-0 px-4 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl flex-row items-center space-x-2"
            >
              <ShieldAlert size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-1.5">
                New Emergency Directive
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <View className="flex-row items-center bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex-1 max-w-md">
            <Search size={16} color="#64748B" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search action code, directive, location..."
              placeholderTextColor="#64748B"
              className="ml-2 text-white text-xs md:text-sm flex-1 outline-none bg-transparent"
            />
          </View>

          <View className="flex-row items-center space-x-2 flex-wrap gap-1">
            <View className="flex-row items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['All', 'Approved', 'In Progress', 'Completed', 'Verified'].map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg ${
                    statusFilter === st
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      statusFilter === st ? 'text-emerald-300' : 'text-slate-400'
                    }`}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Action Cards List */}
        {isLoading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#10B981" />
            <Text className="text-slate-400 text-sm mt-3 font-medium">Loading action directives...</Text>
          </View>
        ) : isError ? (
          <View className="p-6 bg-red-950/30 border border-red-800 rounded-2xl items-center">
            <Text className="text-red-300 font-semibold text-sm mb-2">Failed to load actions.</Text>
            <TouchableOpacity onPress={() => refetch()} className="px-4 py-2 bg-red-900 rounded-xl">
              <Text className="text-white text-xs font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : !actions || actions.length === 0 ? (
          <View className="py-16 items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <CheckCircle2 size={44} color="#10B981" />
            <Text className="text-white font-bold text-base mt-3">No Actions Found</Text>
          </View>
        ) : (
          <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((act) => {
              const statusClass = getStatusBadge(act.status);
              return (
                <View
                  key={act.id}
                  className="p-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-xl flex-col justify-between"
                >
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center space-x-2">
                        <Text className="text-emerald-400 font-bold text-xs">{act.actionCode}</Text>
                        <View className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          <Text className="text-[10px] text-slate-300 font-semibold">{act.type}</Text>
                        </View>
                      </View>
                      <View className={`px-2 py-0.5 rounded border ${statusClass}`}>
                        <Text className="text-[10px] font-bold">{act.status}</Text>
                      </View>
                    </View>

                    <Text className="text-white font-bold text-base mt-1">{act.title}</Text>
                    <Text className="text-slate-300 text-xs mt-1.5 leading-5">{act.description}</Text>

                    <View className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800">
                      <View>
                        <Text className="text-slate-500 text-[10px] uppercase">Department</Text>
                        <Text className="text-slate-200 text-xs font-semibold">{act.departmentName}</Text>
                      </View>
                      <View>
                        <Text className="text-slate-500 text-[10px] uppercase">Target Location</Text>
                        <Text className="text-slate-200 text-xs font-semibold">{act.targetLocation}</Text>
                      </View>
                    </View>

                    {/* Verification Result Preview if Verified */}
                    {act.verification && (
                      <View className="mt-3 p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl">
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center space-x-1">
                            <TrendingDown size={14} color="#34D399" />
                            <Text className="text-emerald-300 font-bold text-xs ml-1">
                              Impact Verified: {act.verification.percentageChangePM25}% PM2.5 Drop
                            </Text>
                          </View>
                          <Text className="text-slate-400 text-[10px]">
                            {act.verification.measurementDurationHours}h window
                          </Text>
                        </View>
                        <Text className="text-slate-300 text-[11px]">
                          Baseline AQI: {act.verification.baselineAQI} → Post AQI: {act.verification.postInterventionAQI}
                        </Text>
                        <Text className="text-slate-500 text-[10px] italic mt-1 leading-3">
                          {act.verification.disclaimer}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Actions Footer */}
                  <View className="mt-4 pt-3 border-t border-slate-800 flex-row items-center justify-between">
                    <Text className="text-slate-400 text-xs">
                      Assigned to: <Text className="text-white font-medium">{act.assignedTo}</Text>
                    </Text>

                    {act.status === 'Completed' && (
                      <TouchableOpacity
                        onPress={() => handleOpenVerification(act)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex-row items-center space-x-1"
                      >
                        <ShieldCheck size={14} color="#FFFFFF" />
                        <Text className="text-white font-bold text-xs ml-1">Verify Impact</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </DashboardLayout>
  );
}
