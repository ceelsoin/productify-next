import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

interface TextOverlayProps {
  text: string;
  position: 'top' | 'center' | 'bottom';
  animation: 'fadeIn' | 'slideUp' | 'none';
}

export const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  position,
  animation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animationDuration = fps * 1; // 1 second

  let opacity = 1;
  let translateY = 0;

  if (animation === 'fadeIn') {
    opacity = interpolate(frame, [0, animationDuration], [0, 1], {
      extrapolateRight: 'clamp',
    });
  } else if (animation === 'slideUp') {
    opacity = interpolate(frame, [0, animationDuration], [0, 1], {
      extrapolateRight: 'clamp',
    });
    translateY = interpolate(frame, [0, animationDuration], [50, 0], {
      extrapolateRight: 'clamp',
    });
  }

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      justifyContent: 'flex-start',
      paddingTop: 80,
    },
    center: {
      justifyContent: 'center',
    },
    bottom: {
      justifyContent: 'flex-end',
      paddingBottom: 160,
    },
  };

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        ...positionStyles[position],
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #d946ef 0%, #3b82f6 100%)',
          color: 'white',
          padding: '16px 32px',
          borderRadius: 12,
          fontSize: position === 'center' ? 48 : 36,
          fontWeight: 700,
          textAlign: 'center',
          maxWidth: '80%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
