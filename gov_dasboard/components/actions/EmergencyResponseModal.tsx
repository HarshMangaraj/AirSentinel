import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Flame, X, ShieldAlert, CheckCircle2, Siren, AlertTriangle } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { actionsService } from '../../services/actions';
import { liveFeedService } from '../../services/notifications';

export const EmergencyResponseModal: React.FC = () => {
  const { emergencyModalOpen, setEmergencyModalOpen } = useUIStore();
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [emergencyType, setEmergencyType] = useState<'Anti-Smog Gun' | 'Industrial Inspection' | 'Eviction & Sealing' | 'Construction Halt'>('Anti-Smog Gun');
  const [targetLocation, setTargetLocation] = useState('North Thermal Depot & Outer Corridor');
  const [justification, setJustification] = useState('AQI exceeded 380; hazardous PM2.5 particulate plume threatening residential sectors.');
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);

  const emergencyMutation = useMutation({
    mutationFn: async () => {
      const act = await actionsService.createEmergencyAction({
        title: `EMERGENCY DISPATCH: ${emergencyType}`,
        description: justification,
        type: emergencyType,
        priority: 'Critical',
        departmentId: 'dept-emer',
        departmentName: 'Emergency Response Squad',
        targetLocation,
        assignedTo: 'Rapid Emergency Task Force',
        approvedBy: currentUser.name,
        resourcesDeployed: [
          '4x Anti-Smog Water Cannons',
          '2x Mobile Monitoring Labs',
          'SPCB Flying Squad',
        ],
      });

      liveFeedService.addFeedEvent({
        type: 'action_started',
        title: `EMERGENCY DEPLOYMENT TRIGGERED`,
        description: `${emergencyType} deployed to ${targetLocation} by order of ${currentUser.name}`,
        location: targetLocation,
        timestamp: 'Just now',
        severity: 'Critical',
        relatedEntityId: act.id,
        relatedEntityType: 'action',
      });

      return act;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-actions'] });
      queryClient.invalidateQueries({ queryKey: ['live-feed'] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmergencyModalOpen(false);
        setConfirmed(false);
      }, 2000);
    },
  });

  if (!emergencyModalOpen) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={emergencyModalOpen}
      onRequestClose={() => setEmergencyModalOpen(false)}
    >
      <View className="flex-1 bg-red-950/40 backdrop-blur-md items-center justify-center p-4">
        <View className="w-full max-w-xl bg-slate-900 border border-red-600/80 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex-col">
          {/* Header */}
          <View className="px-5 py-4 border-b border-red-900/60 bg-red-950/90 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="w-9 h-9 rounded-xl bg-red-600 items-center justify-center shadow-lg shadow-red-900">
                <Siren size={20} color="#FFFFFF" />
              </View>
              <View className="ml-2.5">
                <Text className="text-white font-black text-base tracking-wide">
                  TRIGGER EMERGENCY RESPONSE
                </Text>
                <Text className="text-red-300 text-xs">
                  GRAP Stage-IV Statutory Emergency Protocol
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setEmergencyModalOpen(false)}
              className="p-1.5 rounded-lg bg-red-900/40"
            >
              <X size={16} color="#FCA5A5" />
            </TouchableOpacity>
          </View>

          {/* Success Banner */}
          {success && (
            <View className="mx-5 mt-4 p-3 bg-red-950/80 border border-red-500 rounded-xl flex-row items-center space-x-2">
              <CheckCircle2 size={20} color="#EF4444" />
              <Text className="text-white text-xs font-bold ml-2 flex-1">
                EMERGENCY TEAMS DISPATCHED! All sirens & mobile units synchronized.
              </Text>
            </View>
          )}

          {/* Form */}
          <ScrollView className="flex-1 p-5 space-y-4" showsVerticalScrollIndicator>
            {/* Warning Alert */}
            <View className="p-3 bg-red-950/40 border border-red-800/40 rounded-xl flex-row items-start space-x-2.5">
              <AlertTriangle size={18} color="#EF4444" className="mt-0.5" />
              <Text className="text-red-200 text-xs flex-1 ml-2 leading-4">
                Warning: Emergency response authorizes cross-agency requisition of water tankers, traffic stoppages, and plant shutdowns without notice.
              </Text>
            </View>

            {/* Response Type */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Emergency Protocol Type
              </Text>
              <View className="grid grid-cols-2 gap-2">
                {(['Anti-Smog Gun', 'Industrial Inspection', 'Eviction & Sealing', 'Construction Halt'] as const).map(
                  (type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setEmergencyType(type)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold ${
                        emergencyType === type
                          ? 'bg-red-500/20 border-red-500 text-red-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold ${
                          emergencyType === type ? 'text-red-300' : 'text-slate-400'
                        }`}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            {/* Target Location */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Hotspot Location
              </Text>
              <TextInput
                value={targetLocation}
                onChangeText={setTargetLocation}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none"
              />
            </View>

            {/* Emergency Justification */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Statutory Justification & Scope
              </Text>
              <TextInput
                value={justification}
                onChangeText={setJustification}
                multiline
                numberOfLines={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none"
              />
            </View>

            {/* Confirmation Checkbox */}
            <TouchableOpacity
              onPress={() => setConfirmed(!confirmed)}
              className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 flex-row items-center space-x-3"
            >
              <View
                className={`w-5 h-5 rounded border items-center justify-center ${
                  confirmed ? 'bg-red-600 border-red-500' : 'border-slate-700'
                }`}
              >
                {confirmed && <CheckCircle2 size={14} color="#FFFFFF" />}
              </View>
              <Text className="text-slate-200 text-xs font-medium flex-1 ml-2">
                I hereby confirm that immediate intervention is mandated under the Air (Prevention and Control of Pollution) Act.
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Footer */}
          <View className="p-4 bg-slate-950/90 border-t border-slate-800 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setEmergencyModalOpen(false)}
              className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => emergencyMutation.mutate()}
              disabled={!confirmed || emergencyMutation.isPending}
              className={`px-5 py-2.5 rounded-xl flex-row items-center space-x-2 ${
                confirmed
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-slate-800 opacity-40'
              }`}
            >
              <Flame size={16} color="#FFFFFF" />
              <Text className="text-white font-black text-xs ml-1.5">
                {emergencyMutation.isPending ? 'AUTHORIZING...' : 'CONFIRM & LAUNCH DISPATCH'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
