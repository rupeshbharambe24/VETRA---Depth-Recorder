// VETRA Depth Recorder - FrameCapture Model
// Represents a single captured frame with RGB, pose, and metadata

export type ViewLabel = 'left_side' | 'right_side' | 'front' | 'rear' | 'top' | 'other';

export interface CameraIntrinsics {
  fx: number;  // Focal length x
  fy: number;  // Focal length y
  cx: number;  // Principal point x
  cy: number;  // Principal point y
  imageWidth: number;
  imageHeight: number;
}

export interface CameraPose {
  // Quaternion representation (x, y, z, w)
  quaternion: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  // Translation in meters
  translation: {
    x: number;
    y: number;
    z: number;
  };
  // 4x4 transformation matrix (row-major, 16 floats)
  transformMatrix4x4: number[];
}

export interface DepthInfo {
  available: boolean;
  path: string | null;
  width: number | null;
  height: number | null;
  format: string | null; // 'uint16', 'float32', etc.
  units: string | null;  // 'millimeters', 'meters'
}

export interface FrameCapture {
  id: string;
  viewLabel: ViewLabel;
  timestamp: Date;
  
  // File paths
  imagePath: string | null;  // Local file path to RGB image
  metaPath: string | null;   // Local file path to JSON metadata
  depthPath: string | null;  // Local file path to depth data (if available)
  
  // Camera data
  intrinsics: CameraIntrinsics | null;
  pose: CameraPose | null;
  
  // Depth info
  depth: DepthInfo | null;
  
  // Image dimensions
  imageWidth: number | null;
  imageHeight: number | null;
  
  // Capture status
  isMock: boolean;
}

export const VIEW_LABEL_OPTIONS: { label: string; value: ViewLabel; icon: string }[] = [
  { label: 'Left Side', value: 'left_side', icon: 'arrow-left-circle' },
  { label: 'Right Side', value: 'right_side', icon: 'arrow-right-circle' },
  { label: 'Front', value: 'front', icon: 'arrow-up-circle' },
  { label: 'Rear', value: 'rear', icon: 'arrow-down-circle' },
  { label: 'Top', value: 'top', icon: 'chevron-double-up' },
  { label: 'Other', value: 'other', icon: 'dots-horizontal-circle' },
];

export const createMockFrameCapture = (viewLabel: ViewLabel): FrameCapture => {
  return {
    id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    viewLabel,
    timestamp: new Date(),
    imagePath: null,
    metaPath: null,
    depthPath: null,
    intrinsics: null,
    pose: null,
    depth: null,
    imageWidth: null,
    imageHeight: null,
    isMock: true,
  };
};

export const createRealFrameCapture = (
  frameId: string,
  viewLabel: ViewLabel,
  imagePath: string,
  metaPath: string,
  intrinsics: CameraIntrinsics,
  pose: CameraPose,
  imageWidth: number,
  imageHeight: number,
  depth?: DepthInfo
): FrameCapture => {
  return {
    id: frameId,
    viewLabel,
    timestamp: new Date(),
    imagePath,
    metaPath,
    depthPath: depth?.path || null,
    intrinsics,
    pose,
    depth: depth || {
      available: false,
      path: null,
      width: null,
      height: null,
      format: null,
      units: null,
    },
    imageWidth,
    imageHeight,
    isMock: false,
  };
};
