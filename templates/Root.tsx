import { Composition } from 'remotion';
import { ProductShowcase } from '@/templates/ProductShowcase';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Product Name',
          images: [],
          description: 'Your product description',
        }}
      />
    </>
  );
};
