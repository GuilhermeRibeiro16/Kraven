"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatarMoeda, getBancoIcon, getBancoColor } from "@/services/faturaService";
import { Fatura, HistoricoItemFatura } from "@/types/fatura";
import { Emprestimo, HistoricoItem } from "@/types/emprestimo";
import { CheckCircle, Calendar, CreditCard, Filter } from "lucide-react";

interface PagamentoHistorico {
  id: string;
  tipo: "fatura" | "emprestimo";
  descricao: string;
  valor: number;
  data: string;
  banco?: string;
  quantidade_parcelas?: number;
}

export default function PagamentosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pagamentos, setPagamentos] = useState<PagamentoHistorico[]>([]);
  const [filtro, setFiltro] = useState<"todos" | "fatura" | "emprestimo">("todos");
  const [resumo, setResumo] = useState({
    total_pago: 0,
    quantidade_pagamentos: 0,
  });

  useEffect(() => {
    if (user) {
      carregarHistorico();
    }
  }, [user]);

  const carregarHistorico = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const historicoPagamentos: PagamentoHistorico[] = [];
      let totalPago = 0;

      // Busca histórico das faturas
      const faturasRef = collection(db, `users/${user.uid}/faturas`);
      const faturasSnapshot = await getDocs(faturasRef);
      
      faturasSnapshot.forEach((doc) => {
        const fatura = doc.data() as Fatura;
        
        // Busca histórico de cada item da fatura
        fatura.itens.forEach((item) => {
          if (item.historico && Array.isArray(item.historico) && item.historico.length > 0) {
            item.historico.forEach((hist: HistoricoItemFatura) => {
              historicoPagamentos.push({
                id: `${doc.id}-${item.descricao}-${hist.data}`,
                tipo: "fatura",
                descricao: `${fatura.banco} - ${item.descricao}`,
                valor: hist.valor,
                data: hist.data,
                banco: fatura.banco,
                quantidade_parcelas: hist.quantidade_parcelas || 1,
              });
              totalPago += hist.valor;
            });
          }
        });
      });

      // Busca histórico dos empréstimos
      const emprestimosRef = collection(db, `users/${user.uid}/emprestimos`);
      const emprestimosSnapshot = await getDocs(emprestimosRef);
      
      emprestimosSnapshot.forEach((doc) => {
        const emprestimo = doc.data() as Emprestimo;
        
        if (emprestimo.historico && Array.isArray(emprestimo.historico) && emprestimo.historico.length > 0) {
          emprestimo.historico.forEach((hist: HistoricoItem) => {
            historicoPagamentos.push({
              id: `${doc.id}-${hist.data}`,
              tipo: "emprestimo",
              descricao: "Empréstimo em dinheiro",
              valor: hist.valor,
              data: hist.data,
              quantidade_parcelas: hist.quantidade_parcelas || 1,
            });
            totalPago += hist.valor;
          });
        }
      });

      // Ordena por data (mais recente primeiro)
      historicoPagamentos.sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });

      setPagamentos(historicoPagamentos);
      setResumo({
        total_pago: totalPago,
        quantidade_pagamentos: historicoPagamentos.length,
      });
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const pagamentosFiltrados = pagamentos.filter((pag) => {
    if (filtro === "todos") return true;
    return pag.tipo === filtro;
  });

  if (loading) {
    return (
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando histórico de pagamentos...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className=" pt-20 space-y-8 max-w-5xl mx-auto">
      
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">💸 Histórico de Pagamentos</h1>
        <p className="text-gray-400">Acompanhe todos os seus pagamentos realizados</p>
      </div>

      {/* Card de Resumo */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-900/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-600/30 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Pago</p>
              <p className="text-3xl font-bold text-white">{formatarMoeda(resumo.total_pago)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-pink-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600/30 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pagamentos Realizados</p>
              <p className="text-3xl font-bold text-white">{resumo.quantidade_pagamentos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-gray-400">
          <Filter size={18} />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>
        <button
          onClick={() => setFiltro("todos")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            filtro === "todos"
              ? "bg-purple-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro("fatura")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            filtro === "fatura"
              ? "bg-purple-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          💳 Faturas
        </button>
        <button
          onClick={() => setFiltro("emprestimo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            filtro === "emprestimo"
              ? "bg-purple-600 text-white"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          💰 Empréstimos
        </button>
      </div>

      {/* Lista de Pagamentos */}
      {pagamentosFiltrados.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
          <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📋</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum pagamento encontrado</h3>
          <p className="text-gray-400">
            {filtro === "todos"
              ? "Você ainda não realizou nenhum pagamento."
              : `Você não tem pagamentos de ${filtro === "fatura" ? "faturas" : "empréstimos"}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagamentosFiltrados.map((pagamento) => {
            const dataPagamento = new Date(pagamento.data);
            const dataFormatada = dataPagamento.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return (
              <div
                key={pagamento.id}
                className="bg-white/5 backdrop-blur-xl rounded-xl p-5 border border-white/10 hover:border-purple-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Ícone */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        pagamento.tipo === "fatura"
                          ? pagamento.banco
                            ? `bg-gradient-to-r ${getBancoColor(pagamento.banco)}`
                            : "bg-gradient-to-r from-purple-600 to-pink-600"
                          : "bg-gradient-to-r from-green-600 to-emerald-600"
                      }`}
                    >
                      {pagamento.tipo === "fatura" && pagamento.banco ? (
                        <span className="text-2xl">{getBancoIcon(pagamento.banco)}</span>
                      ) : (
                        <CreditCard className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Informações */}
                    <div>
                      <p className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                        {pagamento.descricao}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-sm">{dataFormatada}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-400 text-sm capitalize">{pagamento.tipo}</span>
                        {pagamento.quantidade_parcelas && pagamento.quantidade_parcelas > 1 && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400 text-sm">
                              {pagamento.quantidade_parcelas} parcelas
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Valor */}
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-xl">{formatarMoeda(pagamento.valor)}</p>
                    <div className="flex items-center gap-1 mt-1 text-green-400/80">
                      <CheckCircle size={14} />
                      <span className="text-xs">Pago</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mensagem se tiver muitos pagamentos */}
      {pagamentosFiltrados.length > 10 && (
        <div className="text-center text-gray-400 text-sm">
          Mostrando {pagamentosFiltrados.length} pagamentos
        </div>
      )}
    </section>
  );
}