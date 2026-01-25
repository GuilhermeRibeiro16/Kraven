"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatarMoeda } from "@/services/faturaService";

interface RegistrarPagamentoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tipo: "fatura" | "emprestimo";
  clienteUid: string;
  itemId: string;
  itemDescricao: string;
  valorParcela: number;
  parcelasPagas: number;
  parcelasTotal: number;
}

export default function RegistrarPagamentoModal({
  open,
  onClose,
  onSuccess,
  tipo,
  clienteUid,
  itemId,
  itemDescricao,
  valorParcela,
  parcelasPagas,
  parcelasTotal,
}: RegistrarPagamentoModalProps) {
  const [quantidadeParcelas, setQuantidadeParcelas] = useState(1);
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const parcelasRestantes = parcelasTotal - parcelasPagas;
  const valorTotal = quantidadeParcelas * valorParcela;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (quantidadeParcelas > parcelasRestantes) {
      setError(`Só restam ${parcelasRestantes} parcelas para pagar`);
      return;
    }

    setLoading(true);

    try {
      const colecao = tipo === "fatura" ? "faturas" : "emprestimos";
      const itemRef = doc(db, `users/${clienteUid}/${colecao}`, itemId);

      const novasParcelas = parcelasPagas + quantidadeParcelas;
      const novoStatus = novasParcelas >= parcelasTotal ? "quitado" : "em_dia";

      // Atualiza o documento
      await updateDoc(itemRef, {
        parcelas_pagas: novasParcelas,
        status: novoStatus,
        historico: arrayUnion({
          valor: valorTotal,
          data: dataPagamento,
          status: "pago",
          quantidade_parcelas: quantidadeParcelas,
        }),
      });

      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      setError("Erro ao registrar pagamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setQuantidadeParcelas(1);
    setDataPagamento(new Date().toISOString().split("T")[0]);
    setError("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl w-full max-w-md border border-purple-500/30 z-10">
        <div className="p-6 border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X />
          </button>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Check className="text-green-400" /> Registrar Pagamento
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {tipo === "fatura" ? "Fatura" : "Empréstimo"}: {itemDescricao}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Informações do pagamento */}
          <div className="bg-white/5 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Valor da parcela:</span>
              <span className="text-white font-semibold">{formatarMoeda(valorParcela)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Parcelas pagas:</span>
              <span className="text-white font-semibold">
                {parcelasPagas}/{parcelasTotal}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Parcelas restantes:</span>
              <span className="text-purple-400 font-semibold">{parcelasRestantes}</span>
            </div>
          </div>

          {/* Quantidade de parcelas */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Quantas parcelas foram pagas?
            </label>
            <input
              type="number"
              min="1"
              max={parcelasRestantes}
              value={quantidadeParcelas}
              onChange={(e) => setQuantidadeParcelas(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
            <p className="text-gray-400 text-xs mt-1">Máximo: {parcelasRestantes} parcelas</p>
          </div>

          {/* Data do pagamento */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Data do pagamento</label>
            <input
              type="date"
              value={dataPagamento}
              onChange={(e) => setDataPagamento(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
              required
            />
          </div>

          {/* Resumo do pagamento */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-500/30">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              💰 Resumo do Pagamento
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Quantidade:</span>
                <span className="text-white font-bold">
                  {quantidadeParcelas}x de {formatarMoeda(valorParcela)}
                </span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-300">Total:</span>
                <span className="text-green-400 font-bold">{formatarMoeda(valorTotal)}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                <span className="text-gray-400">Restará:</span>
                <span className="text-gray-300">
                  {parcelasRestantes - quantidadeParcelas} de {parcelasTotal} parcelas
                </span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button  variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button  disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Confirmar Pagamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}