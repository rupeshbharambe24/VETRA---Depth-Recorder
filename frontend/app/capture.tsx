// VETRA Depth Recorder - Capture Screen
// Main capture interface with camera preview and frame controls

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Chip, Snackbar, Icon, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../src/context/SessionContext';
import { ViewLabel, VIEW_LABEL_OPTIONS } from '../src/models/FrameCapture';
import { AppColors, AppSpacing, AppBorderRadius, AppShadow } from '../src/theme/appTheme';

export default function CaptureScreen() {
  const router = useRouter();
  const { currentSession, addFrame, getFrameCount } = useSession();
  
  const [selectedView, setSelectedView] = useState<ViewLabel>('front');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [lastCapturedView, setLastCapturedView] = useState<string>('');

  const handleCapture = useCallback(() => {
    const frame = addFrame(selectedView);
    setLastCapturedView(VIEW_LABEL_OPTIONS.find(v => v.value === selectedView)?.label || selectedView);
    setSnackbarVisible(true);
  }, [selectedView, addFrame]);

  const handleViewSession = () => {
    router.push('/session-summary');
  };

  const frameCount = getFrameCount();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Camera Preview Area */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPreview}>
          <Icon source="camera-off" size={64} color={AppColors.placeholder} />
          <Text style={styles.cameraPlaceholderText}>Camera preview here</Text>
          <Text style={styles.cameraPlaceholderSubtext}>
            ARCore integration coming in future update
          </Text>
        </View>
        
        {/* Overlay Info */}
        <View style={styles.overlayTopLeft}>
          <View style={styles.sessionBadge}>
            <Icon source="identifier" size={16} color={AppColors.onPrimary} />
            <Text style={styles.sessionBadgeText}>
              {currentSession?.animalId || 'No ID'}
            </Text>
          </View>
        </View>
        
        <View style={styles.overlayTopRight}>
          <Pressable style={styles.summaryButton} onPress={handleViewSession}>
            <Icon source="format-list-bulleted" size={20} color={AppColors.surface} />
            <Text style={styles.summaryButtonText}>Summary</Text>
          </Pressable>
        </View>
      </View>

      {/* Controls Section */}
      <View style={styles.controlsContainer}>
        {/* View Label Selector */}
        <View style={styles.viewSelectorContainer}>
          <Text style={styles.sectionLabel}>Select View Angle</Text>
          <View style={styles.chipContainer}>
            {VIEW_LABEL_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                selected={selectedView === option.value}
                onPress={() => setSelectedView(option.value)}
                style={[
                  styles.viewChip,
                  selectedView === option.value && styles.viewChipSelected,
                ]}
                textStyle={[
                  styles.viewChipText,
                  selectedView === option.value && styles.viewChipTextSelected,
                ]}
                showSelectedCheck={false}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </View>

        {/* Capture Button Area */}
        <View style={styles.captureArea}>
          <View style={styles.frameCounter}>
            <Icon source="image-multiple" size={24} color={AppColors.primary} />
            <Text style={styles.frameCountText}>
              Frames captured: <Text style={styles.frameCountNumber}>{frameCount}</Text>
            </Text>
          </View>
          
          <Pressable
            style={({ pressed }) => [
              styles.captureButton,
              pressed && styles.captureButtonPressed,
            ]}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner}>
              <Icon source="camera" size={32} color={AppColors.surface} />
            </View>
          </Pressable>
          
          <Text style={styles.captureHint}>
            Tap to capture {VIEW_LABEL_OPTIONS.find(v => v.value === selectedView)?.label} view
          </Text>
        </View>
      </View>

      {/* Snackbar for capture feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
        action={{
          label: 'View',
          onPress: handleViewSession,
        }}
      >
        Frame captured (mock) - {lastCapturedView}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  cameraPlaceholderText: {
    color: AppColors.placeholder,
    fontSize: 18,
    fontWeight: '500',
    marginTop: AppSpacing.md,
  },
  cameraPlaceholderSubtext: {
    color: AppColors.disabled,
    fontSize: 13,
    marginTop: AppSpacing.xs,
  },
  overlayTopLeft: {
    position: 'absolute',
    top: AppSpacing.md,
    left: AppSpacing.md,
  },
  overlayTopRight: {
    position: 'absolute',
    top: AppSpacing.md,
    right: AppSpacing.md,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 142, 60, 0.9)',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppBorderRadius.lg,
  },
  sessionBadgeText: {
    color: AppColors.onPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: AppSpacing.xs,
  },
  summaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppBorderRadius.lg,
  },
  summaryButtonText: {
    color: AppColors.surface,
    fontSize: 13,
    fontWeight: '500',
    marginLeft: AppSpacing.xs,
  },
  controlsContainer: {
    backgroundColor: AppColors.surface,
    borderTopLeftRadius: AppBorderRadius.xl,
    borderTopRightRadius: AppBorderRadius.xl,
    paddingTop: AppSpacing.lg,
    paddingHorizontal: AppSpacing.md,
    paddingBottom: AppSpacing.md,
    ...AppShadow.heavy,
  },
  viewSelectorContainer: {
    marginBottom: AppSpacing.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.onSurfaceVariant,
    marginBottom: AppSpacing.sm,
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: AppSpacing.sm,
  },
  viewChip: {
    backgroundColor: AppColors.surfaceVariant,
    borderRadius: AppBorderRadius.lg,
  },
  viewChipSelected: {
    backgroundColor: AppColors.primary,
  },
  viewChipText: {
    color: AppColors.onSurface,
    fontSize: 13,
  },
  viewChipTextSelected: {
    color: AppColors.onPrimary,
  },
  captureArea: {
    alignItems: 'center',
    paddingVertical: AppSpacing.md,
  },
  frameCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.md,
  },
  frameCountText: {
    fontSize: 15,
    color: AppColors.onSurfaceVariant,
    marginLeft: AppSpacing.sm,
  },
  frameCountNumber: {
    fontWeight: '700',
    color: AppColors.primary,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...AppShadow.medium,
  },
  captureButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: AppColors.primaryDark,
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: AppColors.primary,
    borderWidth: 3,
    borderColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureHint: {
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    marginTop: AppSpacing.md,
  },
  snackbar: {
    backgroundColor: AppColors.primaryDark,
  },
});
