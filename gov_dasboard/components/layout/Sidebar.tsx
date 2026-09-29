import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  LayoutDashboard,
  MapPin,
  BellRing,
  FileText,
  ShieldAlert,
  Building2,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wind,
  ShieldCheck,
} from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';

interface NavItem {
  name: string;
  route: string;
  icon: any;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { currentUser } = useAuthStore();

  const navItems: NavItem[] = [
    { name: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Map', route: '/live-map', icon: MapPin },
    { name: 'Alerts & Notifications', route: '/alerts', icon: BellRing, badge: 7 },
    { name: 'Reports', route: '/reports', icon: FileText, badge: 12 },
    { name: 'Action Center', route: '/actions', icon: ShieldAlert, badge: 9 },
    { name: 'Departments', route: '/departments', icon: Building2 },
    { name: 'Users & Permissions', route: '/users', icon: Users },
    { name: 'Settings', route: '/settings', icon: Settings },
  ];

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  return (
    <View
      style={{ width: sidebarOpen ? 260 : 78 }}
      className="h-full bg-slate-950 border-r border-slate-800/80 flex-col justify-between transition-all duration-300 z-30"
    >
      {/* Top Header / Branding */}
      <View>
        <View className="h-16 flex-row items-center justify-between px-4 border-b border-slate-800/80">
          <TouchableOpacity
            onPress={() => router.push('/dashboard')}
            className="flex-row items-center space-x-3 overflow-hidden"
          >
            <View className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 items-center justify-center shadow-lg shadow-emerald-950">
              <Wind size={22} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            {sidebarOpen && (
              <View className="ml-3">
                <Text className="text-white font-bold text-base tracking-wide flex-row items-center">
                  AirSentinel
                </Text>
                <Text className="text-emerald-400/90 text-[10px] font-medium tracking-wider uppercase">
                  Clean Air • Safe Future
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleSidebar}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/60 items-center justify-center hover:bg-slate-800"
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} color="#94A3B8" />
            ) : (
              <ChevronRight size={16} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>

        {/* Security / Authority Badge */}
        {sidebarOpen && (
          <View className="mx-3 mt-3 px-3 py-2 bg-emerald-950/40 border border-emerald-800/40 rounded-lg flex-row items-center space-x-2">
            <ShieldCheck size={14} color="#34D399" />
            <Text className="text-[11px] text-emerald-300 font-medium ml-1.5 flex-1">
              Gov Authority Command Center
            </Text>
          </View>
        )}

        {/* Navigation List */}
        <ScrollView className="mt-3 px-2" showsVerticalScrollIndicator={false}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.route ||
              (item.route !== '/dashboard' && pathname?.startsWith(item.route)) ||
              (item.route === '/dashboard' && pathname === '/');

            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => handleNavigate(item.route)}
                className={`flex-row items-center px-3 py-2.5 my-1 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-600/20 border border-emerald-500/40 shadow-sm'
                    : 'hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <View
                  className={`w-8 h-8 rounded-lg items-center justify-center ${
                    isActive ? 'bg-emerald-500/30' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    size={20}
                    color={isActive ? '#34D399' : '#94A3B8'}
                    strokeWidth={isActive ? 2.2 : 1.8}
                  />
                </View>

                {sidebarOpen && (
                  <View className="ml-3 flex-1 flex-row items-center justify-between">
                    <Text
                      className={`text-sm font-medium ${
                        isActive ? 'text-emerald-300 font-semibold' : 'text-slate-300'
                      }`}
                      numberOfLines={1}
                    >
                      {item.name}
                    </Text>

                    {item.badge !== undefined && item.badge > 0 && (
                      <View
                        className={`px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-emerald-500/30' : 'bg-slate-800'
                        }`}
                      >
                        <Text
                          className={`text-[11px] font-bold ${
                            isActive ? 'text-emerald-300' : 'text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bottom User / System Meta & Logout */}
      <View className="p-3 border-t border-slate-800/80 bg-slate-950/90">
        {sidebarOpen ? (
          <View className="flex-col">
            <View className="flex-row items-center space-x-2 mb-2 px-1">
              <View className="w-8 h-8 rounded-full bg-slate-800 border border-emerald-500/30 items-center justify-center">
                <Text className="text-emerald-400 font-bold text-xs">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </Text>
              </View>
              <View className="ml-2 flex-1">
                <Text className="text-slate-200 text-xs font-semibold" numberOfLines={1}>
                  {currentUser.name}
                </Text>
                <Text className="text-emerald-400 text-[10px] font-medium" numberOfLines={1}>
                  {currentUser.role}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/dashboard')}
              className="flex-row items-center px-3 py-2 rounded-lg bg-red-950/30 border border-red-900/40 hover:bg-red-900/40"
            >
              <LogOut size={16} color="#F87171" />
              <Text className="text-red-300 text-xs font-medium ml-2">Logout Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => router.push('/dashboard')}
            className="w-10 h-10 rounded-lg bg-red-950/40 border border-red-900/50 items-center justify-center self-center"
          >
            <LogOut size={18} color="#F87171" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
