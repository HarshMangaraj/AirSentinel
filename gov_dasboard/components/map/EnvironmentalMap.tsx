import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Sparkles,
  Radio,
  AlertTriangle,
  FileText,
  Eye,
  X,
  Compass,
  Maximize2,
  Minimize2,
} from 'lucide-react-native';
import { useMapStore } from '../../store/useMapStore';
import { useUIStore } from '../../store/useUIStore';
import { reportsService } from '../../services/reports';
import { alertsService } from '../../services/alerts';
import { sensorsService } from '../../services/sensors';
import { PollutionReport, PollutionAlert, Sensor } from '../../types';

interface EnvironmentalMapProps {
  height?: number;
  showFullControls?: boolean;
}

export const EnvironmentalMap: React.FC<EnvironmentalMapProps> = ({
  height = 520,
  showFullControls = true,
}) => {
  const { setSelectedReport, setSelectedAlert } = useUIStore();
  const [reports, setReports] = useState<PollutionReport[]>([]);
  const [alerts, setAlerts] = useState<PollutionAlert[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Active layers state
  const [showReports, setShowReports] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);

  // Active focus center
  const [centerCoord, setCenterCoord] = useState<{ lat: number; lon: number; zoom: number }>({
    lat: 28.6139,
    lon: 77.209,
    zoom: 11,
  });

  // Fetch live reports, alerts and sensors
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [rep, alt, sen] = await Promise.all([
          reportsService.getReports(),
          alertsService.getAlerts(),
          sensorsService.getSensors(),
        ]);
        if (mounted) {
          setReports(rep || []);
          setAlerts(alt || []);
          setSensors(sen || []);
        }
      } catch (e) {
        console.warn('Map data load error:', e);
      }
    }

    loadData();
    const interval = setInterval(loadData, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Listen to message from Leaflet map iframe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMessage = (e: MessageEvent) => {
      try {
        if (!e.data || typeof e.data !== 'object') return;
        if (e.data.type === 'INSPECT_REPORT' && e.data.reportId) {
          const found = reports.find((r) => r.id === e.data.reportId);
          if (found) setSelectedReport(found);
        } else if (e.data.type === 'INSPECT_ALERT' && e.data.alertId) {
          const found = alerts.find((a) => a.id === e.data.alertId);
          if (found) setSelectedAlert(found);
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [reports, alerts, setSelectedReport, setSelectedAlert]);

  // Construct Leaflet HTML content matching the mobile app's LeafletMap styling
  const mapHtml = useMemo(() => {
    const safeReports = showReports ? reports : [];
    const safeSensors = showSensors ? sensors : [];
    const safeAlerts = showHotspots ? alerts : [];

    const reportsJson = JSON.stringify(
      safeReports.map((r) => ({
        id: r.id,
        code: r.reportCode,
        issueType: r.issueType,
        description: r.description,
        lat: r.coordinates?.latitude || 28.6139,
        lon: r.coordinates?.longitude || 77.209,
        status: r.status,
        photoUrl: r.photoUrl,
        timestamp: r.timestamp,
      }))
    );

    const sensorsJson = JSON.stringify(
      safeSensors.map((s) => ({
        id: s.id,
        name: s.locationName,
        code: s.sensorCode,
        aqi: s.currentAQI,
        pm25: s.pm25,
        pm10: s.pm10,
        lat: s.coordinates?.latitude || 28.6139,
        lon: s.coordinates?.longitude || 77.209,
      }))
    );

    const alertsJson = JSON.stringify(
      safeAlerts.map((a) => ({
        id: a.id,
        code: a.alertCode,
        title: a.location,
        summary: a.predictionSummary || a.probableSource,
        severity: a.severity,
        aqi: a.aqi,
        lat: a.coordinates?.latitude || 28.6139,
        lon: a.coordinates?.longitude || 77.209,
      }))
    );

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
        <style>
          * { box-sizing: border-box; }
          html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #0B1120; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          
          /* Dark tile filter matching mobile app LeafletMap */
          .leaflet-tile-pane {
            filter: invert(0.92) hue-rotate(180deg) brightness(0.88) contrast(1.02) saturate(0.65);
          }

          /* Popups */
          .leaflet-popup-content-wrapper {
            background: #0F172A;
            color: #F8FAFC;
            border-radius: 16px;
            border: 1px solid rgba(51, 65, 85, 0.8);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
            padding: 4px;
          }
          .leaflet-popup-tip {
            background: #0F172A;
            border: 1px solid rgba(51, 65, 85, 0.8);
          }
          .leaflet-container a.leaflet-popup-close-button {
            color: #94A3B8;
            padding: 6px;
          }

          /* Custom Pulsing Citizen Pin Marker */
          .citizen-marker-icon {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .citizen-marker-core {
            width: 22px;
            height: 22px;
            background: #EF4444;
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 14px rgba(239, 68, 68, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 900;
            z-index: 2;
          }
          .citizen-marker-pulse {
            position: absolute;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.35);
            animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
            z-index: 1;
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.5); opacity: 0.9; }
            100% { transform: scale(1.6); opacity: 0; }
          }

          /* AQI Station Badge */
          .aqi-station-badge {
            background: #0F172A;
            border-radius: 8px;
            border: 2px solid;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 6px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .aqi-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          /* Popup Card Styles */
          .popup-badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 2px 7px;
            border-radius: 6px;
            margin-bottom: 6px;
          }
          .badge-red { background: rgba(239, 68, 68, 0.2); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.4); }
          .badge-blue { background: rgba(59, 130, 246, 0.2); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.4); }
          .badge-amber { background: rgba(245, 158, 11, 0.2); color: #FCD34D; border: 1px solid rgba(245, 158, 11, 0.4); }

          .popup-btn {
            display: block;
            width: 100%;
            margin-top: 10px;
            padding: 7px 12px;
            background: #2563EB;
            color: #FFFFFF;
            font-size: 11px;
            font-weight: 700;
            text-align: center;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            transition: background 0.15s;
          }
          .popup-btn:hover { background: #1D4ED8; }
          .popup-btn-danger { background: #DC2626; }
          .popup-btn-danger:hover { background: #B91C1C; }

          .popup-img {
            width: 100%;
            height: 110px;
            object-fit: cover;
            border-radius: 8px;
            margin-top: 8px;
            border: 1px solid #334155;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${centerCoord.lat}, ${centerCoord.lon}], ${centerCoord.zoom});
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors | AirSentinel Command',
            maxZoom: 19
          }).addTo(map);

          function getAqiColor(val) {
            if (val <= 50) return '#10B981';
            if (val <= 100) return '#FBBF24';
            if (val <= 150) return '#F97316';
            if (val <= 200) return '#EF4444';
            if (val <= 300) return '#8B5CF6';
            return '#831843';
          }

          const rawReports = ${reportsJson};
          const rawSensors = ${sensorsJson};
          const rawAlerts = ${alertsJson};

          // 1. Plot Citizen Reports with Clusters
          const reportCluster = L.markerClusterGroup({
            maxClusterRadius: 35,
            iconCreateFunction: function(cluster) {
              return L.divIcon({
                html: '<div style="background:#EF4444;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;border:2px solid #fff;box-shadow:0 0 12px rgba(239,68,68,0.7);">' + cluster.getChildCount() + '</div>',
                className: '',
                iconSize: [32, 32]
              });
            }
          });

          rawReports.forEach(r => {
            const pinIcon = L.divIcon({
              className: 'citizen-marker-icon',
              html: '<div class="citizen-marker-pulse"></div><div class="citizen-marker-core">!</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });

            const imgHtml = r.photoUrl ? '<img src="' + r.photoUrl + '" class="popup-img" />' : '';

            const popupContent = 
              '<div style="max-width:210px; padding:4px;">' +
                '<span class="popup-badge badge-red">Citizen Incident · ' + (r.issueType || 'Pollution') + '</span>' +
                '<div style="font-weight:800; font-size:13px; color:#F8FAFC; margin-bottom:4px;">' + (r.code || 'REP') + '</div>' +
                '<div style="font-size:11px; color:#94A3B8; line-height:1.4;">' + (r.description || 'Citizen reported severe environmental violation.') + '</div>' +
                imgHtml +
                '<div style="font-size:10px; color:#64748B; margin-top:6px;">Status: <b style="color:#FCA5A5;">' + r.status + '</b> · ' + r.timestamp + '</div>' +
                '<button class="popup-btn popup-btn-danger" onclick="window.parent.postMessage({ type: \\'INSPECT_REPORT\\', reportId: \\'' + r.id + '\\' }, \\'*\\')">Take Action / Inspect</button>' +
              '</div>';

            const m = L.marker([r.lat, r.lon], { icon: pinIcon }).bindPopup(popupContent);
            reportCluster.addLayer(m);
          });
          map.addLayer(reportCluster);

          // 2. Plot CAAQMS Monitoring Telemetry Stations
          rawSensors.forEach(s => {
            const col = getAqiColor(s.aqi);
            const badgeIcon = L.divIcon({
              className: '',
              html: '<div class="aqi-station-badge" style="border-color:' + col + ';"><div class="aqi-dot" style="background:' + col + ';"></div>' + s.aqi + '</div>',
              iconSize: [55, 24],
              iconAnchor: [27, 12]
            });

            const popupContent = 
              '<div style="max-width:200px; padding:4px;">' +
                '<span class="popup-badge badge-blue">CAAQMS Station</span>' +
                '<div style="font-weight:800; font-size:13px; color:#F8FAFC;">' + s.name + '</div>' +
                '<div style="font-size:11px; color:#94A3B8; margin-bottom:6px;">Station Code: ' + s.code + '</div>' +
                '<div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; background:#1E293B; padding:6px 10px; border-radius:8px; margin-bottom:6px;">' +
                  '<span>AQI: <b style="color:' + col + ';">' + s.aqi + '</b></span>' +
                  '<span>PM2.5: ' + s.pm25 + '</span>' +
                '</div>' +
                '<div style="font-size:10px; color:#64748B;">Continuous Government Telemetry</div>' +
              '</div>';

            L.marker([s.lat, s.lon], { icon: badgeIcon }).bindPopup(popupContent).addTo(map);

            // Pulsing circle for severe stations
            if (s.aqi > 200) {
              L.circle([s.lat, s.lon], {
                radius: 1800,
                color: col,
                fillColor: col,
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4'
              }).addTo(map);
            }
          });

          // 3. Plot AI Hotspot Dispersion Plumes
          rawAlerts.forEach(a => {
            L.circle([a.lat, a.lon], {
              radius: 3500,
              color: '#EF4444',
              fillColor: '#EF4444',
              fillOpacity: 0.18,
              weight: 2,
              dashArray: '6, 6'
            }).bindPopup(
              '<div style="max-width:210px; padding:4px;">' +
                '<span class="popup-badge badge-amber">AI Hotspot Plume</span>' +
                '<div style="font-weight:800; font-size:13px; color:#F8FAFC;">' + a.title + '</div>' +
                '<div style="font-size:11px; color:#94A3B8; margin-top:4px;">' + a.summary + '</div>' +
                '<button class="popup-btn" onclick="window.parent.postMessage({ type: \\'INSPECT_ALERT\\', alertId: \\'' + a.id + '\\' }, \\'*\\')">View Hotspot Analytics</button>' +
              '</div>'
            ).addTo(map);
          });
        </script>
      </body>
      </html>
    `;
  }, [reports, sensors, alerts, showReports, showSensors, showHotspots, centerCoord]);

  return (
    <View
      style={{ height: isFullscreen ? '100%' : height }}
      className={`w-full bg-slate-950 border border-slate-800/90 rounded-2xl relative overflow-hidden shadow-2xl flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Top Map Action Bar */}
      <View className="h-12 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-4 flex-row items-center justify-between z-10">
        {/* Layer Toggles */}
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => setShowReports(!showReports)}
            className={`px-2.5 py-1 rounded-lg border flex-row items-center space-x-1.5 ${
              showReports
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-slate-850 border-slate-800 opacity-60'
            }`}
          >
            <AlertTriangle size={13} color={showReports ? '#EF4444' : '#64748B'} />
            <Text
              className={`text-xs font-bold ml-1 ${
                showReports ? 'text-red-300' : 'text-slate-400'
              }`}
            >
              Citizen Reports ({reports.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowSensors(!showSensors)}
            className={`px-2.5 py-1 rounded-lg border flex-row items-center space-x-1.5 ml-2 ${
              showSensors
                ? 'bg-emerald-500/20 border-emerald-500/50'
                : 'bg-slate-850 border-slate-800 opacity-60'
            }`}
          >
            <Radio size={13} color={showSensors ? '#10B981' : '#64748B'} />
            <Text
              className={`text-xs font-bold ml-1 ${
                showSensors ? 'text-emerald-300' : 'text-slate-400'
              }`}
            >
              CAAQMS Stations ({sensors.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-lg border flex-row items-center space-x-1.5 ml-2 ${
              showHotspots
                ? 'bg-purple-500/20 border-purple-500/50'
                : 'bg-slate-850 border-slate-800 opacity-60'
            }`}
          >
            <Sparkles size={13} color={showHotspots ? '#C084FC' : '#64748B'} />
            <Text
              className={`text-xs font-bold ml-1 ${
                showHotspots ? 'text-purple-300' : 'text-slate-400'
              }`}
            >
              AI Hotspots ({alerts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Regional Focus / Fullscreen */}
        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => setCenterCoord({ lat: 28.6139, lon: 77.209, zoom: 11 })}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
          >
            <Text className="text-[11px] font-bold text-slate-300">Delhi NCR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCenterCoord({ lat: 19.076, lon: 72.8777, zoom: 11 })}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 ml-1.5"
          >
            <Text className="text-[11px] font-bold text-slate-300">Mumbai</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCenterCoord({ lat: 22.5, lon: 80.0, zoom: 5 })}
            className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 ml-1.5"
          >
            <Text className="text-[11px] font-bold text-slate-300">National</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 ml-2"
          >
            {isFullscreen ? (
              <Minimize2 size={14} color="#94A3B8" />
            ) : (
              <Maximize2 size={14} color="#94A3B8" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Embedded Leaflet Map Stage */}
      <View className="flex-1 w-full bg-[#0B1120] relative">
        {Platform.OS === 'web' ? (
          <iframe
            key={`${centerCoord.lat}-${centerCoord.lon}-${centerCoord.zoom}`}
            srcDoc={mapHtml}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              backgroundColor: '#0B1120',
            }}
            title="AirSentinel Environmental Map"
          />
        ) : (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-slate-400 text-sm">
              Map available in Web Command Center
            </Text>
          </View>
        )}

        {/* Floating Mini AQI Legend at bottom */}
        <View className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800/90 px-3 py-1.5 rounded-xl shadow-xl flex-row items-center space-x-3 pointer-events-none">
          <Text className="text-[10px] font-bold text-slate-400 mr-1">AQI INDEX:</Text>
          <View className="flex-row items-center space-x-1">
            <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <Text className="text-[10px] text-slate-300">0-50</Text>
          </View>
          <View className="flex-row items-center space-x-1 ml-2">
            <View className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <Text className="text-[10px] text-slate-300">51-100</Text>
          </View>
          <View className="flex-row items-center space-x-1 ml-2">
            <View className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <Text className="text-[10px] text-slate-300">101-150</Text>
          </View>
          <View className="flex-row items-center space-x-1 ml-2">
            <View className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <Text className="text-[10px] text-slate-300">151-200</Text>
          </View>
          <View className="flex-row items-center space-x-1 ml-2">
            <View className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <Text className="text-[10px] text-slate-300">201-300</Text>
          </View>
          <View className="flex-row items-center space-x-1 ml-2">
            <View className="w-2.5 h-2.5 rounded-full bg-pink-900" />
            <Text className="text-[10px] text-slate-300">300+</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
