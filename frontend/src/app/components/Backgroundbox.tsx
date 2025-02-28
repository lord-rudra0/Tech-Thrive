"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Boxes } from "./ui/background-boxes";
import { TypewriterEffect } from "./ui/typewriter-effect";

export function BackgroundBoxes() {
    const words=[{
        text:'Carbon',
      },{
        text:" Emissions ",
      },{
        text:" and ",
      },{
        text:" Tree ",
      },{
        text:" cover ",
      },{
        text:" loss ",
      }]
  return (
    <div className="h-96 relative w-full overflow-hidden border-t-gray-950 flex flex-col items-center justify-center rounded-lg">
      <div className="absolute inset-0 w-full h-full bg-[#0a0a0a] z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <Boxes />
      <TypewriterEffect words={words} />
    </div>
  );
}
