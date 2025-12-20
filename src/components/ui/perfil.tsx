"use client";

import Button from "@/components/ui/Button";
import { Facebook, X } from "lucide-react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* conteúdo do modal */}
      <div className="relative bg-white/20 rounded-2xl w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold text-gray-300 mb-2">
          Entrar na sua conta
        </h2>

        <p className="text-gray-300 mb-6">
          Acesse para continuar sua experiência no Kraven.
        </p>

        <div className="space-y-3">
          <Button className="w-full">
             Continuar com Google</Button>
          <Button className="w-full">
            <Facebook></Facebook> Continuar com Facebook</Button>

          <div className="text-center text-gray-400 text-sm">ou</div>

          <Button variant="secondary" className=" w-full">
            Continuar com e-mail
          </Button>
        </div>
      </div>
    </div>
  );
}
