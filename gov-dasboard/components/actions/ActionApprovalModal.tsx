import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, X, CheckCircle2, AlertTriangle, Building2, MapPin } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { actionsService } from '../../services/actions';
import { GovAction } from '../../types';

export const ActionApprovalModal: React.FC = () => {
  const { approveModalOpen, setApproveModalOpen } = useUIStore();
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: actions, isLoading } = useQuery({
    queryKey: ['actions-for-approval'],
    queryFn: () => actionsService.getActions({ status: 'Pending Approval' }),
    enabled: approveModalOpen,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => actionsService.approveAction(id, currentUser.name),
    onSuccess: (updatedAction) => {
      queryClient.invalidateQueries({ queryKey: ['actions-for-approval'] });
      queryClient.invalidateQueries({ queryKey: ['recent-actions'] });
      setSuccessMessage(`Directive ${updatedAction.actionCode} has been authorized and dispatched.`);
      setTimeout(() => {
        setSuccessMessage(null);
        setApproveModalOpen(false);
      }, 1500);
    },
  });

  if (!approveModalOpen) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={approveModalOpen}
      onRequestClose={() => setApproveModalOpen(false)}
    >
      <View className="flex-1 bg-slate-950/80 backdrop-blur-md items-center justify-center p-4">
        <View className="w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex-col">
          {/* Header */}
          <View className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center">
                <ShieldCheck size={18} color="#34D399" />
              </View>
              <View className="ml-2.5">
                <Text className="text-white font-bold text-base">
                  Authorize & Approve Field Actions
                </Text>
                <Text className="text-slate-400 text-xs">
                  Official Statutory Approval by {currentUser.name} ({currentUser.role})
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setApproveModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800"
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Success Banner */}
          {successMessage && (
            <View className="mx-5 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex-row items-center space-x-2">
              <CheckCircle2 size={18} color="#34D399" />
              <Text className="text-emerald-200 text-xs font-semibold ml-2 flex-1">
                {successMessage}
              </Text>
            </View>
          )}

          {/* List of Pending Actions */}
          <ScrollView className="flex-1 p-5 space-y-3" showsVerticalScrollIndicator>
            {isLoading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="small" color="#10B981" />
                <Text className="text-slate-400 text-xs mt-2">Loading pending actions...</Text>
              </View>
            ) : !actions || actions.length === 0 ? (
              <View className="py-10 items-center justify-center bg-slate-950/50 rounded-xl">
                <CheckCircle2 size={36} color="#10B981" />
                <Text className="text-white font-semibold text-sm mt-3">
                  All Field Actions Approved
                </Text>
                <Text className="text-slate-400 text-xs mt-1">
                  No actions currently awaiting officer sign-off.
                </Text>
              </View>
            ) : (
              actions.map((act) => {
                const isSelected = selectedActionId === act.id;
                return (
                  <TouchableOpacity
                    key={act.id}
                    onPress={() => setSelectedActionId(act.id)}
                    className={`p-4 rounded-xl border transition-all mb-3 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/60 shadow-lg'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <View className="flex-row items-center justify-between mb-1.5">
                      <View className="flex-row items-center space-x-2">
                        <Text className="text-emerald-400 font-bold text-xs">{act.actionCode}</Text>
                        <View className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                          <Text className="text-[10px] text-slate-300 font-semibold">{act.type}</Text>
                        </View>
                      </View>
                      <View className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40">
                        <Text className="text-[10px] text-amber-300 font-bold">{act.priority} Priority</Text>
                      </View>
                    </View>

                    <Text className="text-white font-bold text-sm">{act.title}</Text>
                    <Text className="text-slate-300 text-xs mt-1 leading-4">{act.description}</Text>

                    <View className="flex-row items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                      <View className="flex-row items-center space-x-1">
                        <Building2 size={12} color="#94A3B8" />
                        <Text className="text-slate-400 text-xs ml-1">{act.departmentName}</Text>
                      </View>

                      <View className="flex-row items-center space-x-1">
                        <MapPin size={12} color="#94A3B8" />
                        <Text className="text-slate-400 text-xs ml-1">{act.targetLocation}</Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View className="mt-3 pt-3 border-t border-slate-800 flex-row items-center justify-end">
                        <TouchableOpacity
                          onPress={() => approveMutation.mutate(act.id)}
                          disabled={approveMutation.isPending}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex-row items-center space-x-2"
                        >
                          <ShieldCheck size={16} color="#FFFFFF" />
                          <Text className="text-white font-bold text-xs ml-1.5">
                            {approveMutation.isPending ? 'Authorizing...' : 'Authorize Action Directive'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Footer note */}
          <View className="p-4 bg-slate-950/80 border-t border-slate-800 flex-row items-center justify-between">
            <Text className="text-slate-400 text-xs">
              Actions authorized here are synchronized live with field patrol units.
            </Text>
            <TouchableOpacity
              onPress={() => setApproveModalOpen(false)}
              className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
