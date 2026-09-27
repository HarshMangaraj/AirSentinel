import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Bell, X, AlertTriangle, FileText, ShieldAlert, CheckCheck, Circle } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { MOCK_NOTIFICATIONS } from '../../mock/data';
import { getSeverityBadge } from '../../utils';

export const NotificationPanel: React.FC = () => {
  const { notificationsOpen, setNotificationsOpen, setSelectedAlert } = useUIStore();
  const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const markItemRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  if (!notificationsOpen) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={notificationsOpen}
      onRequestClose={() => setNotificationsOpen(false)}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setNotificationsOpen(false)}
        className="flex-1 bg-slate-950/60 backdrop-blur-sm items-end justify-start pt-16 pr-4 md:pr-8"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="w-full max-w-md bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <View className="px-4 py-3.5 border-b border-slate-800 bg-slate-950/80 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <Bell size={18} color="#10B981" />
              <Text className="text-white font-bold text-sm ml-2">Command Center Alerts</Text>
              {unreadCount > 0 && (
                <View className="px-2 py-0.5 bg-red-500 rounded-full ml-2">
                  <Text className="text-white text-[10px] font-bold">{unreadCount} New</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center space-x-2">
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={markAllRead}
                  className="flex-row items-center px-2 py-1 bg-slate-800 rounded border border-slate-700 mr-2"
                >
                  <CheckCheck size={12} color="#34D399" />
                  <Text className="text-emerald-400 text-[11px] font-medium ml-1">Mark Read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setNotificationsOpen(false)}
                className="p-1 rounded bg-slate-800"
              >
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* List */}
          <ScrollView className="max-h-96 p-3 divide-y divide-slate-800/60" showsVerticalScrollIndicator>
            {notifications.map((item) => {
              const badge = getSeverityBadge(item.severity);
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => markItemRead(item.id)}
                  className={`p-3 rounded-xl mb-1 flex-row items-start space-x-3 transition-all ${
                    !item.isRead ? 'bg-slate-800/80 border border-slate-700/80' : 'bg-slate-900/40'
                  }`}
                >
                  <View className="mt-0.5">
                    {item.type === 'alert' && <AlertTriangle size={18} color="#EF4444" />}
                    {item.type === 'action' && <ShieldAlert size={18} color="#10B981" />}
                    {item.type === 'report' && <FileText size={18} color="#3B82F6" />}
                  </View>

                  <View className="flex-1 ml-2.5">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-white text-xs font-bold" numberOfLines={1}>
                        {item.title}
                      </Text>
                      {!item.isRead && (
                        <View className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </View>
                    <Text className="text-slate-300 text-xs mt-1 leading-4">
                      {item.message}
                    </Text>
                    <View className="flex-row items-center justify-between mt-2">
                      <Text className="text-slate-500 text-[10px]">{item.timestamp}</Text>
                      <View className={`px-1.5 py-0.5 rounded border ${badge.bg}`}>
                        <Text className="text-[10px] font-semibold">{badge.text}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View className="p-3 bg-slate-950/80 border-t border-slate-800 text-center">
            <Text className="text-center text-xs text-slate-400">
              Live updates pushed via AirSentinel Telemetry Engine
            </Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
