// VETRA Depth Recorder - Root Layout
// Sets up theme provider and navigation structure

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '../src/context/SessionContext';
import { AppColors } from '../src/theme/appTheme';

// Custom Material 3 theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: AppColors.primary,
    secondary: AppColors.secondary,
    background: AppColors.background,
    surface: AppColors.surface,
    error: AppColors.error,
    onPrimary: AppColors.onPrimary,
    onSecondary: AppColors.onSecondary,
    onBackground: AppColors.onBackground,
    onSurface: AppColors.onSurface,
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <SessionProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: AppColors.surface,
              },
              headerTintColor: AppColors.onSurface,
              headerTitleStyle: {
                fontWeight: '600',
              },
              headerShadowVisible: true,
              contentStyle: {
                backgroundColor: AppColors.background,
              },
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                title: 'VETRA Depth Recorder',
              }}
            />
            <Stack.Screen
              name="session-setup"
              options={{
                title: 'New Session',
              }}
            />
            <Stack.Screen
              name="capture"
              options={{
                title: 'Capture',
                headerBackVisible: false,
              }}
            />
            <Stack.Screen
              name="session-summary"
              options={{
                title: 'Session Summary',
                headerBackVisible: false,
              }}
            />
          </Stack>
        </SessionProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
