// VETRA Depth Recorder - Capture Screen
// Real camera capture with sensor-based pose tracking

import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Text, Chip, Snackbar, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSession } from '../src/context/SessionContext';
import { ViewLabel, VIEW_LABEL_OPTIONS } from '../src/models/FrameCapture';
import { AppColors, AppSpacing, AppBorderRadius, AppShadow } from '../src/theme/appTheme';

export default function CaptureScreen() {
  const router = useRouter();
  const {
    currentSession,
    captureFrame,
    getFrameCount,
    isCapturing,
    cameraRef,
  } = useSession();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedView, setSelectedView] = useState<ViewLabel>('front');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [lastCaptureSuccess, setLastCaptureSuccess] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    const frame = await captureFrame(selectedView);
    
    if (frame) {
      const viewName = VIEW_LABEL_OPTIONS.find(v => v.value === selectedView)?.label || selectedView;
      const isReal = !frame.isMock;
      
      setLastCaptureSuccess(isReal);
      setSnackbarMessage(
        isReal
          ? `Frame captured: ${viewName} (${frame.id})`
          : `Mock frame captured: ${viewName}`
      );
      setSnackbarVisible(true);
    }
  }, [selectedView, captureFrame, isCapturing]);

  const handleViewSession = () => {
    router.push('/session-summary');
  };

  const frameCount = getFrameCount();

  // Permission loading
  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.permissionContainer}>
          <Icon source="camera-off" size={64} color={AppColors.error} />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            VETRA needs camera access to capture frames for 3D reconstruction.
          </Text>
          <Pressable style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Camera Preview */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setCameraReady(true)}
        >
          {/* Camera Overlay */}
          <View style={styles.cameraOverlay}>
            {/* Top Left - Session Badge */}
            <View style={styles.overlayTopLeft}>
              <View style={styles.sessionBadge}>
                <Icon source="identifier" size={16} color={AppColors.onPrimary} />
                <Text style={styles.sessionBadgeText}>
                  {currentSession?.animalId || 'No ID'}
                </Text>
              </View>
            </View>

            {/* Top Right - Summary Button */}
            <View style={styles.overlayTopRight}>
              <Pressable style={styles.summaryButton} onPress={handleViewSession}>
                <Icon source="format-list-bulleted" size={20} color={AppColors.surface} />
                <Text style={styles.summaryButtonText}>Summary</Text>
              </Pressable>
            </View>

            {/* Center - Guide Frame */}
            <View style={styles.guideFrame}>
              <View style={[styles.guideCorner, styles.guideTopLeft]} />
              <View style={[styles.guideCorner, styles.guideTopRight]} />
              <View style={[styles.guideCorner, styles.guideBottomLeft]} />
              <View style={[styles.guideCorner, styles.guideBottomRight]} />
            </View>

            {/* Bottom Center - View Label */}
            <View style={styles.overlayBottom}>
              <View style={styles.currentViewBadge}>
                <Text style={styles.currentViewText}>
                  {VIEW_LABEL_OPTIONS.find(v => v.value === selectedView)?.label}
                </Text>
              </View>
            </View>
          </View>
        </CameraView>

        {/* Camera not ready overlay */}
        {!cameraReady && (
          <View style={styles.cameraLoading}>
            <ActivityIndicator size="large" color={AppColors.primary} />
            <Text style={styles.cameraLoadingText}>Initializing camera...</Text>
          </View>
        )}
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
                icon={() => (
                  <Icon
                    source={option.icon}
                    size={16}
                    color={
                      selectedView === option.value
                        ? AppColors.onPrimary
                        : AppColors.onSurface
                    }
                  />
                )}
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
              isCapturing && styles.captureButtonDisabled,
            ]}
            onPress={handleCapture}
            disabled={isCapturing || !cameraReady}
          >
            {isCapturing ? (
              <ActivityIndicator size="large" color={AppColors.surface} />
            ) : (
              <View style={styles.captureButtonInner}>
                <Icon source="camera" size={32} color={AppColors.surface} />
              </View>
            )}
          </Pressable>

          <Text style={styles.captureHint}>
            {isCapturing
              ? 'Capturing...'
              : `Tap to capture ${VIEW_LABEL_OPTIONS.find(v => v.value === selectedView)?.label} view`}
          </Text>
        </View>
      </View>

      {/* Snackbar for capture feedback */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={[
          styles.snackbar,
          { backgroundColor: lastCaptureSuccess ? AppColors.primaryDark : AppColors.warning },
        ]}
        action={{
          label: 'View',
          onPress: handleViewSession,
        }}
      >
        {snackbarMessage}
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
    backgroundColor: '#000',
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  cameraLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLoadingText: {
    color: AppColors.surface,
    marginTop: AppSpacing.md,
    fontSize: 14,
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
  overlayBottom: {
    position: 'absolute',
    bottom: AppSpacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
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
  guideFrame: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: '10%',
    bottom: '25%',
  },
  guideCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  guideTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  guideTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  guideBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  guideBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  currentViewBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppBorderRadius.xl,
  },
  currentViewText: {
    color: AppColors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.xl,
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.onBackground,
    marginTop: AppSpacing.lg,
    marginBottom: AppSpacing.sm,
  },
  permissionText: {
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: AppSpacing.lg,
  },
  permissionButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: AppSpacing.xl,
    paddingVertical: AppSpacing.md,
    borderRadius: AppBorderRadius.xl,
  },
  permissionButtonText: {
    color: AppColors.onPrimary,
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: AppSpacing.md,
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
    fontSize: 12,
  },
  viewChipTextSelected: {
    color: AppColors.onPrimary,
  },
  captureArea: {
    alignItems: 'center',
    paddingVertical: AppSpacing.sm,
  },
  frameCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.sm,
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
  captureButtonDisabled: {
    backgroundColor: AppColors.disabled,
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
    marginTop: AppSpacing.sm,
  },
  snackbar: {
    marginBottom: 100,
  },
});
