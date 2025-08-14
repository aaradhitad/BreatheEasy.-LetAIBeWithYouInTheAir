"use client";

import Image from "next/image";

export function Mascot({ aqi }: { aqi: number }) {
  const getEmotion = (value: number): { src: string; alt: string } => {
    if (value <= 50) return { src: "/mascot-happy.svg", alt: "Happy mascot (Good air)" };
    if (value <= 150) return { src: "/mascot-sad.svg", alt: "Sad mascot (Degraded air)" };
    return { src: "/mascot-angry.svg", alt: "Angry mascot (Hazardous air)" };
  };

  const { src, alt } = getEmotion(aqi);

  return (
    <div className="relative z-10 flex flex-col items-center">
      <Image src={src} alt={alt} width={180} height={180} priority />
    </div>
  );
}


