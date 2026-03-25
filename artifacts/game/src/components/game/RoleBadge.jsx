import React from "react";

const ROLE_CONFIG = {
  admin: { label: "Admin", className: "bg-red-500/20 text-red-400 border border-red-500/40" },
  superadmin: { label: "Dev", className: "bg-purple-500/20 text-purple-400 border border-purple-500/40" },
  moderator: { label: "Mod", className: "bg-blue-500/20 text-blue-400 border border-blue-500/40" },
};

export default function RoleBadge({ role, size = "sm" }) {
  const config = ROLE_CONFIG[role];
  if (!config) return null;

  return (
    <span className={`inline-flex items-center rounded px-1 py-0 font-bold leading-tight ${config.className} ${size === "xs" ? "text-[10px]" : "text-xs"}`}>
      {config.label}
    </span>
  );
}