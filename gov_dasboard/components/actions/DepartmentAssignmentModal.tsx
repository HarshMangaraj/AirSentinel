import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, X, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { departmentsService } from '../../services/departments';
import { alertsService } from '../../services/alerts';
import { reportsService } from '../../services/reports';
import { Department } from '../../types';

export const DepartmentAssignmentModal: React.FC = () => {
  const {
    assignModalOpen,
    setAssignModalOpen,
    assignTargetEntity,
    setAssignTargetEntity,
  } = useUIStore();

  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [assignmentNote, setAssignmentNote] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: departments } = useQuery({
    queryKey: ['departments-list'],
    queryFn: departmentsService.getDepartments,
    enabled: assignModalOpen,
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDept) throw new Error('No department selected');

      if (assignTargetEntity?.type === 'alert') {
        await alertsService.assignDepartmentToAlert(
          assignTargetEntity.id,
          selectedDept.id,
          selectedDept.name,
          selectedDept.headOfficer,
          currentUser.name
        );
      } else if (assignTargetEntity?.type === 'report') {
        await reportsService.assignDepartmentToReport(
          assignTargetEntity.id,
          selectedDept.id,
          selectedDept.name,
          currentUser.name,
          assignmentNote
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['recent-reports'] });
      queryClient.invalidateQueries({ queryKey: ['departments-list'] });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setAssignModalOpen(false);
        setAssignTargetEntity(null);
        setSelectedDept(null);
        setAssignmentNote('');
      }, 1500);
    },
  });

  if (!assignModalOpen) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={assignModalOpen}
      onRequestClose={() => setAssignModalOpen(false)}
    >
      <View className="flex-1 bg-slate-950/80 backdrop-blur-md items-center justify-center p-4">
        <View className="w-full max-w-xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex-col">
          {/* Header */}
          <View className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 items-center justify-center">
                <Building2 size={18} color="#60A5FA" />
              </View>
              <View className="ml-2.5">
                <Text className="text-white font-bold text-base">
                  Assign Incident to Department
                </Text>
                <Text className="text-slate-400 text-xs">
                  {assignTargetEntity
                    ? `Assigning: ${assignTargetEntity.title}`
                    : 'Select responsible department & nodal officer'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setAssignModalOpen(false)}
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
                Assigned successfully to {selectedDept?.name}!
              </Text>
            </View>
          )}

          {/* Department Selection List */}
          <ScrollView className="flex-1 p-5 space-y-3" showsVerticalScrollIndicator>
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Responsible Agency
            </Text>

            {departments?.map((dept) => {
              const isSelected = selectedDept?.id === dept.id;
              return (
                <TouchableOpacity
                  key={dept.id}
                  onPress={() => setSelectedDept(dept)}
                  className={`p-3.5 rounded-xl border mb-2.5 flex-row items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-500/15 border-blue-500 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <View className="flex-row items-center space-x-3 flex-1 mr-2">
                    <View
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: `${dept.colorHex}20` }}
                    >
                      <Building2 size={18} color={dept.colorHex} />
                    </View>
                    <View className="ml-2.5 flex-1">
                      <Text className="text-white font-bold text-sm">
                        {dept.name} ({dept.code})
                      </Text>
                      <Text className="text-slate-400 text-xs" numberOfLines={1}>
                        Nodal: {dept.headOfficer} • {dept.assignedJurisdiction}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-emerald-400 text-xs font-bold">
                      {dept.responseRatePercent}% Resp.
                    </Text>
                    <Text className="text-slate-500 text-[10px]">
                      {dept.activeActionsCount} Active Actions
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Directive Instructions Note */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Authority Directive Instructions (Optional)
              </Text>
              <TextInput
                value={assignmentNote}
                onChangeText={setAssignmentNote}
                placeholder="e.g. Deploy water mist cannons within 30 minutes and submit photo verification..."
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs outline-none"
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-4 bg-slate-950/80 border-t border-slate-800 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setAssignModalOpen(false)}
              className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => assignMutation.mutate()}
              disabled={!selectedDept || assignMutation.isPending}
              className={`px-5 py-2 rounded-xl flex-row items-center space-x-2 ${
                selectedDept
                  ? 'bg-blue-600 hover:bg-blue-500'
                  : 'bg-slate-800 opacity-40'
              }`}
            >
              <UserCheck size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-1.5">
                {assignMutation.isPending ? 'Assigning...' : 'Confirm Department Assignment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
