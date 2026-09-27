import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  AlertTriangle,
  FileText,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  Radio,
  Clock,
  MapPin,
  CheckCircle2,
} from 'lucide-react-native';
import { LiveFeedEvent } from '../../types';
import { getSeverityBadge } from '../../utils';

interface FeedItemProps {
  event: LiveFeedEvent;
}

export const FeedItem: React.FC<FeedItemProps> = ({ event }) => {
  const severityBadge = getSeverityBadge(event.severity);

  const getEventIcon = () => {
    switch (event.type) {
      case 'high_aqi_detected':
        return <AlertTriangle size={16} color="#EF4444" />;
      case 'citizen_report':
      case 'field_report':
        return <FileText size={16} color="#60A5FA" />;
      case 'action_approved':
      case 'action_assigned':
      case 'action_started':
        return <ShieldCheck size={16} color="#F59E0B" />;
      case 'action_completed':
      case 'pollution_improvement':
        return <CheckCircle2 size={16} color="#10B981" />;
      case 'hotspot_detected':
      case 'prediction_generated':
      default:
        return <Sparkles size={16} color="#C084FC" />;
    }
  };

  return (
    <View className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl mb-2.5 flex-row items-start space-x-3 hover:border-slate-700 transition-colors">
      <View className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 items-center justify-center mt-0.5">
        {getEventIcon()}
      </View>

      <View className="flex-1 ml-2.5">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xs font-bold" numberOfLines={1}>
            {event.title}
          </Text>
          <Text className="text-slate-500 text-[10px]">{event.timestamp}</Text>
        </View>

        <Text className="text-slate-300 text-xs mt-1 leading-4">
          {event.description}
        </Text>

        <View className="flex-row items-center justify-between mt-2 pt-1 border-t border-slate-900">
          <View className="flex-row items-center space-x-1">
            <MapPin size={11} color="#64748B" />
            <Text className="text-slate-400 text-[10px] ml-1">{event.location}</Text>
          </View>

          <View className={`px-1.5 py-0.2 rounded border ${severityBadge.bg}`}>
            <Text className="text-[9px] font-bold">{severityBadge.text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
