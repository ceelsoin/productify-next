import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

interface SubtitleOverlayProps {
  captions: Array<{
    text: string;
    timestamps: {
      from: number; // seconds
      to: number; // seconds
    };
  }>;
  fps: number;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  captions,
  fps,
}) => {
  const frame = useCurrentFrame();
  const currentTime = frame / fps;

  // Find current caption
  const currentCaption = captions.find(
    (caption) =>
      currentTime >= caption.timestamps.from &&
      currentTime <= caption.timestamps.to
  );

  if (!currentCaption) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 80,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: 8,
          fontSize: 32,
          fontWeight: 600,
          textAlign: 'center',
          maxWidth: '80%',
          lineHeight: 1.4,
        }}
      >
        {currentCaption.text}
      </div>
    </AbsoluteFill>
  );
};
