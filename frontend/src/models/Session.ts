// VETRA Depth Recorder - Session Model
// Represents a capture session containing multiple frames

import { FrameCapture } from './FrameCapture';

export interface Session {
  id: string;
  animalId: string | null;
  notes: string | null;
  createdAt: Date;
  frames: FrameCapture[];
}

export const createNewSession = (animalId?: string, notes?: string): Session => {
  return {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    animalId: animalId || null,
    notes: notes || null,
    createdAt: new Date(),
    frames: [],
  };
};

export const getSessionSummary = (session: Session) => {
  const viewCounts: Record<string, number> = {};
  
  session.frames.forEach(frame => {
    viewCounts[frame.viewLabel] = (viewCounts[frame.viewLabel] || 0) + 1;
  });
  
  return {
    totalFrames: session.frames.length,
    viewCounts,
    duration: session.frames.length > 0
      ? new Date().getTime() - session.createdAt.getTime()
      : 0,
  };
};
