import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";

// Animated dot that pulses and orbits
const OrbitDot: React.FC<{
  angle: number;
  radius: number;
  delay: number;
  color: string;
  size: number;
}> = ({ angle, radius, delay, color, size }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const appear = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  const currentAngle =
    angle + interpolate(frame, [0, 300], [0, Math.PI * 2]);
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

// Animated ring that expands and fades
const Ring: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
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

export const MyComposition = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background gradient shift
  const bgHue = interpolate(frame, [0, 300], [230, 280], {
    extrapolateRight: "clamp",
  });

  // Logo circle
  const logoScale = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
    durationInFrames: fps * 1.2,
  });

  // Title slide up
  const titleDelay = Math.round(fps * 0.4);
  const titleY = interpolate(frame - titleDelay, [0, fps * 0.7], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const titleOpacity = interpolate(frame - titleDelay, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtitle slide up (staggered)
  const subtitleDelay = Math.round(fps * 0.65);
  const subtitleY = interpolate(
    frame - subtitleDelay,
    [0, fps * 0.6],
    [40, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    }
  );
  const subtitleOpacity = interpolate(
    frame - subtitleDelay,
    [0, fps * 0.5],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Line expand
  const lineDelay = Math.round(fps * 0.55);
  const lineWidth = interpolate(frame - lineDelay, [0, fps * 0.5], [0, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const dots = [
    { angle: 0, radius: 90, delay: 5, color: "#818cf8", size: 10 },
    { angle: Math.PI / 3, radius: 90, delay: 8, color: "#a78bfa", size: 7 },
    { angle: (2 * Math.PI) / 3, radius: 90, delay: 11, color: "#c4b5fd", size: 9 },
    { angle: Math.PI, radius: 90, delay: 6, color: "#818cf8", size: 6 },
    { angle: (4 * Math.PI) / 3, radius: 90, delay: 10, color: "#a78bfa", size: 8 },
    { angle: (5 * Math.PI) / 3, radius: 90, delay: 7, color: "#c4b5fd", size: 7 },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 40% 40%, hsl(${bgHue}, 60%, 12%) 0%, hsl(${bgHue - 20}, 50%, 6%) 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Pulse rings */}
      <Sequence from={0}>
        <Ring delay={0} color="#818cf8" />
      </Sequence>
      <Sequence from={Math.round(fps * 0.5)}>
        <Ring delay={0} color="#a78bfa" />
      </Sequence>
      <Sequence from={Math.round(fps * 1)}>
        <Ring delay={0} color="#c4b5fd" />
      </Sequence>

      {/* Orbiting dots */}
      {dots.map((dot, i) => (
        <OrbitDot key={i} {...dot} />
      ))}

      {/* Center logo circle */}
      <div
        style={{
          position: "absolute",
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #818cf8, #c4b5fd)",
          transform: `scale(${logoScale})`,
          top: "50%",
          left: "50%",
          marginLeft: -36,
          marginTop: -36,
          boxShadow: "0 0 40px #818cf888, 0 0 80px #818cf844",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "rgba(255,255,255,0.9)",
            transform: `rotate(${interpolate(frame, [0, 300], [0, 360])}deg)`,
          }}
        />
      </div>

      {/* Text content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: 80,
          textAlign: "center",
          minWidth: 500,
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${titleY}px)`,
            opacity: titleOpacity,
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              letterSpacing: -1,
              background: "linear-gradient(90deg, #e0e7ff, #c4b5fd, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              lineHeight: 1.1,
            }}
          >
            Your Animation
          </div>
        </div>

        {/* Divider line */}
        <div
          style={{
            margin: "16px auto",
            height: 2,
            width: lineWidth,
            background: "linear-gradient(90deg, #818cf8, #c4b5fd)",
            borderRadius: 2,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            transform: `translateY(${subtitleY}px)`,
            opacity: subtitleOpacity,
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "#94a3b8",
              fontWeight: 400,
              letterSpacing: 0.5,
            }}
          >
            Describe what you want to create
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
