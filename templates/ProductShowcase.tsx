import { AbsoluteFill, Img, useCurrentFrame, interpolate } from 'remotion';

export type ProductShowcaseProps = {
  title: string;
  images: string[];
  description: string;
};

export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  title,
  images,
  description,
}) => {
  const frame = useCurrentFrame();

  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });

  // Zoom animation for images
  const scale = interpolate(frame, [0, 60], [1.1, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill className="bg-gradient-to-br from-gray-900 to-black">
      <div
        style={{
          opacity,
          transform: `scale(${scale})`,
        }}
        className="flex h-full flex-col items-center justify-center p-16"
      >
        {/* Title */}
        <h1 className="mb-8 text-6xl font-bold text-white">{title}</h1>

        {/* Product Images */}
        {images.length > 0 && (
          <div className="mb-8">
            <Img
              src={images[0]}
              className="max-h-[600px] rounded-lg shadow-2xl"
            />
          </div>
        )}

        {/* Description */}
        <p className="max-w-3xl text-center text-2xl text-gray-300">
          {description}
        </p>
      </div>
    </AbsoluteFill>
  );
};
