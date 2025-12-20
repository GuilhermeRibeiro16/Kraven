"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Monitora mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Login com email/senha
  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard/financeiro");
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  // Login com Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/dashboard/financeiro");
    } catch (error: any) {
      console.error("Erro ao fazer login com Google:", error);
      throw new Error("Erro ao fazer login com Google. Tente novamente.");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado
export function useAuth() {
  return useContext(AuthContext);
}

// Mensagens de erro em português
function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/invalid-email": "Email inválido.",
    "auth/user-disabled": "Usuário desabilitado.",
    "auth/user-not-found": "Usuário não encontrado.",
    "auth/wrong-password": "Senha incorreta.",
    "auth/invalid-credential": "Email ou senha incorretos.",
    "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde.",
  };

  return errorMessages[errorCode] || "Erro ao fazer login. Tente novamente.";
}