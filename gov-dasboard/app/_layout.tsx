import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="#0B1120" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0F172A' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="dashboard/index" />
          <Stack.Screen name="live-map/index" />
          <Stack.Screen name="alerts/index" />
          <Stack.Screen name="reports/index" />
          <Stack.Screen name="actions/index" />
          <Stack.Screen name="departments/index" />
          <Stack.Screen name="users/index" />
          <Stack.Screen name="settings/index" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
