import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { ImageScene } from '../components/ImageScene';
import { SubtitleOverlay } from '../components/SubtitleOverlay';
import { TextOverlay } from '../components/TextOverlay';

export interface PromotionalVideoProps {
  images: string[];
  audio: {
    url: string;
    type: 'voiceover' | 'ambient';
  };
  captions?: any[] | null;
  transitions: 'fade' | 'slide' | 'zoom';
  textOverlay: {
    title?: string;
    subtitle?: string;
    cta?: string;
  };
  duration: number;
}

export const PromotionalVideo: React.FC<PromotionalVideoProps> = ({
  images,
  audio,
  captions,
  transitions,
  textOverlay,
  duration,
}) => {
  const { fps } = useVideoConfig();
  const durationInFrames = duration * fps;

  // Calculate frames per image
  const framesPerImage = Math.floor(durationInFrames / images.length);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* Audio Track */}
      {audio.url && (
        <Audio src={audio.url} volume={audio.type === 'ambient' ? 0.6 : 1.0} />
      )}

      {/* Image Scenes */}
      {images.map((imageUrl, index) => (
        <Sequence
          key={index}
          from={index * framesPerImage}
          durationInFrames={framesPerImage}
        >
          <ImageScene
            imageUrl={imageUrl}
            transition={transitions}
            duration={framesPerImage}
          />
        </Sequence>
      ))}

      {/* Text Overlays */}
      {textOverlay.title && (
        <Sequence from={0} durationInFrames={fps * 3}>
          <TextOverlay
            text={textOverlay.title}
            position="top"
            animation="fadeIn"
          />
        </Sequence>
      )}

      {textOverlay.subtitle && (
        <Sequence from={fps * 3} durationInFrames={durationInFrames - fps * 6}>
          <TextOverlay
            text={textOverlay.subtitle}
            position="center"
            animation="none"
          />
        </Sequence>
      )}

      {textOverlay.cta && (
        <Sequence from={durationInFrames - fps * 3} durationInFrames={fps * 3}>
          <TextOverlay
            text={textOverlay.cta}
            position="bottom"
            animation="fadeIn"
          />
        </Sequence>
      )}

      {/* Subtitles (if captions available) */}
      {captions && captions.length > 0 && (
        <SubtitleOverlay captions={captions} fps={fps} />
      )}
    </AbsoluteFill>
  );
};
