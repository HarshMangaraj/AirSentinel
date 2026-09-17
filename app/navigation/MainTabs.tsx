import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { MapScreen } from '../screens/MapScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { AlertsScreen } from '../screens/AlertsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

export function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.signal,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.glassBorder },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }} />
      <Tab.Screen name="Map" component={MapScreen} options={{ tabBarIcon: ({ color, size }) => <Feather name="map" size={size} color={color} /> }} />
      <Tab.Screen name="Report" component={ReportScreen} options={{ tabBarIcon: ({ color, size }) => <Feather name="camera" size={size} color={color} /> }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ tabBarIcon: ({ color, size }) => <Feather name="bell" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <Feather name="user" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}