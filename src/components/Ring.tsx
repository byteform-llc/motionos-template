import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface RingProps {
  delay: number;
  color: string;
  maxSize?: number;
}

export const Ring = ({ delay, color, maxSize = 600 }: RingProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame - delay, [0, fps * 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const size = interpolate(progress, [0, 1], [40, maxSize]);
  const opacity = interpolate(progress, [0, 0.15, 0.6, 1], [0, 0.5, 0.3, 0]);

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1.5px solid ${color}`,
        opacity,
        top: "50%",
        left: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    />
  );
};
