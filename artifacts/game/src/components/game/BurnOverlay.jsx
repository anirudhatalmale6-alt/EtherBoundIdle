import React, { useState, useEffect } from "react";

/**
 * Animated burn overlay — flames rise from the bottom of the enemy card.
 * Sprite strip along the bottom + CSS glow for ambient fire light.
 * JS-driven frame cycling with exact pixel positioning.
 */

const FRAMES = 9;
const FLAME_HEIGHT = 80; // rendered flame height (px)

export default function BurnOverlay({ active }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    setFrame(0);
    const id = setInterval(() => setFrame(f => (f + 1) % FRAMES), 100);
    return () => clearInterval(id);
  }, [active]);

  if (!active) return null;

  const bgX = frame * 12.5; // exact frame position for 9-frame sprite

  return (
    <>
      {/* Ambient fire glow on the card */}
      <div
        className="burn-glow"
        style={{
          position: "absolute",
          inset: -2,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 9,
        }}
      />

      {/* Bottom flames — sprite, rising upward */}
      <div
        style={{
          position: "absolute",
          left: -4,
          right: -4,
          bottom: -8,
          height: FLAME_HEIGHT,
          pointerEvents: "none",
          zIndex: 11,
          backgroundImage: "url(/sprites/effects/burn_bottom.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: `${FRAMES * 100}% 100%`,
          backgroundPosition: `${bgX}% 0`,
          mixBlendMode: "screen",
          opacity: 0.95,
        }}
      />
      {/* Glow layer for the flames (blurred duplicate) */}
      <div
        style={{
          position: "absolute",
          left: -8,
          right: -8,
          bottom: -12,
          height: FLAME_HEIGHT + 16,
          pointerEvents: "none",
          zIndex: 10,
          backgroundImage: "url(/sprites/effects/burn_bottom.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: `${FRAMES * 100}% 100%`,
          backgroundPosition: `${bgX}% 0`,
          mixBlendMode: "screen",
          filter: "blur(10px)",
          opacity: 0.5,
        }}
      />
    </>
  );
}
