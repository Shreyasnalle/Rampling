import Image from "next/image";
import React from "react";

export default function Background({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-[#141312] overflow-hidden"
      style={{ backgroundColor: "#141312" }}
    >
      {/* Centered Website Background Card: perfectly fits up to 80vw / 80vh while preserving true aspect ratio */}
      <div
        className="relative rounded-[32px] overflow-hidden shadow-2xl ring-1 ring-white/5"
        style={{
          width: "min(80vw, calc(80vh * 736 / 489))",
          height: "min(80vh, calc(80vw * 489 / 736))",
        }}
      >
        <Image
          src="/recent_cold_light_blurry_horizon.png"
          alt="Recent Cold Light Blurry Horizon"
          fill
          priority
          unoptimized
          quality={100}
          className="object-contain object-center pointer-events-none select-none"
        />

        {children && <div className="relative z-10 w-full h-full">{children}</div>}
      </div>
    </div>
  );
}
