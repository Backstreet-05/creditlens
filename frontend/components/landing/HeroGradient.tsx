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

export default function HeroGradient() {
  return (
    <ShaderGradientCanvas
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      pointerEvents="none"
    >
      <ShaderGradient
        type="waterPlane"
        animate="on"
        uTime={0}
        uSpeed={0.14}
        uStrength={2.2}
        uDensity={1.4}
        uFrequency={5.5}
        uAmplitude={0}
        color1="#050a1e"
        color2="#1e1b4b"
        color3="#4338ca"
        positionX={0}
        positionY={0}
        positionZ={0}
        rotationX={50}
        rotationY={0}
        rotationZ={-60}
        lightType="3d"
        envPreset="city"
        brightness={0.9}
        grain="on"
        reflection={0.2}
      />
    </ShaderGradientCanvas>
  );
}
