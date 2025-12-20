"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Usuário não está logado, redireciona para home
      router.push("/");
    }
  }, [user, loading, router]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, não renderiza nada (vai redirecionar)
  if (!user) {
    return null;
  }

  // Usuário autenticado, renderiza o conteúdo
  return <>{children}</>;
}