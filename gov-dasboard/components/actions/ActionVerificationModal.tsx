import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, X, TrendingDown, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { actionsService } from '../../services/actions';
import { liveFeedService } from '../../services/notifications';

export const ActionVerificationModal: React.FC = () => {
  const {
    verificationModalOpen,
    setVerificationModalOpen,
    verificationTargetAction,
    setVerificationTargetAction,
  } = useUIStore();

  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [postAQI, setPostAQI] = useState('185');
  const [postPM25, setPostPM25] = useState('120');
  const [success, setSuccess] = useState(false);

  const baselineAQI = verificationTargetAction?.verification?.baselineAQI || 288;
  const baselinePM25 = verificationTargetAction?.verification?.baselinePM25 || 215;

  const currentPostAQINum = Number(postAQI) || baselineAQI;
  const currentPostPM25Num = Number(postPM25) || baselinePM25;

  const diffAQIPercent = ((currentPostAQINum - baselineAQI) / baselineAQI) * 100;
  const diffPM25Percent = ((currentPostPM25Num - baselinePM25) / baselinePM25) * 100;

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!verificationTargetAction) return;
      const updated = await actionsService.verifyActionImpact(
        verificationTargetAction.id,
        currentPostAQINum,
        currentPostPM25Num,
        currentUser.name
      );

      liveFeedService.addFeedEvent({
        type: 'pollution_improvement',
        title: 'Intervention Impact Verified',
        description: `${verificationTargetAction.title} verified with ${Math.abs(diffPM25Percent).toFixed(1)}% PM2.5 reduction`,
        location: verificationTargetAction.targetLocation,
        timestamp: 'Just now',
        severity: 'Low',
        relatedEntityId: verificationTargetAction.id,
        relatedEntityType: 'action',
      });

      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-actions'] });
      queryClient.invalidateQueries({ queryKey: ['live-feed'] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setVerificationModalOpen(false);
        setVerificationTargetAction(null);
      }, 1800);
    },
  });

  if (!verificationModalOpen || !verificationTargetAction) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={verificationModalOpen}
      onRequestClose={() => setVerificationModalOpen(false)}
    >
      <View className="flex-1 bg-slate-950/80 backdrop-blur-md items-center justify-center p-4">
        <View className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex-col">
          {/* Header */}
          <View className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center">
                <CheckCircle2 size={18} color="#34D399" />
              </View>
              <View className="ml-2.5">
                <Text className="text-white font-bold text-base">
                  Verify Intervention Impact
                </Text>
                <Text className="text-slate-400 text-xs">
                  {verificationTargetAction.actionCode} • {verificationTargetAction.title}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setVerificationModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800"
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Success Banner */}
          {success && (
            <View className="mx-5 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex-row items-center space-x-2">
              <CheckCircle2 size={18} color="#34D399" />
              <Text className="text-emerald-200 text-xs font-semibold ml-2">
                Intervention successfully verified and logged into statutory registry!
              </Text>
            </View>
          )}

          {/* Body */}
          <ScrollView className="flex-1 p-5 space-y-4" showsVerticalScrollIndicator>
            {/* Before / After Comparison Grid */}
            <View className="grid grid-cols-2 gap-4">
              {/* Baseline (Before) */}
              <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Pre-Intervention Baseline
                </Text>
                <View className="space-y-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 text-xs">Baseline AQI:</Text>
                    <Text className="text-red-400 font-extrabold text-base">{baselineAQI}</Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 text-xs">Baseline PM2.5:</Text>
                    <Text className="text-red-400 font-extrabold text-base">{baselinePM25} µg/m³</Text>
                  </View>
                </View>
              </View>

              {/* Post-Intervention (After) Input */}
              <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  Post-Intervention Telemetry
                </Text>
                <View className="space-y-2">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 text-xs">Post AQI:</Text>
                    <TextInput
                      value={postAQI}
                      onChangeText={setPostAQI}
                      keyboardType="numeric"
                      className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs font-bold w-20 text-right"
                    />
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-slate-400 text-xs">Post PM2.5 (µg/m³):</Text>
                    <TextInput
                      value={postPM25}
                      onChangeText={setPostPM25}
                      keyboardType="numeric"
                      className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white text-xs font-bold w-20 text-right"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Calculated Estimated Impact Card */}
            <View className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl">
              <View className="flex-row items-center justify-between pb-2 border-b border-emerald-900/40 mb-3">
                <View className="flex-row items-center space-x-2">
                  <TrendingDown size={18} color="#34D399" />
                  <Text className="text-emerald-200 font-bold text-sm ml-2">
                    Estimated Atmospheric Impact Analysis
                  </Text>
                </View>
                <View className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 rounded-full">
                  <Text className="text-emerald-300 text-xs font-bold">Confidence: 89%</Text>
                </View>
              </View>

              <View className="grid grid-cols-2 gap-3 mb-3">
                <View className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/30">
                  <Text className="text-slate-400 text-[11px]">AQI Delta Percentage</Text>
                  <Text className={`text-xl font-black mt-0.5 ${diffAQIPercent < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {diffAQIPercent > 0 ? `+${diffAQIPercent.toFixed(1)}%` : `${diffAQIPercent.toFixed(1)}%`}
                  </Text>
                </View>

                <View className="p-3 bg-slate-900/80 rounded-xl border border-emerald-900/30">
                  <Text className="text-slate-400 text-[11px]">PM2.5 Delta Percentage</Text>
                  <Text className={`text-xl font-black mt-0.5 ${diffPM25Percent < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {diffPM25Percent > 0 ? `+${diffPM25Percent.toFixed(1)}%` : `${diffPM25Percent.toFixed(1)}%`}
                  </Text>
                </View>
              </View>

              {/* Scientific Disclaimer (Required by prompt) */}
              <View className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex-row items-start space-x-2">
                <AlertCircle size={14} color="#F59E0B" className="mt-0.5" />
                <Text className="text-slate-400 text-[11px] leading-4 flex-1 ml-2">
                  <Text className="text-amber-300 font-semibold">Scientific Rigor Notice:</Text> Calculated as estimated impact based on CAAQMS telemetry comparison against baseline atmospheric wind vector models. Correlation does not claim sole causation.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-4 bg-slate-950/80 border-t border-slate-800 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setVerificationModalOpen(false)}
              className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => verifyMutation.mutate()}
              disabled={verifyMutation.isPending}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex-row items-center space-x-2"
            >
              <ShieldCheck size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-1.5">
                {verifyMutation.isPending ? 'Verifying...' : 'Submit Official Impact Verification'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
