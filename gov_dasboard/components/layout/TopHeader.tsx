import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import {
  Search,
  Bell,
  CloudSun,
  ChevronDown,
  ShieldCheck,
  Menu,
  Clock,
  Compass,
} from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { airQualityService } from '../../services/airQuality';
import { alertsService } from '../../services/alerts';
import { useQuery } from '@tanstack/react-query';

export const TopHeader: React.FC = () => {
  const {
    toggleSidebar,
    setNotificationsOpen,
    setUserMenuOpen,
    setSearchModalOpen,
  } = useUIStore();

  const { currentUser } = useAuthStore();
  const [dateTimeStr, setDateTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      setDateTimeStr(now.toLocaleDateString('en-IN', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: liveWeather } = useQuery({
    queryKey: ['header-live-weather'],
    queryFn: () => airQualityService.getWeather(),
    refetchInterval: 60000,
  });

  const { data: liveAlerts } = useQuery({
    queryKey: ['header-live-alerts'],
    queryFn: () => alertsService.getAlerts(),
    refetchInterval: 30000,
  });

  const unreadAlertsCount = liveAlerts?.length ?? 0;
  const weather = liveWeather || {
    temperature: 28,
    condition: 'Live Telemetry',
    windDirection: 'NW',
    windSpeed: 8,
    humidity: 55,
  };

  return (
    <View className="h-16 bg-slate-900 border-b border-slate-800/90 px-4 flex-row items-center justify-between z-20">
      {/* Left: Mobile Toggle & Global Search */}
      <View className="flex-row items-center space-x-3 flex-1 max-w-xl">
        <TouchableOpacity
          onPress={toggleSidebar}
          className="p-2 rounded-lg bg-slate-800 border border-slate-700 md:hidden mr-2"
        >
          <Menu size={18} color="#94A3B8" />
        </TouchableOpacity>

        {/* Global Search Bar */}
        <TouchableOpacity
          onPress={() => setSearchModalOpen(true)}
          activeOpacity={0.8}
          className="flex-1 flex-row items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 hover:border-emerald-500/50"
        >
          <Search size={16} color="#10B981" />
          <Text className="text-slate-400 text-xs md:text-sm ml-2.5 flex-1" numberOfLines={1}>
            Search location, sensor, report, department...
          </Text>
          <View className="hidden md:flex px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">
            <Text className="text-[10px] font-bold text-slate-400">Ctrl + K</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Right Controls: Weather, Clock, Notifications, User */}
      <View className="flex-row items-center space-x-2 md:space-x-4 ml-3">
        {/* Live Weather Widget */}
        <View className="hidden lg:flex flex-row items-center bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl space-x-2">
          <CloudSun size={18} color="#F59E0B" />
          <View className="ml-1.5">
            <Text className="text-xs font-semibold text-slate-200">
              {weather.temperature}°C • {weather.condition}
            </Text>
            <Text className="text-[10px] text-slate-400 flex-row items-center">
              Wind: {weather.windDirection} {weather.windSpeed} km/h • Humidity {weather.humidity}%
            </Text>
          </View>
        </View>

        {/* Real-time Clock */}
        <View className="hidden xl:flex flex-row items-center bg-slate-950/60 border border-slate-800/80 px-3 py-1.5 rounded-xl space-x-2">
          <Clock size={16} color="#34D399" />
          <Text className="text-xs font-mono font-medium text-emerald-300 ml-1.5">
            {dateTimeStr}
          </Text>
        </View>

        {/* Notifications Bell */}
        <TouchableOpacity
          onPress={() => setNotificationsOpen(true)}
          className="relative p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700"
        >
          <Bell size={18} color="#94A3B8" />
          {unreadAlertsCount > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-slate-900">
              <Text className="text-white text-[10px] font-bold">{unreadAlertsCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Profile / Role Trigger */}
        <TouchableOpacity
          onPress={() => setUserMenuOpen(true)}
          className="flex-row items-center bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 p-1.5 pr-3 rounded-xl space-x-2"
        >
          <View className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 items-center justify-center">
            <Text className="text-emerald-400 font-bold text-xs">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </Text>
          </View>

          <View className="hidden sm:flex ml-1.5 text-left">
            <Text className="text-white text-xs font-semibold leading-tight" numberOfLines={1}>
              {currentUser.name}
            </Text>
            <Text className="text-emerald-400 text-[10px] font-medium leading-tight" numberOfLines={1}>
              {currentUser.role}
            </Text>
          </View>

          <ChevronDown size={14} color="#94A3B8" className="ml-1" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
