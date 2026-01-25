"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import Button from "@/components/ui/Button";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

interface AdicionarClienteModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdicionarClienteModal({ open, onClose, onSuccess }: AdicionarClienteModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setCpf("");
    setTelefone("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nome || !email || !senha) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // Cria o usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const userId = userCredential.user.uid;

      // Cria o documento do usuário no Firestore
      await setDoc(doc(db, "users", userId), {
        nome: nome,
        email: email,
        cpf: cpf || "",
        telefone: telefone || "",
        role: "cliente",
        created_at: new Date().toISOString(),
      });

      onSuccess();
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar cliente:", error);
      
      // Tratamento de erros do Firebase
      if (error.code === "auth/email-already-in-use") {
        setError("Este email já está em uso");
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido");
      } else if (error.code === "auth/weak-password") {
        setError("Senha muito fraca");
      } else {
        setError("Erro ao criar cliente. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl w-full max-w-2xl border border-purple-500/30 z-10">
        <div className="p-6 border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600/30 rounded-xl flex items-center justify-center">
              <UserPlus className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Adicionar Novo Cliente</h2>
              <p className="text-gray-400 text-sm">Crie uma conta para um novo cliente</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-400 text-sm">
              ℹ️ As credenciais de login serão criadas automaticamente. Anote a senha para passar ao cliente!
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Nome Completo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Ex: João Silva"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="cliente@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Senha <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <p className="text-gray-400 text-xs mt-1">Mínimo 6 caracteres</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  CPF (opcional)
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="(82) 99999-9999"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
            <h4 className="text-white font-semibold mb-3">📋 Resumo</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Nome:</span>
                <span className="text-white font-medium">{nome || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white font-medium">{email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Senha:</span>
                <span className="text-white font-medium">{senha ? "•".repeat(senha.length) : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-purple-400 font-medium">Cliente</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button  variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button  disabled={loading} className="flex-1">
              {loading ? "Criando..." : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}