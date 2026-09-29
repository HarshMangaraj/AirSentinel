import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Activity, RefreshCw, Radio } from 'lucide-react-native';
import { liveFeedService } from '../../services/notifications';
import { FeedItem } from './FeedItem';

interface LiveFeedProps {
  maxItems?: number;
}

export const LiveFeed: React.FC<LiveFeedProps> = ({ maxItems = 6 }) => {
  const [filterType, setFilterType] = useState('All');

  const { data: events, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['live-feed'],
    queryFn: liveFeedService.getLiveFeed,
    refetchInterval: 15000, // Automatic live polling
  });

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    if (filterType === 'All') return events;
    if (filterType === 'Alerts') return events.filter((e) => e.type === 'high_aqi_detected' || e.type === 'hotspot_detected');
    if (filterType === 'Actions') return events.filter((e) => e.type.startsWith('action_') || e.type === 'pollution_improvement');
    if (filterType === 'Reports') return events.filter((e) => e.type.includes('report'));
    return events;
  }, [events, filterType]);

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl">
      {/* Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <View className="flex-row items-center space-x-2">
          <View className="relative">
            <View className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
              <Activity size={18} color="#34D399" />
            </View>
            <View className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
          </View>
          <View className="ml-2.5">
            <Text className="text-white font-bold text-base">Live Activity & Command Feed</Text>
            <Text className="text-slate-400 text-xs">Real-time Environmental Event Stream</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => refetch()}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700"
        >
          <RefreshCw size={14} color={isFetching ? '#10B981' : '#94A3B8'} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row items-center space-x-1 mb-3 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
        {['All', 'Alerts', 'Actions', 'Reports'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilterType(tab)}
            className={`px-3 py-1 rounded-lg flex-1 items-center ${
              filterType === tab
                ? 'bg-emerald-600/30 border border-emerald-500/40'
                : 'hover:bg-slate-900'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filterType === tab ? 'text-emerald-300' : 'text-slate-400'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Events List */}
      {isLoading ? (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="small" color="#10B981" />
          <Text className="text-slate-400 text-xs mt-2">Connecting to telemetry stream...</Text>
        </View>
      ) : isError ? (
        <View className="p-4 bg-red-950/30 border border-red-800/40 rounded-xl items-center">
          <Text className="text-red-300 text-xs mb-2">Failed to load live feed</Text>
          <TouchableOpacity onPress={() => refetch()} className="px-3 py-1 bg-red-900/50 rounded">
            <Text className="text-xs text-red-200">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View className="py-8 items-center justify-center bg-slate-950/40 rounded-xl">
          <Text className="text-slate-400 text-xs">No events matching filter</Text>
        </View>
      ) : (
        <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
          {filteredEvents.slice(0, maxItems).map((evt) => (
            <FeedItem key={evt.id} event={evt} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};
