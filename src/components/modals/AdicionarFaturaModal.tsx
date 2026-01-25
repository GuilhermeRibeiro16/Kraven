"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatarMoeda } from "@/services/faturaService";

interface Cliente {
  uid: string;
  nome: string;
  email: string;
}

interface ItemFaturaForm {
  descricao: string;
  valor_original: number;
  juros_percentual: number;
  parcelas_total: number;
  parcelas_pagas: number;
}

interface AdicionarFaturaModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdicionarFaturaModal({ open, onClose, onSuccess }: AdicionarFaturaModalProps) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState("");
  const [banco, setBanco] = useState<"nubank" | "inter" | "outro">("nubank");
  const [vencimento, setVencimento] = useState("");
  const [itens, setItens] = useState<ItemFaturaForm[]>([
    { descricao: "", valor_original: 0, juros_percentual: 0, parcelas_total: 1, parcelas_pagas: 0 }
  ]);
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

  const adicionarItem = () => {
    setItens([...itens, { descricao: "", valor_original: 0, juros_percentual: 0, parcelas_total: 1, parcelas_pagas: 0 }]);
  };

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index));
    }
  };

  const atualizarItem = (index: number, campo: keyof ItemFaturaForm, valor: any) => {
    const novosItens = [...itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setItens(novosItens);
  };

  const calcularResumo = () => {
    let totalFatura = 0;
    let valorMensal = 0;

    itens.forEach((item) => {
      const valorComJuros = calcularValorComJuros(item.valor_original, item.juros_percentual);
      const parcela = valorComJuros / item.parcelas_total;
      totalFatura += valorComJuros;
      valorMensal += parcela;
    });

    return { totalFatura, valorMensal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!clienteSelecionado) {
      setError("Selecione um cliente");
      return;
    }

    if (!vencimento) {
      setError("Defina a data de vencimento");
      return;
    }

    const itensValidos = itens.filter(item => item.descricao && item.valor_original > 0);
    if (itensValidos.length === 0) {
      setError("Adicione pelo menos um item válido");
      return;
    }

    setLoading(true);

    try {
      const itensProcessados = itensValidos.map((item) => {
        const valorComJuros = calcularValorComJuros(item.valor_original, item.juros_percentual);
        return {
          descricao: item.descricao,
          valor_original: item.valor_original,
          juros_percentual: item.juros_percentual,
          valor_com_juros: valorComJuros,
          parcelas_total: item.parcelas_total,
          parcelas_pagas: item.parcelas_pagas,
          valor_parcela: valorComJuros / item.parcelas_total,
          total: valorComJuros,
        };
      });

      const totalFatura = itensProcessados.reduce((sum, item) => sum + item.total, 0);

      await addDoc(collection(db, `users/${clienteSelecionado}/faturas`), {
        banco,
        status: "aberta",
        vencimento,
        total: totalFatura,
        created_at: new Date().toISOString(),
        itens: itensProcessados,
      });

      onSuccess();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar fatura:", error);
      setError("Erro ao adicionar fatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClienteSelecionado("");
    setBanco("nubank");
    setVencimento("");
    setItens([{ descricao: "", valor_original: 0, juros_percentual: 0, parcelas_total: 1, parcelas_pagas: 0 }]);
    setError("");
  };

  if (!open) return null;

  const { totalFatura, valorMensal } = calcularResumo();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-purple-500/30 z-10">
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md p-6 border-b border-white/10">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
            <X />
          </button>
          <h2 className="text-2xl font-bold text-white">💳 Adicionar Fatura</h2>
          <p className="text-gray-400 text-sm mt-1">Adicione compras no cartão do cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
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
              <label className="block text-gray-300 text-sm font-medium mb-2">Banco</label>
              <select
                value={banco}
                onChange={(e) => setBanco(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="nubank" className="bg-gray-900">Nubank</option>
                <option value="inter" className="bg-gray-900">Inter</option>
                <option value="outro" className="bg-gray-900">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Vencimento</label>
              <input
                type="date"
                value={vencimento}
                onChange={(e) => setVencimento(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Itens da Fatura</h3>
              <button
                type="button"
                onClick={adicionarItem}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm transition-colors"
              >
                <Plus size={16} /> Adicionar Item
              </button>
            </div>

            <div className="space-y-4">
              {itens.map((item, index) => {
                const valorComJuros = calcularValorComJuros(item.valor_original, item.juros_percentual);
                const valorParcela = valorComJuros / item.parcelas_total;

                return (
                  <div key={index} className="bg-white/5 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Item {index + 1}</span>
                      {itens.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerItem(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Descrição (ex: Spotify, Netflix)"
                      value={item.descricao}
                      onChange={(e) => atualizarItem(index, "descricao", e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Valor</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.valor_original || ""}
                          onChange={(e) => atualizarItem(index, "valor_original", parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Parcelas</label>
                        <input
                          type="number"
                          min="1"
                          value={item.parcelas_total}
                          onChange={(e) => atualizarItem(index, "parcelas_total", parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="text-gray-400 text-xs mb-1 block">Juros (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={item.juros_percentual}
                          onChange={(e) => atualizarItem(index, "juros_percentual", parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Parcelas já pagas</label>
                      <input
                        type="number"
                        min="0"
                        max={item.parcelas_total}
                        value={item.parcelas_pagas}
                        onChange={(e) => atualizarItem(index, "parcelas_pagas", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
                        placeholder="0"
                      />
                      <p className="text-gray-500 text-xs mt-1">Quantas parcelas já foram pagas? (opcional)</p>
                    </div>

                    {item.valor_original > 0 && (
                      <div className="bg-purple-900/20 rounded-lg p-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total c/ juros:</span>
                          <span className="text-white font-semibold">{formatarMoeda(valorComJuros)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Parcela:</span>
                          <span className="text-purple-400 font-semibold">{formatarMoeda(valorParcela)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
            <h4 className="text-white font-semibold mb-4">💰 Resumo da Fatura</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Total da fatura:</span>
                <span className="text-white font-bold text-xl">{formatarMoeda(totalFatura)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Valor mensal:</span>
                <span className="text-purple-400 font-bold">{formatarMoeda(valorMensal)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button  variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button  disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar Fatura"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}