import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export interface OrbitDotProps {
  angle: number;
  radius: number;
  delay: number;
  color: string;
  size: number;
}

export const OrbitDot = ({
  angle,
  radius,
  delay,
  color,
  size,
}: OrbitDotProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const currentAngle = angle + interpolate(frame, [0, 300], [0, Math.PI * 2]);
  const x = Math.cos(currentAngle) * radius;
  const y = Math.sin(currentAngle) * radius;

  const scale = interpolate(appear, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: color,
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        top: "50%",
        left: "50%",
        marginLeft: -size / 2,
        marginTop: -size / 2,
        boxShadow: `0 0 ${size * 2}px ${color}88`,
      }}
    />
  );
};
