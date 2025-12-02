// VETRA Depth Recorder - FrameCapture Model
// Represents a single captured frame with RGB and metadata

export type ViewLabel = 'left_side' | 'right_side' | 'front' | 'rear' | 'other';

export interface FrameCapture {
  id: string;
  viewLabel: ViewLabel;
  timestamp: Date;
  imagePath: string | null;  // Local file path to RGB image
  metaPath: string | null;   // Local file path to JSON metadata
  
  // TODO: ARCore fields to be added in Step 2/3
  // depthPath?: string;       // Local file path to depth data
  // confidencePath?: string;  // Local file path to confidence map
  // intrinsics?: CameraIntrinsics;
  // pose?: CameraPose;
}

// TODO: Camera intrinsics for ARCore (Step 2/3)
// export interface CameraIntrinsics {
//   fx: number;  // Focal length x
//   fy: number;  // Focal length y
//   cx: number;  // Principal point x
//   cy: number;  // Principal point y
//   width: number;
//   height: number;
// }

// TODO: Camera pose for ARCore (Step 2/3)
// export interface CameraPose {
//   position: { x: number; y: number; z: number };
//   rotation: { x: number; y: number; z: number; w: number };  // Quaternion
//   timestamp: number;
// }

export const VIEW_LABEL_OPTIONS: { label: string; value: ViewLabel }[] = [
  { label: 'Left Side', value: 'left_side' },
  { label: 'Right Side', value: 'right_side' },
  { label: 'Front', value: 'front' },
  { label: 'Rear', value: 'rear' },
  { label: 'Other', value: 'other' },
];

export const createMockFrameCapture = (viewLabel: ViewLabel): FrameCapture => {
  return {
    id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    viewLabel,
    timestamp: new Date(),
    imagePath: null,  // Will be filled when real capture is implemented
    metaPath: null,   // Will be filled when real capture is implemented
  };
};
