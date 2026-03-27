import React from "react";
import { getRoleTitle, getRoleColor } from "@/lib/roleSystem";

export default function RoleTag({ role, name, inline = false }) {
  const title = getRoleTitle(role);
  const color = getRoleColor(role);

  if (!title) return <span>{name}</span>;

  if (inline) {
    return (
      <span className="flex items-center gap-1">
        <span className={`text-xs font-bold ${color}`}>[{title}]</span>
        <span>{name}</span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${color} bg-opacity-20 border border-opacity-30 ${color.replace('text-', 'border-')}`}>
        {title}
      </span>
      <span>{name}</span>
    </div>
  );
}