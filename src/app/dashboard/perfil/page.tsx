"use client";

import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Pega iniciais do nome
  const getInitials = (email: string) => {
    const name = email.split("@")[0];
    return name
      .split(/[-_.]/)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Nome do usuário (pega do email)
  const getUserName = (email: string) => {
    return email.split("@")[0].replace(/[-_.]/g, " ");
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do perfil - apenas ícone clicável */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300"
      >
        {/* Avatar com iniciais */}
        <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {getInitials(user.email || "US")}
          </span>
        </div>
                {/* Nome - Desktop */}
        <div className="hidden md:flex flex-col items-start">
          <span className="text-white font-medium text-sm max-w-[120px] truncate">
            {getUserName(user.email || "Usuário")}
          </span>
          <span className="text-gray-400 text-xs">Ver perfil</span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu - aparece abaixo do botão */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-900 border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header do dropdown */}
          <div className="p-4 border-b border-white/10 bg-gradient-to-br from-purple-900/50 to-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {getInitials(user.email || "US")}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">
                  {getUserName(user.email || "Usuário")}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <button
              onClick={() => {
                // Aqui você pode adicionar lógica para mostrar modal de perfil
                setIsOpen(false);
                console.log("Abrir edição de perfil");
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 group w-full"
            >
              <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 text-left">
                <p className="font-medium">Meu Perfil</p>
                <p className="text-xs text-gray-400">Ver e editar informações</p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                console.log("Abrir configurações");
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 group w-full"
            >
              <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 text-left">
                <p className="font-medium">Configurações</p>
                <p className="text-xs text-gray-400">Preferências do sistema</p>
              </div>
            </button>
          </div>

          {/* Sair */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}