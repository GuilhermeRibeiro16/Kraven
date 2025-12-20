"use client";
import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  dot?: boolean; // pontinho verde
}

export default function Badge({
  children,
  className = "",
  variant = "primary",
  dot = true,
}: BadgeProps) {
  const base =
    "inline-flex items-center px-4 py-2 rounded-full backdrop-blur-sm border mb-4";

  const variants = {
    primary: "bg-white/10 border-white/20 text-white",
    secondary: "bg-purple-600/20 border-purple-400/30 text-purple-200",
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      {dot && (
        <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
      )}
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}
