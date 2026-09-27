import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Image } from 'react-native';
import {
  FileText,
  X,
  MapPin,
  Clock,
  Sparkles,
  Building2,
  Radio,
  CloudSun,
  UserCheck,
  CheckCircle2,
  ShieldCheck,
  Camera,
  Satellite,
  Activity,
} from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { getStatusBadge, getAqiBgClass } from '../../utils';
import { reportsService } from '../../services/reports';

export const ReportDetailsModal: React.FC = () => {
  const {
    selectedReport,
    setSelectedReport,
    setAssignModalOpen,
    setAssignTargetEntity,
  } = useUIStore();

  const { currentUser } = useAuthStore();

  if (!selectedReport) return null;

  const statusClass = getStatusBadge(selectedReport.status);

  const handleAssign = () => {
    setAssignTargetEntity({
      type: 'report',
      id: selectedReport.id,
      title: `${selectedReport.reportCode} - ${selectedReport.issueType}`,
    });
    setAssignModalOpen(true);
  };

  const handleUpdateStatus = async (newStatus: 'In Progress' | 'Resolved' | 'Rejected') => {
    const updated = await reportsService.updateReportStatus(
      selectedReport.id,
      newStatus,
      currentUser.name,
      `Action taken by ${currentUser.name} (${currentUser.role})`
    );
    setSelectedReport(updated);
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={!!selectedReport}
      onRequestClose={() => setSelectedReport(null)}
    >
      <View className="flex-1 bg-slate-950/80 backdrop-blur-md items-center justify-center p-3 md:p-6">
        <View className="w-full max-w-4xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex-col">
          {/* Header */}
          <View className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-3">
              <View className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 items-center justify-center">
                <FileText size={20} color="#60A5FA" />
              </View>
              <View className="ml-3">
                <View className="flex-row items-center space-x-2">
                  <Text className="text-white font-extrabold text-base">
                    {selectedReport.reportCode}
                  </Text>
                  <View className={`px-2 py-0.5 rounded border ${statusClass}`}>
                    <Text className="text-xs font-bold">{selectedReport.status}</Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded border ${getAqiBgClass(selectedReport.aqiAtReportTime)}`}>
                    <Text className="text-xs font-bold">AQI {selectedReport.aqiAtReportTime}</Text>
                  </View>
                </View>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Logged on {selectedReport.timestamp} • Type: {selectedReport.issueType}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedReport(null)}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700"
            >
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          <ScrollView className="flex-1 p-5 space-y-5" showsVerticalScrollIndicator>
            {/* Top Grid: Location, Reporter & GPS */}
            <View className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
              <View className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-medium">Location Details</Text>
                <Text className="text-white font-bold text-sm mt-1">{selectedReport.location}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {selectedReport.ward} • {selectedReport.zone}
                </Text>
                <Text className="text-slate-500 text-[10px] mt-1">
                  GPS: {selectedReport.coordinates.latitude.toFixed(4)}° N, {selectedReport.coordinates.longitude.toFixed(4)}° E
                </Text>
              </View>

              <View className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-medium">Reporter Profile</Text>
                <Text className="text-white font-bold text-sm mt-1">{selectedReport.reporterName}</Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  {selectedReport.reporterContact || 'Contact verified in portal'}
                </Text>
                <View className="mt-1 px-2 py-0.5 bg-slate-900 rounded border border-slate-800 inline-flex self-start">
                  <Text className="text-[10px] text-emerald-400 font-semibold">
                    {selectedReport.isCitizenReport ? 'Citizen Portal Submission' : 'Official Field Officer'}
                  </Text>
                </View>
              </View>

              <View className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-medium">Weather Telemetry Snapshot</Text>
                <Text className="text-white font-bold text-sm mt-1">
                  {selectedReport.weatherSnapshot.temperature}°C • Humidity {selectedReport.weatherSnapshot.humidity}%
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Wind: {selectedReport.weatherSnapshot.windSpeed} km/h ({selectedReport.weatherSnapshot.windDirection})
                </Text>
              </View>
            </View>

            {/* Description & Evidence Preview */}
            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Incident Description & Statement
              </Text>
              <Text className="text-slate-200 text-sm leading-5">
                {selectedReport.description}
              </Text>

              {/* Photo & Satellite Previews */}
              <View className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-850">
                {selectedReport.photoUrl && (
                  <View className="bg-slate-900 rounded-xl p-2.5 border border-slate-800">
                    <View className="flex-row items-center space-x-1.5 mb-2">
                      <Camera size={14} color="#60A5FA" />
                      <Text className="text-slate-300 text-xs font-semibold ml-1">
                        Field Ground Photo Evidence
                      </Text>
                    </View>
                    <Image
                      source={{ uri: selectedReport.photoUrl }}
                      className="w-full h-36 rounded-lg bg-slate-950"
                      resizeMode="cover"
                    />
                  </View>
                )}

                {selectedReport.satelliteEvidenceUrl && (
                  <View className="bg-slate-900 rounded-xl p-2.5 border border-slate-800">
                    <View className="flex-row items-center space-x-1.5 mb-2">
                      <Satellite size={14} color="#C084FC" />
                      <Text className="text-slate-300 text-xs font-semibold ml-1">
                        Sentinel-5P Thermal Satellite Evidence
                      </Text>
                    </View>
                    <Image
                      source={{ uri: selectedReport.satelliteEvidenceUrl }}
                      className="w-full h-36 rounded-lg bg-slate-950"
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </View>

            {/* AI Source Classification */}
            <View className="p-4 bg-gradient-to-br from-purple-950/30 to-slate-950/80 border border-purple-800/40 rounded-2xl mb-4">
              <View className="flex-row items-center justify-between pb-2 border-b border-purple-900/40 mb-3">
                <View className="flex-row items-center space-x-2">
                  <Sparkles size={16} color="#C084FC" />
                  <Text className="text-purple-200 font-bold text-sm ml-2">
                    AI Automated Classification & Source Attribution
                  </Text>
                </View>
                <View className="px-2.5 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded-full">
                  <Text className="text-purple-300 text-xs font-bold">
                    Confidence: {selectedReport.confidenceScore}%
                  </Text>
                </View>
              </View>

              <View className="space-y-2">
                <View>
                  <Text className="text-slate-400 text-xs">AI Incident Class:</Text>
                  <Text className="text-white font-semibold text-sm mt-0.5">
                    {selectedReport.aiClassification}
                  </Text>
                </View>

                <View className="pt-2">
                  <Text className="text-slate-400 text-xs">Probable Source Attribution:</Text>
                  <Text className="text-purple-200 text-xs mt-0.5 font-medium">
                    {selectedReport.probableSource}
                  </Text>
                </View>
              </View>
            </View>

            {/* Nearby Sensors Correlation */}
            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
              <View className="flex-row items-center space-x-2 pb-2 border-b border-slate-800 mb-3">
                <Radio size={16} color="#10B981" />
                <Text className="text-white font-bold text-sm ml-2">
                  Nearby CAAQMS Sensor Telemetry
                </Text>
              </View>

              <View className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedReport.nearbySensors.map((s) => (
                  <View key={s.sensorId} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex-row items-center justify-between">
                    <View>
                      <Text className="text-white text-xs font-semibold">{s.name}</Text>
                      <Text className="text-slate-400 text-[11px]">{s.distanceKm} km away</Text>
                    </View>
                    <View className={`px-2 py-0.5 rounded border ${getAqiBgClass(s.currentAQI)}`}>
                      <Text className="text-xs font-bold">AQI {s.currentAQI}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Action History */}
            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl mb-4">
              <View className="flex-row items-center space-x-2 pb-2 border-b border-slate-800 mb-3">
                <Activity size={16} color="#34D399" />
                <Text className="text-white font-bold text-sm ml-2">
                  Grievance Progress History
                </Text>
              </View>

              <View className="space-y-2">
                {selectedReport.history.map((h, idx) => (
                  <View key={h.id || idx} className="flex-row items-start space-x-2 pb-2 border-b border-slate-900">
                    <View className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    <View className="flex-1 ml-2">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-white text-xs font-bold">{h.status}</Text>
                        <Text className="text-slate-500 text-[11px]">{h.timestamp}</Text>
                      </View>
                      <Text className="text-slate-400 text-[11px] mt-0.5">By {h.actor}</Text>
                      {h.notes && <Text className="text-slate-300 text-xs italic mt-0.5">"{h.notes}"</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="p-4 border-t border-slate-800 bg-slate-950/90 flex-row flex-wrap items-center justify-between gap-2">
            <View className="flex-row items-center space-x-2">
              {selectedReport.status === 'Pending' && (
                <TouchableOpacity
                  onPress={handleAssign}
                  className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/50 rounded-xl flex-row items-center"
                >
                  <UserCheck size={16} color="#60A5FA" />
                  <Text className="text-blue-200 text-xs font-bold ml-1.5">
                    Assign Responsible Dept
                  </Text>
                </TouchableOpacity>
              )}

              {selectedReport.status !== 'In Progress' && selectedReport.status !== 'Resolved' && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus('In Progress')}
                  className="px-4 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-xl flex-row items-center"
                >
                  <Clock size={16} color="#C084FC" />
                  <Text className="text-purple-200 text-xs font-bold ml-1.5">
                    Mark In Progress
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row items-center space-x-2">
              {selectedReport.status !== 'Resolved' && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus('Resolved')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex-row items-center"
                >
                  <CheckCircle2 size={16} color="#FFFFFF" />
                  <Text className="text-white text-xs font-bold ml-1.5">
                    Resolve Grievance
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
