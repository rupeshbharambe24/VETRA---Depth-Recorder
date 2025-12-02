// VETRA Depth Recorder - Session Context
// Provides session state management across the app

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Session, createNewSession } from '../models/Session';
import { FrameCapture, ViewLabel, createMockFrameCapture } from '../models/FrameCapture';

interface SessionContextType {
  currentSession: Session | null;
  startNewSession: (animalId?: string, notes?: string) => void;
  addFrame: (viewLabel: ViewLabel) => FrameCapture;
  endSession: () => void;
  getFrameCount: () => number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  const startNewSession = (animalId?: string, notes?: string) => {
    const newSession = createNewSession(animalId, notes);
    setCurrentSession(newSession);
  };

  const addFrame = (viewLabel: ViewLabel): FrameCapture => {
    const newFrame = createMockFrameCapture(viewLabel);
    
    setCurrentSession(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        frames: [...prev.frames, newFrame],
      };
    });
    
    return newFrame;
  };

  const endSession = () => {
    setCurrentSession(null);
  };

  const getFrameCount = (): number => {
    return currentSession?.frames.length || 0;
  };

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        startNewSession,
        addFrame,
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
