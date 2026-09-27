import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Search, X, MapPin, Radio, AlertTriangle, FileText, Building2, ChevronRight } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';
import { MOCK_SENSORS, MOCK_ALERTS, MOCK_REPORTS, MOCK_DEPARTMENTS } from '../../mock/data';
import { getAqiBgClass } from '../../utils';

export const GlobalSearchModal: React.FC = () => {
  const {
    searchModalOpen,
    setSearchModalOpen,
    setSelectedAlert,
    setSelectedReport,
  } = useUIStore();

  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim() || query.length < 2) return null;
    const q = query.toLowerCase();

    const sensors = MOCK_SENSORS.filter(
      (s) =>
        s.locationName.toLowerCase().includes(q) ||
        s.sensorCode.toLowerCase().includes(q) ||
        s.ward.toLowerCase().includes(q) ||
        s.zone.toLowerCase().includes(q)
    );

    const alerts = MOCK_ALERTS.filter(
      (a) =>
        a.location.toLowerCase().includes(q) ||
        a.alertCode.toLowerCase().includes(q) ||
        a.probableSource.toLowerCase().includes(q) ||
        a.metric.toLowerCase().includes(q)
    );

    const reports = MOCK_REPORTS.filter(
      (r) =>
        r.location.toLowerCase().includes(q) ||
        r.reportCode.toLowerCase().includes(q) ||
        r.issueType.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q)
    );

    const departments = MOCK_DEPARTMENTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.headOfficer.toLowerCase().includes(q) ||
        d.assignedJurisdiction.toLowerCase().includes(q)
    );

    return { sensors, alerts, reports, departments };
  }, [query]);

  if (!searchModalOpen) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={searchModalOpen}
      onRequestClose={() => setSearchModalOpen(false)}
    >
      <View className="flex-1 bg-slate-950/80 backdrop-blur-md items-center justify-start pt-16 px-4">
        <View className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex-col max-h-[80vh]">
          {/* Search Header Bar */}
          <View className="flex-row items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/70">
            <Search size={20} color="#10B981" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search location, sensor, report, department..."
              placeholderTextColor="#64748B"
              autoFocus
              className="flex-1 ml-3 text-white text-base outline-none bg-transparent"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} className="p-1 mr-2">
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setSearchModalOpen(false)}
              className="px-2.5 py-1 bg-slate-800 rounded-md border border-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">ESC</Text>
            </TouchableOpacity>
          </View>

          {/* Results List */}
          <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator>
            {!searchResults ? (
              <View className="py-12 items-center justify-center">
                <Search size={36} color="#334155" />
                <Text className="text-slate-400 text-sm mt-3 font-medium">
                  Type at least 2 characters to search across all environmental command records.
                </Text>
                <View className="flex-row flex-wrap justify-center gap-2 mt-4 max-w-md">
                  {['Industrial Area', 'City Center', 'Ward 12', 'PMS5003', 'Smoke', 'SPCB'].map(
                    (tag) => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => setQuery(tag)}
                        className="px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700 hover:border-emerald-500/40"
                      >
                        <Text className="text-xs text-emerald-400 font-medium">{tag}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>
            ) : (
              <View className="space-y-4">
                {/* Sensors */}
                {searchResults.sensors.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex-row items-center">
                      <Radio size={14} color="#10B981" /> Sensors ({searchResults.sensors.length})
                    </Text>
                    {searchResults.sensors.map((sensor) => (
                      <View
                        key={sensor.id}
                        className="p-3 bg-slate-800/60 rounded-xl mb-2 border border-slate-700/60 flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center space-x-3">
                          <View className="w-8 h-8 rounded-lg bg-slate-700/50 items-center justify-center">
                            <Radio size={16} color="#34D399" />
                          </View>
                          <View className="ml-2.5">
                            <Text className="text-white font-semibold text-sm">
                              {sensor.locationName}
                            </Text>
                            <Text className="text-slate-400 text-xs">
                              {sensor.sensorCode} • {sensor.ward} ({sensor.zone})
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row items-center space-x-3">
                          <View className={`px-2 py-0.5 rounded border ${getAqiBgClass(sensor.currentAQI)}`}>
                            <Text className="text-xs font-bold">AQI {sensor.currentAQI}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Alerts */}
                {searchResults.alerts.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex-row items-center">
                      <AlertTriangle size={14} color="#EF4444" /> Active Alerts ({searchResults.alerts.length})
                    </Text>
                    {searchResults.alerts.map((alert) => (
                      <TouchableOpacity
                        key={alert.id}
                        onPress={() => {
                          setSelectedAlert(alert);
                          setSearchModalOpen(false);
                        }}
                        className="p-3 bg-slate-800/60 rounded-xl mb-2 border border-slate-700/60 flex-row items-center justify-between hover:bg-slate-800"
                      >
                        <View className="flex-row items-center space-x-3">
                          <View className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-800/40 items-center justify-center">
                            <AlertTriangle size={16} color="#EF4444" />
                          </View>
                          <View className="ml-2.5">
                            <Text className="text-white font-semibold text-sm">
                              {alert.alertCode}: {alert.location}
                            </Text>
                            <Text className="text-slate-400 text-xs">
                              {alert.metric}: {alert.value} {alert.unit} • {alert.probableSource}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Reports */}
                {searchResults.reports.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex-row items-center">
                      <FileText size={14} color="#3B82F6" /> Field & Citizen Reports ({searchResults.reports.length})
                    </Text>
                    {searchResults.reports.map((report) => (
                      <TouchableOpacity
                        key={report.id}
                        onPress={() => {
                          setSelectedReport(report);
                          setSearchModalOpen(false);
                        }}
                        className="p-3 bg-slate-800/60 rounded-xl mb-2 border border-slate-700/60 flex-row items-center justify-between hover:bg-slate-800"
                      >
                        <View className="flex-row items-center space-x-3">
                          <View className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-800/40 items-center justify-center">
                            <FileText size={16} color="#60A5FA" />
                          </View>
                          <View className="ml-2.5 flex-1 pr-2">
                            <Text className="text-white font-semibold text-sm">
                              {report.issueType} • {report.location}
                            </Text>
                            <Text className="text-slate-400 text-xs" numberOfLines={1}>
                              By {report.reporterName}: {report.description}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Departments */}
                {searchResults.departments.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex-row items-center">
                      <Building2 size={14} color="#A855F7" /> Government Departments ({searchResults.departments.length})
                    </Text>
                    {searchResults.departments.map((dept) => (
                      <View
                        key={dept.id}
                        className="p-3 bg-slate-800/60 rounded-xl mb-2 border border-slate-700/60 flex-row items-center justify-between"
                      >
                        <View className="flex-row items-center space-x-3">
                          <View
                            className="w-8 h-8 rounded-lg items-center justify-center"
                            style={{ backgroundColor: `${dept.colorHex}25` }}
                          >
                            <Building2 size={16} color={dept.colorHex} />
                          </View>
                          <View className="ml-2.5">
                            <Text className="text-white font-semibold text-sm">
                              {dept.name} ({dept.code})
                            </Text>
                            <Text className="text-slate-400 text-xs">
                              Nodal: {dept.headOfficer} • {dept.assignedJurisdiction}
                            </Text>
                          </View>
                        </View>
                        <View className="px-2 py-1 bg-slate-900 rounded border border-slate-700">
                          <Text className="text-[11px] text-emerald-400 font-semibold">
                            {dept.activeActionsCount} Active Actions
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {searchResults.sensors.length === 0 &&
                  searchResults.alerts.length === 0 &&
                  searchResults.reports.length === 0 &&
                  searchResults.departments.length === 0 && (
                    <View className="py-10 items-center justify-center">
                      <Text className="text-slate-400 text-sm">
                        No matching records found for "{query}".
                      </Text>
                    </View>
                  )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
