import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { ShieldCheck, UserCheck, X, LogOut, Check } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types';

export const UserMenuDropdown: React.FC = () => {
  const { userMenuOpen, setUserMenuOpen } = useUIStore();
  const { currentUser, allUsers, setUserRole } = useAuthStore();

  if (!userMenuOpen) return null;

  const handleSelectRole = (role: UserRole) => {
    setUserRole(role);
    setUserMenuOpen(false);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={userMenuOpen}
      onRequestClose={() => setUserMenuOpen(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setUserMenuOpen(false)}
        className="flex-1 bg-slate-950/60 backdrop-blur-sm items-end justify-start pt-16 pr-4 md:pr-12"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="w-full max-w-sm bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* User Profile Header */}
          <View className="p-4 bg-slate-950/90 border-b border-slate-800">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-3">
                <View className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 items-center justify-center shadow">
                  <Text className="text-white font-bold text-base">
                    {currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-white font-bold text-sm" numberOfLines={1}>
                    {currentUser.name}
                  </Text>
                  <Text className="text-emerald-400 text-xs font-semibold">
                    {currentUser.role}
                  </Text>
                  <Text className="text-slate-400 text-[11px] mt-0.5">
                    Badge: {currentUser.badgeNumber}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setUserMenuOpen(false)}
                className="p-1 rounded-lg bg-slate-800"
              >
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View className="mt-3 px-2.5 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700 flex-row items-center justify-between">
              <Text className="text-slate-400 text-[11px]">Jurisdiction:</Text>
              <Text className="text-slate-200 text-[11px] font-medium flex-1 text-right ml-2" numberOfLines={1}>
                {currentUser.jurisdiction}
              </Text>
            </View>
          </View>

          {/* Role Switcher Section (Mandatory for Government Multi-Agency Demo) */}
          <View className="p-3 border-b border-slate-800">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex-row items-center">
              <UserCheck size={14} color="#10B981" /> Switch Authority Role
            </Text>
            <ScrollView className="max-h-60" showsVerticalScrollIndicator>
              {allUsers.map((user) => {
                const isCurrent = user.role === currentUser.role;
                return (
                  <TouchableOpacity
                    key={user.id}
                    onPress={() => handleSelectRole(user.role)}
                    className={`p-2.5 rounded-xl mb-1 flex-row items-center justify-between border ${
                      isCurrent
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <View className="flex-1 mr-2">
                      <Text
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-emerald-300' : 'text-slate-200'
                        }`}
                      >
                        {user.role}
                      </Text>
                      <Text className="text-slate-400 text-[11px]" numberOfLines={1}>
                        {user.name} ({user.departmentName})
                      </Text>
                    </View>
                    {isCurrent && <Check size={16} color="#34D399" />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Footer Actions */}
          <View className="p-3 bg-slate-950/80">
            <TouchableOpacity
              onPress={() => setUserMenuOpen(false)}
              className="w-full py-2 bg-red-950/40 border border-red-800/40 rounded-xl flex-row items-center justify-center space-x-2"
            >
              <LogOut size={14} color="#F87171" />
              <Text className="text-red-300 font-semibold text-xs ml-1.5">
                Sign Out of Command Center
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
