"use client";

import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, X } from "lucide-react";
import { useState } from "react";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError("Erro ao fazer login com Google. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          onClose();
          resetForm();
        }}
      />

      {/* conteúdo do modal */}
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl w-full max-w-md p-8 z-10 border border-purple-500/30">
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X />
        </button>

        <h2 className="text-3xl font-bold text-white mb-2">
          {showEmailForm ? "Login" : "Entrar na sua conta"}
        </h2>

        <p className="text-gray-300 mb-6">
          {showEmailForm
            ? "Digite seu email e senha para continuar"
            : "Acesse para continuar sua experiência no Kraven."}
        </p>

        {/* Mensagem de erro */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!showEmailForm ? (
          // Botões sociais
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Carregando..." : "Continuar com Google"}
            </Button>

            <div className="text-center text-gray-400 text-sm">ou</div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowEmailForm(true)}
            >
              <Mail className="mr-2" size={20} />
              Continuar com e-mail
            </Button>
          </div>
        ) : (
          // Formulário de email
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <button
              type="button"
              onClick={resetForm}
              className="w-full text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  );
}