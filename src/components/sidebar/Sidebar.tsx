"use client";

import { CreditCard, DollarSign, User, Crown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    label: "Financeiro",
    icon: DollarSign,
    href: "/dashboard/financeiro",
    adminOnly: false,
  },
  {
    label: "Empréstimos",
    icon: CreditCard,
    href: "/dashboard/emprestimos",
    adminOnly: false,
  },
  {
    label: "Pagamentos",
    icon: User,
    href: "/dashboard/pagamentos",
    adminOnly: false,
  },
];

const adminMenuItem = {
  label: "Painel Admin",
  icon: Crown,
  href: "/dashboard/admin",
  adminOnly: true,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const isActive = (href: string) => pathname === href;

  // Menu items com admin item se for admin
  const allMenuItems = isAdmin ? [...menuItems, adminMenuItem] : menuItems;

  return (
    <>
      {/* SIDEBAR DESKTOP - Lateral Esquerda */}
      <aside className="hidden md:flex fixed left-0 top-20 h-screen w-64 bg-white/5 backdrop-blur-xl border-r border-purple-900/20 flex-col z-40">
        <nav className="flex-1 p-6 space-y-2">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl
                  transition-all duration-300 group relative z-10
                  ${active
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                <span className="font-medium">{item.label}</span>
                {item.adminOnly && (
                  <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                    ADMIN
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* BOTTOM NAVIGATION - Mobile (estilo Instagram/WhatsApp) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-purple-900/20">
        <div className="flex justify-around items-center px-4 py-3">
          {allMenuItems.map((item) => {
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
                    p-3 rounded-2xl transition-all duration-300 relative
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
                  {item.adminOnly && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></span>
                  )}
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