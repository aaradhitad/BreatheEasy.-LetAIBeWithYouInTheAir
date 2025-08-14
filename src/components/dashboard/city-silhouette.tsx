"use client";

import React from "react";

export default function CitySilhouetteBackground() {
  return (
    <div
      className="pointer-events-none fixed bottom-0 left-0 w-full h-[40vh] md:h-[32vh]"
      style={{
        backgroundImage: "url('/city-silhouette.svg')",
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'bottom center',
        backgroundSize: 'contain',
        opacity: 0.7,
        zIndex: 5
      }}
      aria-hidden="true"
    />
  );
}


