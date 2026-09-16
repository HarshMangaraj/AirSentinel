import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';

type ReportPin = {
  id: string;
  lat: number;
  lon: number;
  description: string | null;
  media_url: string | null;
  status: string;
  created_at: string | null;
};

type Props = {
  lat: number;
  lon: number;
  aqi: number | null;
  aqiColor: string;
  station: string;
  isDark: boolean;
  reports?: ReportPin[];
  onMapPress?: (lat: number, lon: number) => void;
};

export function LeafletMap({ lat, lon, aqi, aqiColor, station, isDark, reports = [], onMapPress }: Props) {
  const popupBg = isDark ? '#1A2420' : '#FFFFFF';
  const popupText = isDark ? '#EAF2EE' : '#1A2420';
  const signalColor = '#D9722F';

  const tileFilter = isDark
    ? 'invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(0.95) saturate(0.5)'
    : 'grayscale(0.35) brightness(1.08) saturate(0.6) contrast(0.95)';

  const reportMarkersJs = reports
    .map((r) => {
      const desc = (r.description || 'Pollution report').replace(/'/g, "\\'").replace(/\n/g, ' ');
      const img = r.media_url
        ? `<img src="${r.media_url}" style="width:100%;border-radius:8px;margin-top:6px;max-height:120px;object-fit:cover;" />`
        : '';
      const when = r.created_at ? new Date(r.created_at).toLocaleDateString() : '';
      return `
        reportCluster.addLayer(
          L.marker([${r.lat}, ${r.lon}], {
            icon: L.divIcon({
              className: '',
              html: '<div style="background:${signalColor};width:14px;height:14px;border-radius:50%;border:2px solid ${popupBg};box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [14, 14],
            })
          }).bindPopup(
            '<div style="font-family:-apple-system, sans-serif; padding:2px; max-width:180px;">' +
            '<b style="font-size:13px;">${desc}</b><br/>' +
            '<span style="opacity:0.6; font-size:11px;">${when}</span>' +
            '${img}' +
            '</div>'
          )
        );
      `;
    })
    .join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; background: ${isDark ? '#0E1512' : '#F4F6F2'}; }
        .leaflet-tile-pane { filter: ${tileFilter}; }
        .leaflet-popup-content-wrapper {
          background: ${popupBg};
          color: ${popupText};
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .leaflet-popup-tip { background: ${popupBg}; }
        .leaflet-control-attribution { font-size: 9px; opacity: 0.6; }

        .report-cluster-icon {
          background: ${signalColor};
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: -apple-system, sans-serif;
          font-weight: 700;
          border: 3px solid ${popupBg};
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
      <script>
        const map = L.map('map', { zoomControl: false }).setView([${lat}, ${lon}], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        const marker = L.circleMarker([${lat}, ${lon}], {
          radius: 14,
          fillColor: '${aqiColor}',
          color: '${popupBg}',
          weight: 3,
          fillOpacity: 0.95
        }).addTo(map);

        marker.bindPopup(
          '<div style="font-family: -apple-system, sans-serif; padding: 2px;">' +
          '<b style="font-size:14px;">${station}</b><br/>' +
          '<span style="opacity:0.7; font-size:12px;">AQI ' + ${aqi ?? "'N/A'"} + '</span>' +
          '</div>'
        ).openPopup();

        const reportCluster = L.markerClusterGroup({
          maxClusterRadius: 45,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            const size = count < 10 ? 30 : count < 25 ? 36 : 42;
            return L.divIcon({
              html: '<div class="report-cluster-icon" style="width:' + size + 'px;height:' + size + 'px;font-size:' + (count < 10 ? 12 : 13) + 'px;">' + count + '</div>',
              className: '',
              iconSize: [size, size],
            });
          }
        });

        ${reportMarkersJs}

        map.addLayer(reportCluster);

        map.on('click', function(e) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            lat: e.latlng.lat,
            lon: e.latlng.lng
          }));
        });
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      source={{ html }}
      style={styles.map}
      javaScriptEnabled
      domStorageEnabled
      onMessage={(event) => {
        if (!onMapPress) return;
        try {
          const { lat, lon } = JSON.parse(event.nativeEvent.data);
          onMapPress(lat, lon);
        } catch {}
      }}
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: 'transparent' },
});