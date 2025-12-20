"use client";

import { BanknoteArrowDown, CreditCard, DollarSign, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import PerfilModal from "@/app/dashboard/perfil/page";

const menuItems = [
  {
    label: "Financeiro",
    icon: DollarSign,
    href: "/dashboard/financeiro",
  },
  {
    label: "Empréstimos",
    icon: CreditCard,
    href: "/dashboard/emprestimos",
  },
  {
    label: "Pagamentos",
    icon: BanknoteArrowDown,
    href: "/dashboard/pagamentos",
  },
];

export default function Sidebar() {

  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* SIDEBAR DESKTOP - Lateral Esquerda */}
      <aside className="hidden md:flex fixed left-0 top-20 h-screen w-64 bg-white/5 backdrop-blur-xl border-r border-purple-900/20 flex-col">
        <nav className="flex-1 p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-300 group
                  ${active
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* BOTTOM NAVIGATION - Mobile (estilo Instagram/WhatsApp) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-purple-900/20">
        <div className="flex justify-around items-center px-4 py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center space-y-1 group"
              >
                <div
                  className={`
                    p-3 rounded-2xl transition-all duration-300
                    ${active
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50"
                      : "group-hover:bg-white/10"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-white" : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    active ? "text-white" : "text-gray-400 group-hover:text-white"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}


        </div>
      </nav>
    </>
  );
}