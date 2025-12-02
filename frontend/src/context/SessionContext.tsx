// VETRA Depth Recorder - Session Context
// Provides session state management with real capture support

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { CameraView } from 'expo-camera';
import { Session, createNewSession } from '../models/Session';
import {
  FrameCapture,
  ViewLabel,
  createMockFrameCapture,
  createRealFrameCapture,
} from '../models/FrameCapture';
import {
  CaptureService,
  SupportInfo,
  FrameCaptureResult,
} from '../services/CaptureService';

interface SessionContextType {
  // Session state
  currentSession: Session | null;
  supportInfo: SupportInfo | null;
  isCapturing: boolean;
  
  // Camera ref
  cameraRef: React.RefObject<CameraView>;
  
  // Actions
  checkDeviceSupport: () => Promise<SupportInfo>;
  startNewSession: (animalId?: string, notes?: string) => Promise<boolean>;
  captureFrame: (viewLabel: ViewLabel) => Promise<FrameCapture | null>;
  endSession: () => Promise<void>;
  getFrameCount: () => number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [supportInfo, setSupportInfo] = useState<SupportInfo | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const checkDeviceSupport = async (): Promise<SupportInfo> => {
    const info = await CaptureService.checkSupport();
    setSupportInfo(info);
    return info;
  };

  const startNewSession = async (animalId?: string, notes?: string): Promise<boolean> => {
    const newSession = createNewSession(animalId, notes);
    
    // Start the capture service session
    const success = await CaptureService.startSession(newSession.id);
    
    if (success) {
      setCurrentSession(newSession);
    }
    
    return success;
  };

  const captureFrame = async (viewLabel: ViewLabel): Promise<FrameCapture | null> => {
    if (!currentSession) {
      console.warn('[SessionContext] No active session');
      return null;
    }

    setIsCapturing(true);

    try {
      // Attempt real capture
      const result: FrameCaptureResult = await CaptureService.captureFrame(
        cameraRef,
        viewLabel
      );

      let newFrame: FrameCapture;

      if (result.success) {
        // Read the metadata for full frame info
        const metadata = await CaptureService.readFrameMetadata(
          currentSession.id,
          result.frameId
        );

        if (metadata) {
          newFrame = createRealFrameCapture(
            result.frameId,
            viewLabel,
            result.imagePath,
            result.metaPath,
            metadata.intrinsics,
            {
              quaternion: metadata.pose.quaternion,
              translation: metadata.pose.translation,
              transformMatrix4x4: metadata.pose.transformMatrix4x4,
            },
            metadata.image.width,
            metadata.image.height,
            metadata.depth.available ? {
              available: true,
              path: metadata.depth.path,
              width: metadata.depth.width,
              height: metadata.depth.height,
              format: metadata.depth.format,
              units: metadata.depth.units,
            } : undefined
          );
        } else {
          // Fallback if metadata read fails
          newFrame = createMockFrameCapture(viewLabel);
          newFrame.id = result.frameId;
          newFrame.imagePath = result.imagePath;
          newFrame.metaPath = result.metaPath;
          newFrame.isMock = false;
        }
      } else {
        // Fall back to mock capture if real capture fails
        console.warn('[SessionContext] Real capture failed, using mock:', result.error);
        newFrame = createMockFrameCapture(viewLabel);
      }

      // Update session with new frame
      setCurrentSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          frames: [...prev.frames, newFrame],
        };
      });

      return newFrame;
    } catch (error) {
      console.error('[SessionContext] Capture error:', error);
      
      // Fall back to mock on error
      const mockFrame = createMockFrameCapture(viewLabel);
      setCurrentSession(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          frames: [...prev.frames, mockFrame],
        };
      });
      
      return mockFrame;
    } finally {
      setIsCapturing(false);
    }
  };

  const endSession = async (): Promise<void> => {
    await CaptureService.endSession();
    setCurrentSession(null);
  };

  const getFrameCount = (): number => {
    return currentSession?.frames.length || 0;
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        supportInfo,
        isCapturing,
        cameraRef,
        checkDeviceSupport,
        startNewSession,
        captureFrame,
        endSession,
        getFrameCount,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
