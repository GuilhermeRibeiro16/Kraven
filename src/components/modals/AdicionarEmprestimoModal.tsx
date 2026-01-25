"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "@/components/ui/Button";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatarMoeda } from "@/services/faturaService";

interface Cliente {
  uid: string;
  nome: string;
  email: string;
}

interface AdicionarEmprestimoModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdicionarEmprestimoModal({ open, onClose, onSuccess }: AdicionarEmprestimoModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [valorOriginal, setValorOriginal] = useState<number>(0);
  const [jurosPercentual, setJurosPercentual] = useState<number>(0);
  const [parcelas, setParcelas] = useState<number>(1);
  const [vencimento, setVencimento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      carregarClientes();
    }
  }, [open]);

  const carregarClientes = async () => {
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const clientesData: Cliente[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === "cliente") {
          clientesData.push({
            uid: doc.id,
            nome: data.nome || data.email?.split("@")[0] || "Cliente",
            email: data.email || "",
          });
        }
      });

      setClientes(clientesData);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const calcularValorComJuros = (valor: number, juros: number) => {
    return valor + (valor * juros / 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clienteSelecionado) {
      setError("Selecione um cliente");
      return;
    }

    if (valorOriginal <= 0) {
      setError("Valor deve ser maior que zero");
      return;
    }

    if (!vencimento) {
      setError("Defina a data de vencimento");
      return;
    }

    setLoading(true);

    try {
      const valorTotal = calcularValorComJuros(valorOriginal, jurosPercentual);
      const valorParcela = valorTotal / parcelas;

      await addDoc(collection(db, `users/${clienteSelecionado}/emprestimos`), {
        valor_original: valorOriginal,
        juros_percentual: jurosPercentual,
        valor_total: valorTotal,
        parcelas_total: parcelas,
        parcelas_pagas: 0,
        valor_parcela: valorParcela,
        vencimento,
        status: "em_dia",
        created_at: new Date().toISOString(),
        historico: [],
      });

      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar empréstimo:", error);
      setError("Erro ao adicionar empréstimo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClienteSelecionado("");
    setValorOriginal(0);
    setJurosPercentual(0);
    setParcelas(1);
    setVencimento("");
    setError("");
  };

  if (!open) return null;

  const valorTotal = calcularValorComJuros(valorOriginal, jurosPercentual);
  const valorParcela = valorTotal / parcelas;
  const totalJuros = valorTotal - valorOriginal;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl w-full max-w-2xl border border-purple-500/30 z-10">
        <div className="p-6 border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X />
          </button>
          <h2 className="text-2xl font-bold text-white">💰 Adicionar Empréstimo</h2>
          <p className="text-gray-400 text-sm mt-1">Registre um empréstimo em dinheiro</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm font-medium mb-2">Cliente</label>
              <select
                value={clienteSelecionado}
                onChange={(e) => setClienteSelecionado(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              >
                <option value="">Selecione um cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.uid} value={cliente.uid} className="bg-gray-900">
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Valor do Empréstimo</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={valorOriginal || ""}
                onChange={(e) => setValorOriginal(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Juros (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={jurosPercentual}
                onChange={(e) => setJurosPercentual(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="0"
              />
              <p className="text-gray-400 text-xs mt-1">Ex: 5 para 5%</p>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Número de Parcelas</label>
              <input
                type="number"
                min="1"
                value={parcelas}
                onChange={(e) => setParcelas(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Data de Vencimento</label>
              <input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          {valorOriginal > 0 && (
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30 space-y-3">
              <h4 className="text-white font-semibold mb-3">💰 Resumo do Empréstimo</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Valor Original</p>
                  <p className="text-white font-bold text-lg">{formatarMoeda(valorOriginal)}</p>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Total de Juros</p>
                  <p className="text-yellow-400 font-bold text-lg">{formatarMoeda(totalJuros)}</p>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Valor Total</p>
                  <p className="text-purple-400 font-bold text-lg">{formatarMoeda(valorTotal)}</p>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">Valor da Parcela</p>
                  <p className="text-green-400 font-bold text-lg">{formatarMoeda(valorParcela)}</p>
                </div>
              </div>

              <p className="text-gray-300 text-sm text-center mt-3">
                {parcelas}x de {formatarMoeda(valorParcela)}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar Empréstimo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}