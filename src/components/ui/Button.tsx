"use client";
import Link from "next/link";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "reset";
  disabled?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export default function Button({
  children,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  href,
  target,
  rel,
}: ButtonProps) {
  // Estilo base
  const base =
    "group px-8 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center shadow-2xl hover:scale-105";

  // Estilo por variante
  const styles: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-purple-900 to-purple-700 hover:from-purple-700 hover:to-purple-500 text-white",
    secondary:
      "border border-white/30 text-white hover:bg-white hover:text-purple-900 hover:shadow-purple-500/25",
    reset:
      "bg-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-100",
  };

  // Estilo final
  const finalClass = `${base} ${styles[variant]} ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  // 🔥 Se tiver HREF → renderiza Link automaticamente
  if (href) {
    return (
      <Link
        href={href}
        className={finalClass}
        target={target}
        rel={rel}
      >
        {children}
      </Link>
    );
  }

  // 🔥 Senão vira botão normal
  return (
    <button onClick={onClick} disabled={disabled} className={finalClass}>
      {children}
    </button>
  );
}
