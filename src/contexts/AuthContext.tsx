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
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  email: string | null;
  role: "admin" | "cliente";
  nome?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Busca dados do usuário no Firestore
  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid,
          email: user?.email || null,
          role: data.role || "cliente",
          nome: data.nome,
        });
      } else {
        setUserData({
          uid,
          email: user?.email || null,
          role: "cliente",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      setUserData({
        uid,
        email: user?.email || null,
        role: "cliente",
      });
    }
  };

  // Monitora mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await fetchUserData(user.uid);
      } else {
        setUserData(null);
      }
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
        userData,
        loading,
        loginWithEmail,
        loginWithGoogle,
        logout,
        isAdmin: userData?.role === "admin",
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