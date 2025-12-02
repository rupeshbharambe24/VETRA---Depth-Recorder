// VETRA Depth Recorder - Device Check Screen
// Entry point that checks device capabilities

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../src/context/SessionContext';
import { AppColors, AppSpacing, AppBorderRadius, AppShadow } from '../src/theme/appTheme';

type SupportStatus = 'checking' | 'supported' | 'partial' | 'unsupported';

interface StatusItemProps {
  label: string;
  status: SupportStatus;
  icon: string;
  detail?: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, status, icon, detail }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'supported':
        return AppColors.success;
      case 'partial':
        return AppColors.warning;
      case 'unsupported':
        return AppColors.error;
      default:
        return AppColors.placeholder;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'supported':
        return 'Available';
      case 'partial':
        return 'Partial Support';
      case 'unsupported':
        return 'Not Available';
      default:
        return 'Checking...';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'supported':
        return 'check-circle';
      case 'partial':
        return 'alert-circle';
      case 'unsupported':
        return 'close-circle';
      default:
        return 'progress-clock';
    }
  };

  return (
    <View style={styles.statusItem}>
      <View style={styles.statusIconContainer}>
        <Icon source={icon} size={28} color={AppColors.primary} />
      </View>
      <View style={styles.statusTextContainer}>
        <Text style={styles.statusLabel}>{label}</Text>
        <View style={styles.statusRow}>
          {status === 'checking' ? (
            <ActivityIndicator size="small" color={AppColors.primary} />
          ) : (
            <Icon source={getStatusIcon()} size={16} color={getStatusColor()} />
          )}
          <Text style={[styles.statusValue, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
        {detail && <Text style={styles.statusDetail}>{detail}</Text>}
      </View>
    </View>
  );
};

export default function DeviceCheckScreen() {
  const router = useRouter();
  const { checkDeviceSupport, supportInfo } = useSession();
  
  const [cameraStatus, setCameraStatus] = useState<SupportStatus>('checking');
  const [sensorStatus, setSensorStatus] = useState<SupportStatus>('checking');
  const [depthStatus, setDepthStatus] = useState<SupportStatus>('checking');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const checkSupport = async () => {
      try {
        const info = await checkDeviceSupport();
        
        setCameraStatus(info.cameraAvailable ? 'supported' : 'unsupported');
        setSensorStatus(info.sensorsAvailable ? 'supported' : 'partial');
        setDepthStatus(info.depthSupported ? 'supported' : 'partial');
        setStatusMessage(info.message);
      } catch (error) {
        setCameraStatus('unsupported');
        setSensorStatus('unsupported');
        setDepthStatus('unsupported');
        setStatusMessage('Failed to check device capabilities');
      }
    };

    checkSupport();
  }, [checkDeviceSupport]);

  const handleContinue = () => {
    router.push('/session-setup');
  };

  const isReady = cameraStatus !== 'checking' && sensorStatus !== 'checking';
  const canProceed = cameraStatus === 'supported';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon source="cube-scan" size={64} color={AppColors.primary} />
          </View>
          <Text style={styles.appTitle}>VETRA Depth Recorder</Text>
          <Text style={styles.appSubtitle}>
            Capture RGB + Depth frames for 3D reconstruction
          </Text>
        </View>

        {/* Device Capabilities Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Device Capabilities</Text>
            <Text style={styles.cardDescription}>
              Checking your device's compatibility with capture features.
            </Text>

            <View style={styles.statusList}>
              <StatusItem
                label="Camera"
                status={cameraStatus}
                icon="camera"
                detail="Required for RGB capture"
              />
              <View style={styles.divider} />
              <StatusItem
                label="Motion Sensors"
                status={sensorStatus}
                icon="axis-arrow"
                detail="Used for pose estimation"
              />
              <View style={styles.divider} />
              <StatusItem
                label="Depth Capture"
                status={depthStatus}
                icon="axis-z-arrow"
                detail="Simulated (requires ARCore native)"
              />
            </View>

            {statusMessage && (
              <View style={styles.noteContainer}>
                <Icon source="information" size={20} color={AppColors.info} />
                <Text style={styles.noteText}>{statusMessage}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Instructions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>How It Works</Text>
            <View style={styles.instructionList}>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>1</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Create Session</Text>
                  <Text style={styles.instructionText}>Add animal ID and notes</Text>
                </View>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Capture Frames</Text>
                  <Text style={styles.instructionText}>Select angles and take photos</Text>
                </View>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>3</Text>
                </View>
                <View style={styles.instructionContent}>
                  <Text style={styles.instructionTitle}>Export Data</Text>
                  <Text style={styles.instructionText}>RGB + pose metadata saved</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Data Format Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Output Format</Text>
            <View style={styles.formatList}>
              <View style={styles.formatItem}>
                <Icon source="image" size={20} color={AppColors.primary} />
                <Text style={styles.formatText}>RGB images (JPEG)</Text>
              </View>
              <View style={styles.formatItem}>
                <Icon source="code-json" size={20} color={AppColors.primary} />
                <Text style={styles.formatText}>Metadata JSON (pose, intrinsics)</Text>
              </View>
              <View style={styles.formatItem}>
                <Icon source="folder" size={20} color={AppColors.primary} />
                <Text style={styles.formatText}>Organized by session/frame</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          style={styles.continueButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          icon="arrow-right"
          disabled={!isReady || !canProceed}
          loading={!isReady}
        >
          {isReady ? 'Continue' : 'Checking...'}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    padding: AppSpacing.md,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: AppSpacing.lg,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: AppBorderRadius.xl,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: AppSpacing.md,
    ...AppShadow.medium,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.onBackground,
    marginBottom: AppSpacing.xs,
  },
  appSubtitle: {
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: AppSpacing.lg,
  },
  card: {
    marginBottom: AppSpacing.md,
    borderRadius: AppBorderRadius.lg,
    backgroundColor: AppColors.surface,
    ...AppShadow.light,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.onSurface,
    marginBottom: AppSpacing.xs,
  },
  cardDescription: {
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    marginBottom: AppSpacing.md,
  },
  statusList: {
    backgroundColor: AppColors.surfaceVariant,
    borderRadius: AppBorderRadius.md,
    padding: AppSpacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: AppSpacing.sm,
  },
  statusIconContainer: {
    width: 48,
    height: 48,
    borderRadius: AppBorderRadius.md,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppSpacing.md,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: AppColors.onSurface,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusValue: {
    fontSize: 13,
    marginLeft: 4,
  },
  statusDetail: {
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.divider,
    marginVertical: AppSpacing.sm,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: AppSpacing.md,
    padding: AppSpacing.sm,
    backgroundColor: '#E3F2FD',
    borderRadius: AppBorderRadius.sm,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: AppColors.info,
    marginLeft: AppSpacing.sm,
    lineHeight: 18,
  },
  instructionList: {
    marginTop: AppSpacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: AppSpacing.md,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppSpacing.md,
  },
  instructionNumberText: {
    color: AppColors.onPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.onSurface,
  },
  instructionText: {
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    marginTop: 2,
  },
  formatList: {
    marginTop: AppSpacing.sm,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.sm,
  },
  formatText: {
    fontSize: 14,
    color: AppColors.onSurface,
    marginLeft: AppSpacing.sm,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: AppSpacing.md,
    backgroundColor: AppColors.background,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
  },
  continueButton: {
    borderRadius: AppBorderRadius.xl,
    backgroundColor: AppColors.primary,
  },
  buttonContent: {
    height: 52,
    flexDirection: 'row-reverse',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
