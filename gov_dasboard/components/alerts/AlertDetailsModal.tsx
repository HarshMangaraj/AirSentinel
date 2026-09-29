import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import {
  AlertTriangle,
  X,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Radio,
  FileText,
  Activity,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getSeverityBadge, getStatusBadge, getAqiBgClass } from '../../utils';
import { alertsService } from '../../services/alerts';

export const AlertDetailsModal: React.FC = () => {
  const {
    selectedAlert,
    setSelectedAlert,
    setAssignModalOpen,
    setAssignTargetEntity,
    setApproveModalOpen,
    setSelectedReport,
  } = useUIStore();

  const { currentUser, hasPermission } = useAuthStore();

  if (!selectedAlert) return null;

  const severity = getSeverityBadge(selectedAlert.severity);
  const statusClass = getStatusBadge(selectedAlert.status);

  const handleAssignClick = () => {
    setAssignTargetEntity({
      type: 'alert',
      id: selectedAlert.id,
      title: `${selectedAlert.alertCode} - ${selectedAlert.location}`,
    });
    setAssignModalOpen(true);
  };

  const handleResolveAlert = async () => {
    await alertsService.updateAlertStatus(
      selectedAlert.id,
      'Resolved',
      currentUser.name,
      'Resolved after government verification of baseline air quality recovery.'
    );
    setSelectedAlert({
      ...selectedAlert,
      status: 'Resolved',
    });
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={!!selectedAlert}
      onRequestClose={() => setSelectedAlert(null)}
    >
      <View className="flex-1 bg-slate-950/80 backdrop-blur-md items-center justify-center p-3 md:p-6">
        <View className="w-full max-w-4xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex-col">
          {/* Header */}
          <View className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 items-center justify-center">
                <AlertTriangle size={20} color="#EF4444" />
              </View>
              <View className="ml-3">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-white font-extrabold text-base">
                    {selectedAlert.alertCode}
                  </Text>
                  <View className={`px-2 py-0.5 rounded border ${severity.bg}`}>
                    <Text className="text-xs font-bold">{severity.text} Severity</Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded border ${statusClass}`}>
                    <Text className="text-xs font-bold">{selectedAlert.status}</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Detected at {selectedAlert.timestamp} • Sensor: {selectedAlert.sensorModel}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedAlert(null)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700"
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView className="flex-1 p-5 space-y-5" showsVerticalScrollIndicator>
            {/* Top Stat Banner: Metric & Location */}
            <View className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-medium">Incident Location</Text>
                <Text className="text-white font-bold text-base mt-1">
                  {selectedAlert.location}
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">{selectedAlert.zone}</Text>
              </View>

              <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-medium">Pollution Metric Spike</Text>
                <Text className="text-red-400 font-black text-2xl mt-0.5">
                  {selectedAlert.value} <Text className="text-sm font-semibold">{selectedAlert.unit}</Text>
                </Text>
                <Text className="text-slate-500 text-xs">Statutory Limit: {selectedAlert.threshold} {selectedAlert.unit}</Text>
              </View>

              <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-medium">Recorded Station AQI</Text>
                <Text className="text-amber-400 font-black text-2xl mt-0.5">
                  {selectedAlert.aqi}
                </Text>
                <Text className="text-slate-500 text-xs">Very Poor / Severe Risk</Text>
              </View>
            </View>

            {/* AI Source Attribution & Predictive Analysis */}
            <View className="p-4 bg-gradient-to-br from-purple-950/30 to-slate-950/80 border border-purple-800/40 rounded-2xl mb-4">
              <View className="flex-row items-center justify-between pb-2 border-b border-purple-900/40 mb-3">
                <View className="flex-row items-center space-x-2">
                  <Sparkles size={16} color="#C084FC" />
                  <Text className="text-purple-200 font-bold text-sm ml-2">
                    AI Source Attribution & Dispersion Forecast
                  </Text>
                </View>
                <View className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded-full">
                  <Text className="text-purple-300 text-xs font-bold">
                    Confidence: {selectedAlert.confidenceScore}%
                  </Text>
                </View>
              </View>

              <View className="space-y-2">
                <View>
                  <Text className="text-slate-400 text-xs font-medium">Probable Pollution Source:</Text>
                  <Text className="text-white font-semibold text-sm mt-0.5">
                    {selectedAlert.probableSource}
                  </Text>
                </View>

                <View className="pt-2">
                  <Text className="text-slate-400 text-xs font-medium">Atmospheric Prediction:</Text>
                  <Text className="text-purple-200 text-xs mt-0.5 leading-5">
                    {selectedAlert.predictionSummary}
                  </Text>
                </View>

                <View className="pt-2 bg-purple-950/40 p-3 rounded-xl border border-purple-800/30 mt-2">
                  <Text className="text-emerald-300 font-bold text-xs">
                    Recommended Authority Action:
                  </Text>
                  <Text className="text-slate-200 text-xs mt-1 font-medium">
                    {selectedAlert.recommendedAction}
                  </Text>
                </View>
              </View>
            </View>

            {/* Assignment & Department Coordination */}
            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
              <View className="flex-row items-center justify-between pb-2 border-b border-slate-800 mb-3">
                <View className="flex-row items-center space-x-2">
                  <Building2 size={16} color="#34D399" />
                  <Text className="text-white font-bold text-sm ml-2">
                    Department Coordination & Assignment
                  </Text>
                </View>
              </View>

              <View className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <View className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <Text className="text-slate-400 text-xs">Assigned Department</Text>
                  <Text className="text-white font-bold text-sm mt-0.5">
                    {selectedAlert.assignedDepartmentName || 'Unassigned (Action Required)'}
                  </Text>
                </View>

                <View className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <Text className="text-slate-400 text-xs">Designated Officer</Text>
                  <Text className="text-emerald-400 font-bold text-sm mt-0.5">
                    {selectedAlert.assignedOfficer || 'Pending Designation'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Audit & Activity Log */}
            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
              <View className="flex-row items-center space-x-2 pb-2 border-b border-slate-800 mb-3">
                <Activity size={16} color="#60A5FA" />
                <Text className="text-white font-bold text-sm ml-2">
                  Audit Trail & Activity Log
                </Text>
              </View>

              <View className="space-y-3">
                {selectedAlert.activityHistory.map((item, idx) => (
                  <View key={item.id || idx} className="flex-row items-start space-x-3 pb-2 border-b border-slate-900">
                    <View className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    <View className="flex-1 ml-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-white text-xs font-bold">{item.action}</Text>
                        <Text className="text-slate-500 text-[11px]">{item.timestamp}</Text>
                      </View>
                      <Text className="text-slate-400 text-[11px] mt-0.5">By {item.actor}</Text>
                      {item.note && (
                        <Text className="text-slate-300 text-xs italic mt-1 bg-slate-900/60 p-2 rounded">
                          "{item.note}"
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Workflow Action Footer */}
          <View className="p-4 border-t border-slate-800 bg-slate-950/90 flex-row flex-wrap items-center justify-between gap-2">
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity
                onPress={handleAssignClick}
                disabled={!hasPermission('assign_actions')}
                className={`px-4 py-2.5 rounded-xl border flex-row items-center space-x-1.5 ${
                  hasPermission('assign_actions')
                    ? 'bg-blue-600/20 border-blue-500/50 hover:bg-blue-600/30'
                    : 'bg-slate-800 border-slate-700 opacity-50'
                }`}
              >
                <UserCheck size={16} color="#60A5FA" />
                <Text className="text-blue-200 text-xs font-bold ml-1.5">
                  Assign Department
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setApproveModalOpen(true)}
                disabled={!hasPermission('approve_actions')}
                className={`px-4 py-2.5 rounded-xl border flex-row items-center space-x-1.5 ${
                  hasPermission('approve_actions')
                    ? 'bg-emerald-600/20 border-emerald-500/50 hover:bg-emerald-600/30'
                    : 'bg-slate-800 border-slate-700 opacity-50'
                }`}
              >
                <ShieldCheck size={16} color="#34D399" />
                <Text className="text-emerald-200 text-xs font-bold ml-1.5">
                  Approve Response Action
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center space-x-2">
              {selectedAlert.status !== 'Resolved' && (
                <TouchableOpacity
                  onPress={handleResolveAlert}
                  className="px-4 py-2.5 bg-emerald-600 rounded-xl hover:bg-emerald-500 flex-row items-center space-x-1.5"
                >
                  <CheckCircle2 size={16} color="#FFFFFF" />
                  <Text className="text-white text-xs font-bold ml-1.5">
                    Mark Resolved
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
