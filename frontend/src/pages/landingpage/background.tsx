"use client";

import React, { Component, useEffect, useState } from "react";
import Image from "next/image";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export interface BackgroundProps {
  children?: React.ReactNode;
  animate?: "on" | "off";
  axesHelper?: "on" | "off" | string;
  brightness?: number;
  cAzimuthAngle?: number;
  cDistance?: number;
  cPolarAngle?: number;
  cameraZoom?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  destination?: string;
  embedMode?: "on" | "off" | string;
  envPreset?: "city" | "dawn" | "lobby";
  format?: string;
  fov?: number;
  frameRate?: number;
  gizmoHelper?: "hide" | "show" | string;
  grain?: "on" | "off";
  lightType?: "3d" | "env";
  pixelDensity?: number;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  range?: "disabled" | "enabled" | string;
  rangeEnd?: number;
  rangeStart?: number;
  reflection?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  shader?: string;
  type?: "plane" | "sphere" | "waterPlane";
  uAmplitude?: number;
  uDensity?: number;
  uFrequency?: number;
  uSpeed?: number;
  uStrength?: number;
  uTime?: number;
  wireframe?: boolean;
  urlString?: string;
  control?: "props" | "query";
  overlayOpacity?: number;
  className?: string;
  [key: string]: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ShaderErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("ShaderGradient WebGL fallback activated:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function Background({
  children,
  animate = "on",
  brightness = 1.2,
  cAzimuthAngle = 180,
  cDistance = 4.49,
  cPolarAngle = 90,
  cameraZoom = 1,
  color1 = "#79502F",
  color2 = "#A37848",
  color3 = "#C69F6D",
  envPreset = "lobby",
  fov = 30,
  grain = "on",
  lightType = "3d",
  pixelDensity = 1,
  positionX = 0,
  positionY = 0,
  positionZ = 0,
  range = "disabled",
  rangeEnd = 40,
  rangeStart = 0,
  reflection = 0.1,
  rotationX = 0,
  rotationY = 0,
  rotationZ = 30,
  shader = "defaults",
  type = "plane",
  uAmplitude = 1,
  uDensity = 1,
  uFrequency = 5.5,
  uSpeed = 0.4,
  uStrength = 2,
  uTime = 0,
  wireframe = false,
  urlString,
  control = urlString ? "query" : "props",
  overlayOpacity = 0,
  className = "",
  ...rest
}: BackgroundProps) {
  const [canRenderWebGL, setCanRenderWebGL] = useState(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setCanRenderWebGL(!!gl);
    } catch {
      setCanRenderWebGL(false);
    }
  }, []);

  const fallbackBackground = (
    <div className="absolute inset-0">
      <Image
        src="/website_background.png"
        alt="Fallback Website Background"
        fill
        priority
        className="object-cover object-center pointer-events-none"
      />
    </div>
  );

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      {/* 3D Animated Shader Gradient Canvas Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {canRenderWebGL ? (
          <ShaderErrorBoundary fallback={fallbackBackground}>
            <ShaderGradientCanvas
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "80%",
                height: "80%",
              }}
              lazyLoad={false}
              pixelDensity={pixelDensity}
              fov={fov}
              pointerEvents="none"
            >
              {control === "query" && urlString ? (
                <ShaderGradient control="query" urlString={urlString} />
              ) : (
                <ShaderGradient
                  control="props"
                  type={type}
                  animate={animate}
                  brightness={brightness}
                  cAzimuthAngle={cAzimuthAngle}
                  cDistance={cDistance}
                  cPolarAngle={cPolarAngle}
                  cameraZoom={cameraZoom}
                  color1={color1}
                  color2={color2}
                  color3={color3}
                  envPreset={envPreset}
                  grain={grain}
                  lightType={lightType}
                  positionX={positionX}
                  positionY={positionY}
                  positionZ={positionZ}
                  range={range}
                  rangeEnd={rangeEnd}
                  rangeStart={rangeStart}
                  reflection={reflection}
                  rotationX={rotationX}
                  rotationY={rotationY}
                  rotationZ={rotationZ}
                  shader={shader}
                  uAmplitude={uAmplitude}
                  uDensity={uDensity}
                  uFrequency={uFrequency}
                  uSpeed={uSpeed}
                  uStrength={uStrength}
                  uTime={uTime}
                  wireframe={wireframe}
                  {...rest}
                />
              )}
            </ShaderGradientCanvas>
          </ShaderErrorBoundary>
        ) : (
          fallbackBackground
        )}

        {/* Optional tint overlay for extra text contrast */}
        {overlayOpacity > 0 && (
          <div
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </div>

      {/* Page Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
