import React from 'react';
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from 'remotion';

interface ImageSceneProps {
  imageUrl: string;
  transition: 'fade' | 'slide' | 'zoom';
  duration: number;
}

export const ImageScene: React.FC<ImageSceneProps> = ({
  imageUrl,
  transition,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Transition animations
  let opacity = 1;
  let scale = 1;
  let translateX = 0;

  const transitionDuration = fps * 0.5; // 0.5 seconds

  if (transition === 'fade') {
    // Fade in
    if (frame < transitionDuration) {
      opacity = interpolate(frame, [0, transitionDuration], [0, 1]);
    }
    // Fade out
    else if (frame > duration - transitionDuration) {
      opacity = interpolate(
        frame,
        [duration - transitionDuration, duration],
        [1, 0]
      );
    }
  } else if (transition === 'zoom') {
    // Zoom in
    if (frame < transitionDuration) {
      scale = interpolate(frame, [0, transitionDuration], [1.2, 1]);
      opacity = interpolate(frame, [0, transitionDuration], [0, 1]);
    }
    // Zoom out
    else if (frame > duration - transitionDuration) {
      scale = interpolate(
        frame,
        [duration - transitionDuration, duration],
        [1, 0.8]
      );
      opacity = interpolate(
        frame,
        [duration - transitionDuration, duration],
        [1, 0]
      );
    } else {
      // Subtle zoom during display
      scale = interpolate(
        frame,
        [transitionDuration, duration - transitionDuration],
        [1, 1.1]
      );
    }
  } else if (transition === 'slide') {
    // Slide in from right
    if (frame < transitionDuration) {
      translateX = interpolate(
        frame,
        [0, transitionDuration],
        [1920, 0],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      );
      opacity = interpolate(frame, [0, transitionDuration], [0, 1]);
    }
    // Slide out to left
    else if (frame > duration - transitionDuration) {
      translateX = interpolate(
        frame,
        [duration - transitionDuration, duration],
        [0, -1920]
      );
      opacity = interpolate(
        frame,
        [duration - transitionDuration, duration],
        [1, 0]
      );
    }
  }

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `scale(${scale}) translateX(${translateX}px)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Img
        src={imageUrl}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </AbsoluteFill>
  );
};
