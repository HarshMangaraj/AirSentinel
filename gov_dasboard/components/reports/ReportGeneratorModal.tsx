import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { FileSpreadsheet, X, Download, CheckCircle2, FileText, Calendar, Filter } from 'lucide-react-native';
import { useUIStore } from '../../store/useUIStore';

export const ReportGeneratorModal: React.FC = () => {
  const { reportGeneratorModalOpen, setReportGeneratorModalOpen } = useUIStore();
  const [reportType, setReportType] = useState('Daily Comprehensive AQI Audit');
  const [format, setFormat] = useState('PDF Document (.pdf)');
  const [downloading, setDownloading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!reportGeneratorModalOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReportGeneratorModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const reportTypes = [
    'Daily Comprehensive AQI Audit',
    'CAAQMS Telemetry & Hotspots Docket',
    'GRAP Stage-IV Enforcement Summary',
    'Inter-Department Action Verification Record',
    'Citizen & Field Grievance Redressal Audit',
  ];

  return (
    <Modal
      transparent
      animationType="fade"
      visible={reportGeneratorModalOpen}
      onRequestClose={() => setReportGeneratorModalOpen(false)}
    >
      <View className="flex-1 bg-slate-950/80 backdrop-blur-md items-center justify-center p-4">
        <View className="w-full max-w-xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex-col">
          {/* Header */}
          <View className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex-row items-center justify-between">
            <View className="flex-row items-center space-x-2">
              <View className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 items-center justify-center">
                <FileSpreadsheet size={18} color="#C084FC" />
              </View>
              <View className="ml-2.5">
                <Text className="text-white font-bold text-base">
                  Generate Environmental Audit Report
                </Text>
                <Text className="text-slate-400 text-xs">
                  Official Government Document Export Utility
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setReportGeneratorModalOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800"
            >
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Success Banner */}
          {success && (
            <View className="mx-5 mt-4 p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex-row items-center space-x-2">
              <CheckCircle2 size={18} color="#34D399" />
              <Text className="text-emerald-200 text-xs font-semibold ml-2">
                Report generated & downloaded successfully!
              </Text>
            </View>
          )}

          {/* Form */}
          <ScrollView className="flex-1 p-5 space-y-4" showsVerticalScrollIndicator>
            <View>
              <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Report Template
              </Text>
              {reportTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setReportType(type)}
                  className={`p-3 rounded-xl border mb-2 flex-row items-center justify-between transition-all ${
                    reportType === type
                      ? 'bg-purple-500/15 border-purple-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <View className="flex-row items-center space-x-2.5">
                    <FileText size={16} color={reportType === type ? '#C084FC' : '#94A3B8'} />
                    <Text
                      className={`text-xs font-semibold ml-2 ${
                        reportType === type ? 'text-purple-200' : 'text-slate-300'
                      }`}
                    >
                      {type}
                    </Text>
                  </View>
                  {reportType === type && <CheckCircle2 size={16} color="#C084FC" />}
                </TouchableOpacity>
              ))}
            </View>

            {/* Export Format */}
            <View className="mt-3">
              <Text className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Export Format
              </Text>
              <View className="grid grid-cols-2 gap-2">
                {['PDF Document (.pdf)', 'Raw CSV Data (.csv)'].map((fmt) => (
                  <TouchableOpacity
                    key={fmt}
                    onPress={() => setFormat(fmt)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold ${
                      format === fmt
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold text-center ${
                        format === fmt ? 'text-emerald-300' : 'text-slate-400'
                      }`}
                    >
                      {fmt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Jurisdiction Scope */}
            <View className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex-row items-center justify-between mt-2">
              <Text className="text-slate-400 text-xs">Included Telemetry Sensors:</Text>
              <Text className="text-emerald-400 font-bold text-xs">48 Continuous Stations</Text>
            </View>
          </ScrollView>

          {/* Footer */}
          <View className="p-4 bg-slate-950/80 border-t border-slate-800 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setReportGeneratorModalOpen(false)}
              className="px-4 py-2 bg-slate-800 rounded-xl border border-slate-700"
            >
              <Text className="text-slate-300 text-xs font-semibold">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDownload}
              disabled={downloading}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl flex-row items-center space-x-2"
            >
              <Download size={16} color="#FFFFFF" />
              <Text className="text-white font-bold text-xs ml-1.5">
                {downloading ? 'Compiling Official Audit...' : 'Generate & Download Audit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
