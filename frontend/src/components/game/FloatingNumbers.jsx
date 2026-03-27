import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

let _id = 0;
const getId = () => ++_id;

// Call this hook to get a spawn function and the rendered component
export function useFloatingNumbers() {
  const [numbers, setNumbers] = useState([]);

  const spawn = (value, type = "damage") => {
    // type: "damage" | "crit" | "heal" | "mp_use" | "mp_regen"
    const id = getId();
    const xJitter = (Math.random() - 0.5) * 60;
    setNumbers(prev => [...prev, { id, value, type, xJitter }]);
    setTimeout(() => setNumbers(prev => prev.filter(n => n.id !== id)), 1500);
  };

  const node = (
    <AnimatePresence>
      {numbers.map(n => {
        let color, size, fontClass;
        switch (n.type) {
          case "crit":
            color = "text-orange-400";
            size = "text-4xl";
            fontClass = "font-orbitron font-black drop-shadow-lg";
            break;
          case "heal":
            color = "text-green-400";
            size = "text-xl";
            fontClass = "font-bold";
            break;
          case "mp_use":
            color = "text-blue-400";
            size = "text-lg";
            fontClass = "font-semibold";
            break;
          case "mp_regen":
            color = "text-blue-300";
            size = "text-base";
            fontClass = "font-medium";
            break;
          default: // damage
            color = "text-red-400";
            size = "text-2xl";
            fontClass = "font-bold";
        }
        return (
          <motion.div
            key={n.id}
            initial={{ opacity: 1, y: 0, x: n.xJitter, scale: n.type === "crit" ? 0.5 : 1 }}
            animate={{ opacity: 0, y: -90, x: n.xJitter + (Math.random() - 0.5) * 20, scale: n.type === "crit" ? 1.2 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: "easeOut" }}
            className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 select-none whitespace-nowrap ${color} ${size} ${fontClass}`}
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
          >
            {n.type === "crit" ? `💥 ${n.value}!` : n.type === "heal" ? `+${n.value}` : n.type === "mp_use" ? `-${n.value}MP` : n.type === "mp_regen" ? `+${n.value}MP` : `-${n.value}`}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );

  return { spawn, node };
}