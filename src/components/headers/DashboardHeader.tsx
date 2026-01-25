"use client";

import { Bell, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import UserMenu from "@/components/UserMenu/UserMenu";

export default function DashboardHeader() {
  const [searchFocus, setSearchFocus] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* LOGO */}
          <Link href="/dashboard/financeiro" className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-purple-900 bg-clip-text text-transparent">
              kraven
            </h1>
          </Link> 

          {/* BUSCA - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div
              className={`
                flex items-center w-full px-4 py-2 rounded-xl
                bg-white/5 border transition-all duration-300
                ${searchFocus 
                  ? "border-purple-500 bg-white/10" 
                  : "border-white/10"
                }
              `}
            >
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="bg-transparent text-white w-full outline-none placeholder:text-gray-500"
                onFocus={() => setSearchFocus(true)}
                onBlur={() => setSearchFocus(false)}
              />
            </div>
          </div>

          {/* AÇÕES */}
          <div className="flex items-center space-x-4">
            
            {/* Notificações */}
            <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 group">
              <Bell className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
            </button>

            {/* UserMenu Dropdown */}
            <UserMenu />
          </div>
        </div>

        {/* BUSCA - Mobile */}
        <div className="md:hidden pb-4">
          <div
            className={`
              flex items-center w-full px-4 py-2 rounded-xl
              bg-white/5 border transition-all duration-300
              ${searchFocus 
                ? "border-purple-500 bg-white/10" 
                : "border-white/10"
              }
            `}
          >
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-white w-full outline-none placeholder:text-gray-500"
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}