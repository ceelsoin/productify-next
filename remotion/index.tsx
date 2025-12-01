import { Composition } from 'remotion';
import { PromotionalVideo } from './compositions/PromotionalVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PromotionalVideo"
        component={PromotionalVideo}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          images: [],
          audio: { url: '', type: 'voiceover' as const },
          captions: null,
          transitions: 'fade' as const,
          textOverlay: {},
          duration: 30,
        }}
      />
    </>
  );
};
