import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';

type Props = {
  lat: number;
  lon: number;
  aqi: number;
  aqiColor: string;
  station: string;
  isDark: boolean;
  onMapPress?: (lat: number, lon: number) => void;
};

export function LeafletMap({ lat, lon, aqi, aqiColor, station, isDark, onMapPress }: Props) {
  const popupBg = isDark ? '#1A2420' : '#FFFFFF';
  const popupText = isDark ? '#EAF2EE' : '#1A2420';

  // CSS filter recolors plain OSM tiles to match the app palette — no paid/key-gated tile provider needed
  const tileFilter = isDark
    ? 'invert(0.92) hue-rotate(180deg) brightness(0.9) contrast(0.95) saturate(0.5)'
    : 'grayscale(0.35) brightness(1.08) saturate(0.6) contrast(0.95)';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
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
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
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
          '<span style="opacity:0.7; font-size:12px;">AQI ' + ${aqi} + '</span>' +
          '</div>'
        ).openPopup();

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