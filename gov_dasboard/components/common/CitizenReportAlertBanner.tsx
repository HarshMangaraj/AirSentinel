import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import { AlertTriangle, MapPin, Eye, X, BellRing, ShieldAlert, ArrowRight } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { reportsService } from '../../services/reports';
import { PollutionReport } from '../../types';

// Web Audio API chime generator for priority incident alert sound
function playAlertChime() {
  try {
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc1.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.15); // D6
      
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.6);
      osc2.stop(ctx.currentTime + 0.6);
    }
  } catch (e) {
    // Audio context may require initial user gesture
  }
}

export const CitizenReportAlertBanner: React.FC = () => {
  const { setSelectedReport } = useUIStore();
  const [activeAlert, setActiveAlert] = useState<PollutionReport | null>(null);
  const knownReportIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  // Poll for newly arriving citizen reports from mobile app
  useEffect(() => {
    let isMounted = true;

    async function checkForNewReports() {
      try {
        const reports = await reportsService.getReports();
        if (!isMounted || !reports || reports.length === 0) return;

        if (initialLoadRef.current) {
          // Initialize known IDs on first load
          reports.forEach((r) => knownReportIdsRef.current.add(r.id));
          initialLoadRef.current = false;
          return;
        }

        // Check for any newly added report
        const newReports = reports.filter((r) => !knownReportIdsRef.current.has(r.id));

        if (newReports.length > 0) {
          const newest = newReports[0];
          newReports.forEach((r) => knownReportIdsRef.current.add(r.id));

          // Trigger sound and visual alert banner
          playAlertChime();
          setActiveAlert(newest);

          // Animate banner slide down
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 6,
            tension: 40,
          }).start();
        }
      } catch (err) {
        console.warn('Polling reports error:', err);
      }
    }

    checkForNewReports();
    const interval = setInterval(checkForNewReports, 4000); // Poll every 4 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Pulsing animation for alert icon
  useEffect(() => {
    if (activeAlert) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [activeAlert]);

  const handleDismiss = () => {
    Animated.timing(slideAnim, {
      toValue: -120,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setActiveAlert(null));
  };

  const handleInspect = () => {
    if (activeAlert) {
      setSelectedReport(activeAlert);
      handleDismiss();
    }
  };

  if (!activeAlert) return null;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
      }}
      className="w-full mb-4 z-30"
    >
      <View className="bg-gradient-to-r from-red-950/95 via-rose-950/90 to-amber-950/90 border-2 border-red-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Glow edge highlight */}
        <View className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-400 to-rose-500" />

        <View className="flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Left badge & details */}
          <View className="flex-row items-center space-x-3 flex-1">
            <Animated.View
              style={{ transform: [{ scale: pulseAnim }] }}
              className="w-12 h-12 rounded-xl bg-red-600/30 border border-red-500 items-center justify-center shadow-lg"
            >
              <BellRing size={24} color="#EF4444" />
            </Animated.View>

            <View className="ml-3 flex-1">
              <View className="flex-row items-center space-x-2">
                <Text className="text-red-400 font-black text-xs uppercase tracking-widest bg-red-950 px-2 py-0.5 rounded border border-red-500/40">
                  CRITICAL CITIZEN INCIDENT INGESTED
                </Text>
                <Text className="text-slate-300 font-mono text-xs">
                  {activeAlert.reportCode}
                </Text>
              </View>

              <Text className="text-white font-extrabold text-base mt-0.5" numberOfLines={1}>
                {activeAlert.issueType}: {activeAlert.description}
              </Text>

              <View className="flex-row items-center text-xs text-slate-300 mt-1 space-x-3">
                <View className="flex-row items-center">
                  <MapPin size={12} color="#F87171" />
                  <Text className="text-slate-300 text-xs ml-1 font-medium">
                    {activeAlert.location}
                  </Text>
                </View>
                <Text className="text-slate-400 text-xs ml-3">
                  Reported by Citizen via Mobile App · Status: {activeAlert.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Action Buttons */}
          <View className="flex-row items-center space-x-2 self-end md:self-center mt-2 md:mt-0">
            <TouchableOpacity
              onPress={handleInspect}
              className="flex-row items-center bg-red-600 hover:bg-red-500 active:bg-red-700 px-4 py-2 rounded-xl border border-red-400/50 shadow-lg"
            >
              <Eye size={15} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-1.5">Review Incident</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDismiss}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 ml-1.5"
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};
