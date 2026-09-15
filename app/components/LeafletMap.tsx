import { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';

type Props = {
  lat: number;
  lon: number;
  aqi: number;
  aqiColor: string;
  station: string;
  onMapPress?: (lat: number, lon: number) => void;
};

export function LeafletMap({ lat, lon, aqi, aqiColor, station, onMapPress }: Props) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        const map = L.map('map', { zoomControl: false }).setView([${lat}, ${lon}], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const marker = L.circleMarker([${lat}, ${lon}], {
          radius: 16,
          fillColor: '${aqiColor}',
          color: '#fff',
          weight: 2,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup('<b>${station}</b><br/>AQI: ${aqi}').openPopup();

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
  map: { flex: 1 },
});