import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuthStore } from '../../store/useAuthStore';
import { Users, ShieldCheck, Check, Key, UserCheck, Lock } from 'lucide-react-native';
import { UserRole, Permission } from '../../types';

export default function UsersScreen() {
  const { currentUser, allUsers, setUserRole } = useAuthStore();

  const allPermissionsList: { key: Permission; label: string; description: string }[] = [
    { key: 'view_dashboard', label: 'View Command Dashboard', description: 'Access aggregate CAAQMS overview & KPIs' },
    { key: 'view_map', label: 'Geospatial Radar & Map', description: 'Access live environmental GIS layers' },
    { key: 'view_alerts', label: 'Inspect Alerts & Hotspots', description: 'View real-time anomaly breaches' },
    { key: 'manage_alerts', label: 'Manage & Resolve Alerts', description: 'Modify alert states & dismiss false alarms' },
    { key: 'view_reports', label: 'View Grievance Reports', description: 'Access public & officer evidence tickets' },
    { key: 'review_reports', label: 'Review & Verify Reports', description: 'Validate citizen claims & AI classification' },
    { key: 'assign_actions', label: 'Assign Inter-Agency Directives', description: 'Delegate incidents to specialized departments' },
    { key: 'approve_actions', label: 'Authorize Enforcement Actions', description: 'Sign-off on Section 31A notices & closures' },
    { key: 'execute_actions', label: 'Execute Field Interventions', description: 'Dispatch water mist trucks & squad units' },
    { key: 'emergency_response', label: 'Trigger GRAP Stage-IV Emergency', description: 'Initiate citywide emergency shutdowns' },
    { key: 'generate_reports', label: 'Export Statutory Audits', description: 'Compile legal environmental compliance reports' },
    { key: 'manage_departments', label: 'Administer Department Matrix', description: 'Configure nodal officer designations' },
    { key: 'manage_users', label: 'Manage Roles & Security Keys', description: 'Provision authority accounts and badges' },
    { key: 'system_settings', label: 'System & Ingestion Config', description: 'Tune sensor calibration & ML models' },
  ];

  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        <View className="pb-4 border-b border-slate-800">
          <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Users, Roles & Statutory Permission Matrix
          </Text>
          <Text className="text-slate-400 text-xs md:text-sm mt-1">
            Role-Based Access Control (RBAC) & Authority Delegation Protocol
          </Text>
        </View>

        {/* Current User Role Switcher Banner */}
        <View className="p-5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl shadow-xl flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <View className="flex-row items-center space-x-3">
            <View className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 items-center justify-center">
              <UserCheck size={24} color="#34D399" />
            </View>
            <View className="ml-3">
              <Text className="text-white font-bold text-lg">
                Active Session: {currentUser.name}
              </Text>
              <Text className="text-emerald-400 text-xs font-semibold">
                {currentUser.role} • Badge: {currentUser.badgeNumber}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                Jurisdiction: {currentUser.jurisdiction}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center space-x-2">
            <View className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <Text className="text-emerald-300 text-xs font-bold">
                {currentUser.permissions.length} Active Privileges
              </Text>
            </View>
          </View>
        </View>

        {/* User Directory & Switch Role Buttons */}
        <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <Text className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Simulate Government Officer Role Session
          </Text>

          <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {allUsers.map((user) => {
              const isCurrent = user.role === currentUser.role;
              return (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => setUserRole(user.role)}
                  className={`p-4 rounded-xl border flex-col justify-between transition-all ${
                    isCurrent
                      ? 'bg-emerald-500/15 border-emerald-500 shadow-lg'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <View>
                    <View className="flex-row items-center justify-between mb-2">
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isCurrent ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      >
                        {user.role}
                      </Text>
                      {isCurrent && <Check size={16} color="#34D399" />}
                    </View>
                    <Text className="text-white font-bold text-sm">{user.name}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">{user.departmentName}</Text>
                  </View>

                  <View className="mt-3 pt-2 border-t border-slate-800/80">
                    <Text className="text-[11px] text-slate-500 font-mono">
                      Badge: {user.badgeNumber}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Granular Permission Matrix */}
        <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
          <Text className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
            Statutory Privileges for Current Role: {currentUser.role}
          </Text>

          <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allPermissionsList.map((perm) => {
              const hasAccess = currentUser.permissions.includes(perm.key);
              return (
                <View
                  key={perm.key}
                  className={`p-3.5 rounded-xl border flex-row items-start space-x-3 ${
                    hasAccess
                      ? 'bg-slate-950/80 border-emerald-900/40'
                      : 'bg-slate-950/30 border-slate-900 opacity-40'
                  }`}
                >
                  <View
                    className={`w-7 h-7 rounded-lg items-center justify-center mt-0.5 ${
                      hasAccess ? 'bg-emerald-500/20' : 'bg-slate-800'
                    }`}
                  >
                    {hasAccess ? (
                      <Check size={15} color="#34D399" />
                    ) : (
                      <Lock size={14} color="#64748B" />
                    )}
                  </View>

                  <View className="flex-1 ml-2">
                    <Text
                      className={`text-xs font-bold ${
                        hasAccess ? 'text-white' : 'text-slate-500 line-through'
                      }`}
                    >
                      {perm.label}
                    </Text>
                    <Text className="text-slate-400 text-[11px] mt-0.5 leading-4">
                      {perm.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </DashboardLayout>
  );
}
