import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Switch } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Settings, Sliders, Database, Cpu, ShieldCheck, CheckCircle2, Server, Save } from 'lucide-react-native';

export default function SettingsScreen() {
  const [fastApiEndpoint, setFastApiEndpoint] = useState('http://localhost:8000/api/v1');
  const [postGisEndpoint, setPostGisEndpoint] = useState('postgresql://airsentinel_admin@localhost:5432/airsentinel_spatial');
  const [autoMistingThreshold, setAutoMistingThreshold] = useState('250');
  const [enableAiAttribution, setEnableAiAttribution] = useState(true);
  const [enableSatelliteCorroboration, setEnableSatelliteCorroboration] = useState(true);
  const [grapStage4AutoLock, setGrapStage4AutoLock] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        <View className="pb-4 border-b border-slate-800">
          <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Command Center Settings & Ingestion Architecture
          </Text>
          <Text className="text-slate-400 text-xs md:text-sm mt-1">
            FastAPI Backend Bridge, PostGIS Geospatial Pipeline, Sensor Calibration & Threshold Engine
          </Text>
        </View>

        {saved && (
          <View className="p-4 bg-emerald-950/60 border border-emerald-500 rounded-2xl flex-row items-center space-x-2">
            <CheckCircle2 size={20} color="#34D399" />
            <Text className="text-emerald-200 text-sm font-bold ml-2">
              System configuration saved & synchronized across telemetry instances.
            </Text>
          </View>
        )}

        {/* Backend Connectivity Layer */}
        <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <View className="flex-row items-center space-x-2 pb-3 border-b border-slate-800">
            <Server size={18} color="#10B981" />
            <Text className="text-white font-bold text-base ml-2">
              Backend Service / Repository Abstraction Endpoints
            </Text>
          </View>

          <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                FastAPI Gateway URI
              </Text>
              <TextInput
                value={fastApiEndpoint}
                onChangeText={setFastApiEndpoint}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none"
              />
              <Text className="text-slate-500 text-[11px] mt-1">
                Currently running in Mock Repository Mode with clean service isolation.
              </Text>
            </View>

            <View>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                PostgreSQL / PostGIS Spatial Database URI
              </Text>
              <TextInput
                value={postGisEndpoint}
                onChangeText={setPostGisEndpoint}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs font-mono outline-none"
              />
              <Text className="text-slate-500 text-[11px] mt-1">
                Stores CAAQMS continuous spatial vectors and municipal ward boundaries.
              </Text>
            </View>
          </View>
        </View>

        {/* Automated Intelligence & Protocol Thresholds */}
        <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <View className="flex-row items-center space-x-2 pb-3 border-b border-slate-800">
            <Cpu size={18} color="#C084FC" />
            <Text className="text-white font-bold text-base ml-2">
              AI Prediction Engine & Automated Protocol Thresholds
            </Text>
          </View>

          <View className="space-y-3">
            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-sm">
                  Continuous AI Source Attribution Engine
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Analyze SO2/NO2/PM2.5 ratios against industrial emission profiles to estimate probable sources.
                </Text>
              </View>
              <Switch
                value={enableAiAttribution}
                onValueChange={setEnableAiAttribution}
                trackColor={{ false: '#334155', true: '#10B981' }}
              />
            </View>

            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-sm">
                  Sentinel-5P / VIIRS Thermal Satellite Corroboration
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Cross-reference ground sensor spikes with satellite thermal anomalies for stubble and fire alerts.
                </Text>
              </View>
              <Switch
                value={enableSatelliteCorroboration}
                onValueChange={setEnableSatelliteCorroboration}
                trackColor={{ false: '#334155', true: '#10B981' }}
              />
            </View>

            <View className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex-row items-center justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-sm">
                  GRAP Stage-IV Enforcement Trigger Lock
                </Text>
                <Text className="text-slate-400 text-xs mt-0.5">
                  Enforce double officer confirmation for citywide traffic stoppages and industrial shutdowns.
                </Text>
              </View>
              <Switch
                value={grapStage4AutoLock}
                onValueChange={setGrapStage4AutoLock}
                trackColor={{ false: '#334155', true: '#10B981' }}
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <View className="flex-row justify-end">
          <TouchableOpacity
            onPress={handleSave}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl flex-row items-center space-x-2 shadow-lg"
          >
            <Save size={18} color="#FFFFFF" />
            <Text className="text-white font-bold text-sm ml-2">Save System Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </DashboardLayout>
  );
}
