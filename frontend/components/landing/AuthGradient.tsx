"use client";

import dynamic from "next/dynamic";

const ShaderGradientCanvas = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradientCanvas),
  { ssr: false }
);

const ShaderGradient = dynamic(
  () => import("@shadergradient/react").then((m) => m.ShaderGradient),
  { ssr: false }
);

export default function AuthGradient() {
  return (
    <ShaderGradientCanvas
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      pointerEvents="none"
    >
      <ShaderGradient
        type="sphere"
        animate="on"
        uTime={0}
        uSpeed={0.05}
        uStrength={0.6}
        uDensity={0.8}
        uFrequency={5.5}
        uAmplitude={0}
        color1="#080318"
        color2="#1a0a4b"
        color3="#2d1069"
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
        lightType="3d"
        envPreset="city"
        brightness={0.5}
        grain="on"
        reflection={0.15}
      />
    </ShaderGradientCanvas>
  );
}
