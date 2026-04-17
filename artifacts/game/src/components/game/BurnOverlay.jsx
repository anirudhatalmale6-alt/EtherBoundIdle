import React, { useState, useEffect, useRef } from "react";

/**
 * Animated burning frame overlay for the enemy card.
 * Uses a 9-frame horizontal sprite strip of fire wrapping around a card border.
 * Stretches each frame to cover the full card using a canvas for clean rendering.
 * Parent must have position: relative.
 */

const BURN_SPRITE = {
  src: "/sprites/effects/burn_frame.png",
  frames: 9,
  frameW: 200,
  frameH: 78,
  frameDuration: 110,
};

export default function BurnOverlay({ active }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const frameRef = useRef(0);
  const animRef = useRef(null);

  // Load sprite sheet
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.onerror = () => setLoaded(false);
    img.src = BURN_SPRITE.src;
  }, []);

  // Animate frames on canvas
  useEffect(() => {
    if (!active || !loaded || !canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imgRef.current;
    frameRef.current = 0;

    const draw = () => {
      const f = frameRef.current;
      const cw = canvas.width;
      const ch = canvas.height;
      ctx.clearRect(0, 0, cw, ch);
      // Draw current frame stretched to fill canvas
      ctx.drawImage(
        img,
        f * BURN_SPRITE.frameW, 0, BURN_SPRITE.frameW, BURN_SPRITE.frameH,
        0, 0, cw, ch
      );
    };

    draw();

    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % BURN_SPRITE.frames;
      draw();
    }, BURN_SPRITE.frameDuration);

    animRef.current = interval;
    return () => clearInterval(interval);
  }, [active, loaded]);

  // Resize canvas to match parent
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const parent = canvas.parentElement?.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      // Add padding for flames to extend beyond card
      canvas.width = Math.round(rect.width + 16);
      canvas.height = Math.round(rect.height + 16);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        inset: -8,
        zIndex: 10,
        overflow: "visible",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          imageRendering: "auto",
          filter: "drop-shadow(0 0 4px rgba(255, 80, 0, 0.5))",
        }}
      />
    </div>
  );
}
