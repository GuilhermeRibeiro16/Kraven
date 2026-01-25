"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ConfirmarExclusaoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipo: "fatura" | "emprestimo";
  clienteUid: string;
  itemId: string;
  itemDescricao: string;
}

export default function ConfirmarExclusaoModal({
  open,
  onClose,
  onSuccess,
  tipo,
  clienteUid,
  itemId,
  itemDescricao,
}: ConfirmarExclusaoModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExcluir = async () => {
    setError("");
    setLoading(true);

    try {
      const colecao = tipo === "fatura" ? "faturas" : "emprestimos";
      const itemRef = doc(db, `users/${clienteUid}/${colecao}`, itemId);

      await deleteDoc(itemRef);

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      setError("Erro ao excluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900 via-red-900/50 to-gray-900 rounded-2xl w-full max-w-md border border-red-500/30 z-10">
        <div className="p-6 border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-red-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
              <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-gray-300 mb-2">Você está prestes a excluir:</p>
            <p className="text-white font-bold text-lg">{itemDescricao}</p>
            <p className="text-gray-400 text-sm mt-2 capitalize">Tipo: {tipo}</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">
              ⚠️ Todo o histórico de pagamentos será perdido. Tem certeza que deseja continuar?
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button  variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <button
              onClick={handleExcluir}
              disabled={loading}
              className="flex-1 px-8 py-4 rounded-2xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Excluindo..." : "Excluir Definitivamente"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}