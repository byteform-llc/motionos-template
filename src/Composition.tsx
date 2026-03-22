import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
  Sequence,
} from "remotion";
import { Ring } from "./components/Ring";
import { OrbitDot } from "./components/OrbitDot";
import { FloatingShape } from "./components/FloatingShape";

export const compositionConfig = {
  durationInFrames: 150,
  fps: 30,
  width: 1920,
  height: 1080,
};

export default function MyComposition() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Background gradient shifts
  const bgHue1 = interpolate(frame, [0, 150], [250, 270], {
    extrapolateRight: "clamp",
  });
  const bgHue2 = interpolate(frame, [0, 150], [220, 240], {
    extrapolateRight: "clamp",
  });

  // Vignette pulse
  const vignettePulse = interpolate(
    frame,
    [0, 75, 150],
    [0.85, 0.92, 0.85],
    { extrapolateRight: "clamp" },
  );

  // Central orb
  const orbScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80 },
    durationInFrames: Math.round(fps * 1.5),
  });

  const orbGlow = interpolate(frame, [0, 75, 150], [0.6, 1, 0.6], {
    extrapolateRight: "clamp",
  });

  // Title animation
  const titleDelay = Math.round(fps * 0.5);
  const titleY = interpolate(frame - titleDelay, [0, fps * 0.8], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.exp),
  });
  const titleOpacity = interpolate(
    frame - titleDelay,
    [0, fps * 0.6],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Subtitle animation (staggered)
  const subtitleDelay = Math.round(fps * 0.8);
  const subtitleY = interpolate(
    frame - subtitleDelay,
    [0, fps * 0.7],
    [50, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.exp),
    },
  );
  const subtitleOpacity = interpolate(
    frame - subtitleDelay,
    [0, fps * 0.5],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  // Divider line
  const lineDelay = Math.round(fps * 0.65);
  const lineWidth = interpolate(frame - lineDelay, [0, fps * 0.6], [0, 240], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // Scan line effect
  const scanY = interpolate(frame, [0, 150], [-100, height + 100], {
    extrapolateRight: "clamp",
  });

  // Orbit dots — two layers at different radii
  const innerDots = [
    { angle: 0, radius: 130, delay: 5, color: "#a78bfa", size: 10, speed: 1 },
    {
      angle: Math.PI * 0.667,
      radius: 130,
      delay: 8,
      color: "#818cf8",
      size: 8,
      speed: 1,
    },
    {
      angle: Math.PI * 1.333,
      radius: 130,
      delay: 11,
      color: "#c4b5fd",
      size: 12,
      speed: 1,
    },
  ];

  const outerDots = [
    {
      angle: Math.PI * 0.25,
      radius: 220,
      delay: 6,
      color: "#6366f1",
      size: 6,
      speed: 0.6,
    },
    {
      angle: Math.PI * 0.75,
      radius: 220,
      delay: 9,
      color: "#818cf8",
      size: 5,
      speed: 0.6,
    },
    {
      angle: Math.PI * 1.25,
      radius: 220,
      delay: 12,
      color: "#a78bfa",
      size: 7,
      speed: 0.6,
    },
    {
      angle: Math.PI * 1.75,
      radius: 220,
      delay: 7,
      color: "#c4b5fd",
      size: 5,
      speed: 0.6,
    },
  ];

  // Floating shapes scattered around
  const shapes: React.ComponentProps<typeof FloatingShape>[] = [
    {
      x: width * 0.08,
      y: height * 0.12,
      size: 40,
      rotation: 15,
      delay: 10,
      color: "#818cf8",
      shape: "square",
      driftX: 10,
      driftY: -20,
    },
    {
      x: width * 0.85,
      y: height * 0.18,
      size: 30,
      rotation: 45,
      delay: 14,
      color: "#a78bfa",
      shape: "diamond",
      driftX: -8,
      driftY: -15,
    },
    {
      x: width * 0.12,
      y: height * 0.75,
      size: 35,
      rotation: 0,
      delay: 18,
      color: "#c4b5fd",
      shape: "triangle",
      driftX: 12,
      driftY: -25,
    },
    {
      x: width * 0.88,
      y: height * 0.7,
      size: 28,
      rotation: 30,
      delay: 8,
      color: "#6366f1",
      shape: "circle",
      driftX: -6,
      driftY: -18,
    },
    {
      x: width * 0.22,
      y: height * 0.4,
      size: 22,
      rotation: 60,
      delay: 20,
      color: "#818cf8",
      shape: "diamond",
      driftX: 5,
      driftY: -12,
    },
    {
      x: width * 0.78,
      y: height * 0.5,
      size: 26,
      rotation: 10,
      delay: 16,
      color: "#a78bfa",
      shape: "square",
      driftX: -10,
      driftY: -20,
    },
    {
      x: width * 0.35,
      y: height * 0.1,
      size: 20,
      rotation: 75,
      delay: 22,
      color: "#c4b5fd",
      shape: "circle",
      driftX: 4,
      driftY: -10,
    },
    {
      x: width * 0.65,
      y: height * 0.85,
      size: 32,
      rotation: 20,
      delay: 12,
      color: "#6366f1",
      shape: "triangle",
      driftX: -7,
      driftY: -22,
    },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 35% 40%, hsl(${bgHue1}, 65%, 10%) 0%, transparent 70%),
          radial-gradient(ellipse 60% 80% at 70% 60%, hsl(${bgHue2}, 55%, 8%) 0%, transparent 70%),
          hsl(${bgHue2 - 10}, 40%, 4%)
        `,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(129, 140, 248, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 140, 248, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: interpolate(frame, [0, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: scanY,
          height: 120,
          background:
            "linear-gradient(180deg, transparent, rgba(129, 140, 248, 0.04), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,${vignettePulse}) 100%)`,
        }}
      />

      {/* Floating shapes */}
      {shapes.map((s, i) => (
        <FloatingShape key={`shape-${i}`} {...s} />
      ))}

      {/* Pulse rings — staggered */}
      <Sequence from={0}>
        <Ring delay={0} color="#818cf8" maxSize={700} />
      </Sequence>
      <Sequence from={Math.round(fps * 0.4)}>
        <Ring delay={0} color="#a78bfa" maxSize={600} />
      </Sequence>
      <Sequence from={Math.round(fps * 0.8)}>
        <Ring delay={0} color="#c4b5fd" maxSize={500} />
      </Sequence>
      <Sequence from={Math.round(fps * 1.2)}>
        <Ring delay={0} color="#6366f1" maxSize={800} />
      </Sequence>

      {/* Orbit ring guides */}
      <div
        style={{
          position: "absolute",
          width: 260,
          height: 260,
          borderRadius: "50%",
          border: "1px solid rgba(129, 140, 248, 0.08)",
          top: "50%",
          left: "50%",
          marginLeft: -130,
          marginTop: -130,
          opacity: interpolate(frame, [5, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 440,
          height: 440,
          borderRadius: "50%",
          border: "1px solid rgba(129, 140, 248, 0.05)",
          top: "50%",
          left: "50%",
          marginLeft: -220,
          marginTop: -220,
          opacity: interpolate(frame, [10, 30], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      />

      {/* Orbiting dots */}
      {innerDots.map((dot, i) => (
        <OrbitDot key={`inner-${i}`} {...dot} />
      ))}
      {outerDots.map((dot, i) => (
        <OrbitDot key={`outer-${i}`} {...dot} />
      ))}

      {/* Central orb */}
      <div
        style={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, #6366f1 0%, #818cf8 40%, #c4b5fd 100%)",
          transform: `scale(${orbScale})`,
          top: "50%",
          left: "50%",
          marginLeft: -50,
          marginTop: -50,
          boxShadow: `
            0 0 60px rgba(129, 140, 248, ${0.4 * orbGlow}),
            0 0 120px rgba(129, 140, 248, ${0.2 * orbGlow}),
            inset 0 0 30px rgba(255, 255, 255, 0.1)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner icon — rotating play triangle */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "22px solid rgba(255,255,255,0.9)",
            borderTop: "14px solid transparent",
            borderBottom: "14px solid transparent",
            marginLeft: 6,
            transform: `scale(${interpolate(orbScale, [0, 1], [0.5, 1], { extrapolateRight: "clamp" })})`,
            filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
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
          marginTop: 110,
          textAlign: "center",
          minWidth: 600,
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
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -2,
              background:
                "linear-gradient(90deg, #e0e7ff 0%, #c4b5fd 50%, #818cf8 100%)",
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
            margin: "20px auto",
            height: 2,
            width: lineWidth,
            background:
              "linear-gradient(90deg, transparent, #818cf8, #c4b5fd, transparent)",
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
              fontSize: 26,
              color: "#94a3b8",
              fontWeight: 400,
              letterSpacing: 1,
            }}
          >
            Describe what you want to create
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
