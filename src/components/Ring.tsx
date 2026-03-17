import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

export interface RingProps {
  delay: number;
  color: string;
}

export const Ring = ({ delay, color }: RingProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame - delay, [0, fps * 1.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const size = interpolate(progress, [0, 1], [60, 400]);
  const opacity = interpolate(progress, [0, 0.3, 1], [0, 0.6, 0]);

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${color}`,
        opacity,
        top: "50%",
        left: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
    />
  );
};
