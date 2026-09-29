import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Search, Filter, RefreshCw, Radio, CheckCircle2 } from 'lucide-react-native';
import { alertsService } from '../../services/alerts';
import { AlertCard } from '../../components/alerts/AlertCard';

export default function AlertsScreen() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: alerts, isLoading, isError, refetch } = useQuery({
    queryKey: ['alerts-screen-list', severityFilter, statusFilter, search],
    queryFn: () =>
      alertsService.getAlerts({
        severity: severityFilter,
        status: statusFilter,
        search,
      }),
  });

  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <View className="flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800">
          <View>
            <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Alerts & Anomaly Incident Center
            </Text>
            <Text className="text-slate-400 text-xs md:text-sm mt-1">
              Automated CAAQMS Threshold Breaches, AI Source Attribution & Directive Dispatch
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => refetch()}
            className="mt-3 md:mt-0 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl flex-row items-center space-x-2"
          >
            <RefreshCw size={14} color="#34D399" />
            <Text className="text-emerald-300 text-xs font-semibold ml-1.5">Refresh Alerts</Text>
          </TouchableOpacity>
        </View>

        {/* Filters Bar */}
        <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <View className="flex-row items-center bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 flex-1 max-w-md">
            <Search size={16} color="#64748B" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search alert code, location, probable source..."
              placeholderTextColor="#64748B"
              className="ml-2 text-white text-xs md:text-sm flex-1 outline-none bg-transparent"
            />
          </View>

          {/* Severity & Status filter pills */}
          <View className="flex-row items-center space-x-2 flex-wrap gap-1">
            <View className="flex-row items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
                <TouchableOpacity
                  key={sev}
                  onPress={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-lg ${
                    severityFilter === sev
                      ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                      : 'hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      severityFilter === sev ? 'text-red-300' : 'text-slate-400'
                    }`}
                  >
                    {sev}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['All', 'New', 'Assigned', 'Resolved'].map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg ${
                    statusFilter === st
                      ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300'
                      : 'hover:bg-slate-900 text-slate-400'
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
          </View>
        </View>

        {/* Alerts List */}
        {isLoading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#EF4444" />
            <Text className="text-slate-400 text-sm mt-3 font-medium">
              Synchronizing active alerts from telemetry nodes...
            </Text>
          </View>
        ) : isError ? (
          <View className="p-6 bg-red-950/30 border border-red-800 rounded-2xl items-center">
            <Text className="text-red-300 font-semibold text-sm mb-2">
              Failed to query alerts database.
            </Text>
            <TouchableOpacity onPress={() => refetch()} className="px-4 py-2 bg-red-900 rounded-xl">
              <Text className="text-white text-xs font-bold">Retry Query</Text>
            </TouchableOpacity>
          </View>
        ) : !alerts || alerts.length === 0 ? (
          <View className="py-16 items-center justify-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <CheckCircle2 size={44} color="#10B981" />
            <Text className="text-white font-bold text-base mt-3">No Alerts Matching Criteria</Text>
            <Text className="text-slate-400 text-xs mt-1">
              All CAAQMS stations are within specified operational thresholds.
            </Text>
          </View>
        ) : (
          <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </View>
        )}
      </View>
    </DashboardLayout>
  );
}
