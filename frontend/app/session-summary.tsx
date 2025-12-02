// VETRA Depth Recorder - Session Summary Screen
// Display captured frames with real capture data

import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, Icon, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../src/context/SessionContext';
import { FrameCapture, VIEW_LABEL_OPTIONS } from '../src/models/FrameCapture';
import { getSessionSummary } from '../src/models/Session';
import { AppColors, AppSpacing, AppBorderRadius, AppShadow } from '../src/theme/appTheme';

const getViewLabelDisplay = (value: string): string => {
  return VIEW_LABEL_OPTIONS.find(v => v.value === value)?.label || value;
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

interface FrameItemProps {
  frame: FrameCapture;
  index: number;
}

const FrameItem: React.FC<FrameItemProps> = ({ frame, index }) => {
  const hasRealImage = frame.imagePath && !frame.isMock;
  
  return (
    <View style={styles.frameItem}>
      <View style={styles.frameIndex}>
        <Text style={styles.frameIndexText}>{index + 1}</Text>
      </View>
      
      {/* Thumbnail */}
      <View style={styles.frameThumbnail}>
        {hasRealImage ? (
          <Image
            source={{ uri: frame.imagePath || undefined }}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        ) : (
          <Icon source="image" size={24} color={AppColors.placeholder} />
        )}
      </View>
      
      {/* Frame Info */}
      <View style={styles.frameInfo}>
        <Text style={styles.frameViewLabel}>{getViewLabelDisplay(frame.viewLabel)}</Text>
        <Text style={styles.frameTimestamp}>{formatTime(frame.timestamp)}</Text>
        <View style={styles.frameMetaRow}>
          {frame.isMock ? (
            <View style={styles.mockBadge}>
              <Text style={styles.mockBadgeText}>Mock</Text>
            </View>
          ) : (
            <View style={styles.realBadge}>
              <Icon source="check" size={12} color={AppColors.success} />
              <Text style={styles.realBadgeText}>Real</Text>
            </View>
          )}
          {frame.imageWidth && frame.imageHeight && (
            <Text style={styles.frameDimensions}>
              {frame.imageWidth}x{frame.imageHeight}
            </Text>
          )}
        </View>
      </View>
      
      {/* Status Icon */}
      <View style={styles.frameStatus}>
        <Icon
          source={frame.isMock ? 'alert-circle-outline' : 'check-circle'}
          size={20}
          color={frame.isMock ? AppColors.warning : AppColors.success}
        />
      </View>
    </View>
  );
};

export default function SessionSummaryScreen() {
  const router = useRouter();
  const { currentSession, endSession } = useSession();

  if (!currentSession) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Icon source="alert-circle" size={64} color={AppColors.warning} />
          <Text style={styles.emptyText}>No active session</Text>
          <Button
            mode="contained"
            onPress={() => router.replace('/')}
            style={styles.emptyButton}
          >
            Go Home
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const summary = getSessionSummary(currentSession);
  const realFrames = currentSession.frames.filter(f => !f.isMock).length;
  const mockFrames = currentSession.frames.filter(f => f.isMock).length;

  const handleBackToCapture = () => {
    router.back();
  };

  const handleFinishSession = async () => {
    await endSession();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Session Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon source="clipboard-check" size={28} color={AppColors.primary} />
              <Text style={styles.cardTitle}>Session Details</Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Animal ID</Text>
                <Text style={styles.detailValue}>
                  {currentSession.animalId || 'Not specified'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Created</Text>
                <Text style={styles.detailValue}>
                  {formatDate(currentSession.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Session ID</Text>
                <Text style={styles.detailValueSmall} numberOfLines={1}>
                  {currentSession.id}
                </Text>
              </View>
            </View>

            {currentSession.notes && (
              <View style={styles.notesContainer}>
                <Text style={styles.detailLabel}>Notes</Text>
                <Text style={styles.notesText}>{currentSession.notes}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Statistics Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon source="chart-bar" size={28} color={AppColors.secondary} />
              <Text style={styles.cardTitle}>Capture Statistics</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{summary.totalFrames}</Text>
                <Text style={styles.statLabel}>Total Frames</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: AppColors.success }]}>
                  {realFrames}
                </Text>
                <Text style={styles.statLabel}>Real Captures</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: AppColors.warning }]}>
                  {mockFrames}
                </Text>
                <Text style={styles.statLabel}>Mock Frames</Text>
              </View>
            </View>

            {Object.keys(summary.viewCounts).length > 0 && (
              <View style={styles.viewBreakdown}>
                <Text style={styles.breakdownTitle}>Frames by View</Text>
                <View style={styles.breakdownList}>
                  {Object.entries(summary.viewCounts).map(([view, count]) => (
                    <View key={view} style={styles.breakdownItem}>
                      <Text style={styles.breakdownLabel}>
                        {getViewLabelDisplay(view)}
                      </Text>
                      <View style={styles.breakdownBadge}>
                        <Text style={styles.breakdownCount}>{count}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Frames List Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Icon source="image-multiple" size={28} color={AppColors.primary} />
              <Text style={styles.cardTitle}>Captured Frames</Text>
            </View>

            {currentSession.frames.length === 0 ? (
              <View style={styles.emptyFrames}>
                <Icon source="camera-off" size={40} color={AppColors.placeholder} />
                <Text style={styles.emptyFramesText}>No frames captured yet</Text>
              </View>
            ) : (
              <View style={styles.framesList}>
                {currentSession.frames.map((frame, index) => (
                  <React.Fragment key={frame.id}>
                    <FrameItem frame={frame} index={index} />
                    {index < currentSession.frames.length - 1 && (
                      <Divider style={styles.frameDivider} />
                    )}
                  </React.Fragment>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Data Location Info */}
        {realFrames > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Icon source="folder" size={28} color={AppColors.info} />
                <Text style={styles.cardTitle}>Data Location</Text>
              </View>
              <Text style={styles.dataLocationText}>
                Captured data is saved to the app's document directory under:
              </Text>
              <View style={styles.pathContainer}>
                <Text style={styles.pathText}>
                  VETRA_DATA/session_{currentSession.id}/
                </Text>
              </View>
              <Text style={styles.dataFormatText}>
                Each frame contains: rgb.jpg + meta.json
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <Button
          mode="outlined"
          onPress={handleBackToCapture}
          style={styles.backButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.backButtonLabel}
          icon="camera-plus"
        >
          Add More
        </Button>
        <Button
          mode="contained"
          onPress={handleFinishSession}
          style={styles.finishButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.finishButtonLabel}
          icon="check"
        >
          Finish
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
    paddingBottom: 120,
  },
  card: {
    marginBottom: AppSpacing.md,
    borderRadius: AppBorderRadius.lg,
    backgroundColor: AppColors.surface,
    ...AppShadow.light,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.onSurface,
    marginLeft: AppSpacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: AppSpacing.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    marginBottom: AppSpacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '500',
    color: AppColors.onSurface,
  },
  detailValueSmall: {
    fontSize: 12,
    fontWeight: '500',
    color: AppColors.onSurface,
    fontFamily: 'monospace',
  },
  notesContainer: {
    marginTop: AppSpacing.sm,
    padding: AppSpacing.md,
    backgroundColor: AppColors.surfaceVariant,
    borderRadius: AppBorderRadius.md,
  },
  notesText: {
    fontSize: 14,
    color: AppColors.onSurface,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: AppSpacing.md,
    gap: AppSpacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: AppSpacing.md,
    backgroundColor: AppColors.surfaceVariant,
    borderRadius: AppBorderRadius.md,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.onSurfaceVariant,
    marginTop: AppSpacing.xs,
    textAlign: 'center',
  },
  viewBreakdown: {
    marginTop: AppSpacing.sm,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.onSurfaceVariant,
    marginBottom: AppSpacing.sm,
  },
  breakdownList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: AppSpacing.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surfaceVariant,
    paddingHorizontal: AppSpacing.md,
    paddingVertical: AppSpacing.sm,
    borderRadius: AppBorderRadius.lg,
  },
  breakdownLabel: {
    fontSize: 13,
    color: AppColors.onSurface,
    marginRight: AppSpacing.sm,
  },
  breakdownBadge: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: AppSpacing.sm,
    paddingVertical: 2,
    borderRadius: AppBorderRadius.sm,
  },
  breakdownCount: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.onPrimary,
  },
  framesList: {
    backgroundColor: AppColors.surfaceVariant,
    borderRadius: AppBorderRadius.md,
    overflow: 'hidden',
  },
  frameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: AppSpacing.md,
  },
  frameIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppSpacing.sm,
  },
  frameIndexText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.onPrimary,
  },
  frameThumbnail: {
    width: 48,
    height: 48,
    borderRadius: AppBorderRadius.sm,
    backgroundColor: AppColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: AppSpacing.md,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  frameInfo: {
    flex: 1,
  },
  frameViewLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.onSurface,
  },
  frameTimestamp: {
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    marginTop: 2,
  },
  frameMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: AppSpacing.sm,
  },
  mockBadge: {
    backgroundColor: AppColors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: AppColors.onSecondary,
  },
  realBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  realBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: AppColors.success,
    marginLeft: 2,
  },
  frameDimensions: {
    fontSize: 10,
    color: AppColors.onSurfaceVariant,
    fontFamily: 'monospace',
  },
  frameStatus: {
    marginLeft: AppSpacing.sm,
  },
  frameDivider: {
    backgroundColor: AppColors.divider,
  },
  emptyFrames: {
    alignItems: 'center',
    padding: AppSpacing.xl,
  },
  emptyFramesText: {
    fontSize: 14,
    color: AppColors.onSurfaceVariant,
    marginTop: AppSpacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: AppSpacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: AppColors.onSurfaceVariant,
    marginTop: AppSpacing.md,
    marginBottom: AppSpacing.lg,
  },
  emptyButton: {
    borderRadius: AppBorderRadius.xl,
  },
  dataLocationText: {
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    marginBottom: AppSpacing.sm,
  },
  pathContainer: {
    backgroundColor: AppColors.surfaceVariant,
    padding: AppSpacing.sm,
    borderRadius: AppBorderRadius.sm,
    marginBottom: AppSpacing.sm,
  },
  pathText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: AppColors.onSurface,
  },
  dataFormatText: {
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: AppSpacing.md,
    backgroundColor: AppColors.background,
    borderTopWidth: 1,
    borderTopColor: AppColors.divider,
    gap: AppSpacing.md,
  },
  backButton: {
    flex: 1,
    borderRadius: AppBorderRadius.xl,
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  finishButton: {
    flex: 1,
    borderRadius: AppBorderRadius.xl,
    backgroundColor: AppColors.primary,
  },
  buttonContent: {
    height: 52,
  },
  backButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  finishButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
