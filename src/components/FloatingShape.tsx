import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";

export interface FloatingShapeProps {
  x: number;
  y: number;
  size: number;
  rotation: number;
  delay: number;
  color: string;
  shape: "square" | "triangle" | "diamond" | "circle";
  driftX?: number;
  driftY?: number;
}

export const FloatingShape = ({
  x,
  y,
  size,
  rotation,
  delay,
  color,
  shape,
  driftX = 0,
  driftY = -30,
}: FloatingShapeProps) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const drift = interpolate(frame, [0, 300], [0, 1], {
    extrapolateRight: "clamp",
  });

  const currentX = x + driftX * drift;
  const currentY = y + driftY * drift;
  const currentRotation =
    rotation + interpolate(frame, [0, 300], [0, 90]);

  const opacity = interpolate(appear, [0, 1], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const borderRadius =
    shape === "circle"
      ? "50%"
      : shape === "square"
        ? `${size * 0.15}px`
        : "0";

  const clipPath =
    shape === "triangle"
      ? "polygon(50% 0%, 0% 100%, 100% 100%)"
      : shape === "diamond"
        ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
        : undefined;

  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: currentX,
        top: currentY,
        opacity,
        transform: `rotate(${currentRotation}deg) scale(${appear})`,
        border: `1.5px solid ${color}`,
        borderRadius,
        clipPath,
        background:
          shape === "triangle" || shape === "diamond"
            ? "none"
            : `${color}08`,
      }}
    />
  );
};
