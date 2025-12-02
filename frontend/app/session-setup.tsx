// VETRA Depth Recorder - Session Setup Screen
// Create a new capture session with optional animal ID and notes

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../src/context/SessionContext';
import { AppColors, AppSpacing, AppBorderRadius, AppShadow } from '../src/theme/appTheme';

export default function SessionSetupScreen() {
  const router = useRouter();
  const { startNewSession } = useSession();
  
  const [animalId, setAnimalId] = useState('');
  const [notes, setNotes] = useState('');

  const handleCancel = () => {
    router.back();
  };

  const handleStartCapture = () => {
    // Create new session with provided data
    startNewSession(
      animalId.trim() || undefined,
      notes.trim() || undefined
    );
    
    // Navigate to capture screen
    router.push('/capture');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Info Header */}
          <View style={styles.infoHeader}>
            <Icon source="clipboard-text-outline" size={48} color={AppColors.primary} />
            <Text style={styles.infoTitle}>Setup Your Session</Text>
            <Text style={styles.infoSubtitle}>
              Add optional details to help identify this capture session later.
            </Text>
          </View>

          {/* Form Card */}
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Session Details</Text>
              
              {/* Animal ID Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Animal ID</Text>
                <TextInput
                  mode="outlined"
                  placeholder="e.g., COW-001, TAG-2024-0523"
                  value={animalId}
                  onChangeText={setAnimalId}
                  style={styles.textInput}
                  outlineStyle={styles.textInputOutline}
                  left={<TextInput.Icon icon="tag" />}
                />
                <Text style={styles.inputHint}>
                  Optional - Enter an identifier for the animal being captured
                </Text>
              </View>

              {/* Notes Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  mode="outlined"
                  placeholder="Add any additional notes about this session..."
                  value={notes}
                  onChangeText={setNotes}
                  style={[styles.textInput, styles.multilineInput]}
                  outlineStyle={styles.textInputOutline}
                  multiline
                  numberOfLines={4}
                  left={<TextInput.Icon icon="note-text" />}
                />
                <Text style={styles.inputHint}>
                  Optional - Location, conditions, purpose, etc.
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Session Info Card */}
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.sessionInfoRow}>
                <Icon source="clock-outline" size={20} color={AppColors.onSurfaceVariant} />
                <Text style={styles.sessionInfoText}>
                  Session will start with timestamp: {new Date().toLocaleString()}
                </Text>
              </View>
              <View style={styles.sessionInfoRow}>
                <Icon source="camera" size={20} color={AppColors.onSurfaceVariant} />
                <Text style={styles.sessionInfoText}>
                  You can capture multiple frames from different angles
                </Text>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={styles.bottomContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.cancelButtonLabel}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleStartCapture}
            style={styles.startButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.startButtonLabel}
            icon="camera"
          >
            Start Capture
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: AppSpacing.md,
    paddingBottom: 120,
  },
  infoHeader: {
    alignItems: 'center',
    paddingVertical: AppSpacing.lg,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: AppColors.onBackground,
    marginTop: AppSpacing.md,
    marginBottom: AppSpacing.xs,
  },
  infoSubtitle: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.onSurface,
    marginBottom: AppSpacing.md,
  },
  inputContainer: {
    marginBottom: AppSpacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.onSurface,
    marginBottom: AppSpacing.sm,
  },
  textInput: {
    backgroundColor: AppColors.surface,
  },
  textInputOutline: {
    borderRadius: AppBorderRadius.md,
  },
  multilineInput: {
    minHeight: 100,
  },
  inputHint: {
    fontSize: 12,
    color: AppColors.onSurfaceVariant,
    marginTop: AppSpacing.xs,
    marginLeft: AppSpacing.xs,
  },
  sessionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: AppSpacing.sm,
  },
  sessionInfoText: {
    flex: 1,
    fontSize: 13,
    color: AppColors.onSurfaceVariant,
    marginLeft: AppSpacing.sm,
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
  cancelButton: {
    flex: 1,
    borderRadius: AppBorderRadius.xl,
    borderColor: AppColors.primary,
    borderWidth: 2,
  },
  startButton: {
    flex: 2,
    borderRadius: AppBorderRadius.xl,
    backgroundColor: AppColors.primary,
  },
  buttonContent: {
    height: 52,
  },
  cancelButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.primary,
  },
  startButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
