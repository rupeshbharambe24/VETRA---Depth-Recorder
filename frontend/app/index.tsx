// VETRA Depth Recorder - Device Check Screen
// Entry point that checks device capabilities (mocked for now)

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppColors, AppSpacing, AppBorderRadius, AppShadow } from '../src/theme/appTheme';

interface StatusItemProps {
  label: string;
  status: 'unknown' | 'supported' | 'unsupported';
  icon: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ label, status, icon }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'supported':
        return AppColors.success;
      case 'unsupported':
        return AppColors.error;
      default:
        return AppColors.placeholder;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'supported':
        return 'Supported';
      case 'unsupported':
        return 'Not Supported';
      default:
        return 'Unknown (will be checked later)';
    }
  };

  return (
    <View style={styles.statusItem}>
      <View style={styles.statusIconContainer}>
        <Icon source={icon} size={28} color={AppColors.primary} />
      </View>
      <View style={styles.statusTextContainer}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={[styles.statusValue, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
};

export default function DeviceCheckScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/session-setup');
  };

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
            Capture ARCore RGB + Depth frames for 3D reconstruction
          </Text>
        </View>

        {/* Device Capabilities Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Device Capabilities</Text>
            <Text style={styles.cardDescription}>
              Checking your device's compatibility with ARCore depth capture.
            </Text>
            
            <View style={styles.statusList}>
              <StatusItem
                label="ARCore Support"
                status="unknown"
                icon="augmented-reality"
              />
              <View style={styles.divider} />
              <StatusItem
                label="Depth API Support"
                status="unknown"
                icon="axis-z-arrow"
              />
            </View>

            <View style={styles.noteContainer}>
              <Icon source="information" size={20} color={AppColors.info} />
              <Text style={styles.noteText}>
                Device capabilities will be verified when ARCore integration is enabled in a future update.
              </Text>
            </View>
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
                <Text style={styles.instructionText}>Create a new capture session</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>2</Text>
                </View>
                <Text style={styles.instructionText}>Select view angle and capture frames</Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>3</Text>
                </View>
                <Text style={styles.instructionText}>Review and export session data</Text>
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
        >
          Continue
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
    paddingVertical: AppSpacing.xl,
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
    alignItems: 'center',
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
  statusValue: {
    fontSize: 13,
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
    alignItems: 'center',
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
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.onSurface,
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
