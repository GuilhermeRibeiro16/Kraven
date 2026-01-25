"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatarMoeda, getBancoIcon, getBancoColor, calcularTotalFatura, getValorOriginalItem, getJurosItem } from "@/services/faturaService";
import { Fatura } from "@/types/fatura";
import { Emprestimo } from "@/types/emprestimo";
import { CreditCard, TrendingUp, Calendar, ChevronRight } from "lucide-react";

export default function EmprestimosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [resumo, setResumo] = useState({
    total_emprestado: 0,
    total_pago: 0,
    percentual_pago: 0,
  });
  const [itemExpandido, setItemExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Busca faturas
      const faturasRef = collection(db, `users/${user.uid}/faturas`);
      const faturasSnapshot = await getDocs(faturasRef);
      const faturasData: Fatura[] = [];
      faturasSnapshot.forEach((doc) => {
        faturasData.push({ id: doc.id, ...doc.data() } as Fatura);
      });
      setFaturas(faturasData);

      // Busca empréstimos
      const emprestimosRef = collection(db, `users/${user.uid}/emprestimos`);
      const emprestimosSnapshot = await getDocs(emprestimosRef);
      const emprestimosData: Emprestimo[] = [];
      emprestimosSnapshot.forEach((doc) => {
        emprestimosData.push({ id: doc.id, ...doc.data() } as Emprestimo);
      });
      setEmprestimos(emprestimosData);

      // Calcula resumo
      let totalEmprestado = 0;
      let totalPago = 0;

      // Soma faturas
      faturasData.forEach((fatura) => {
        const totalFatura = calcularTotalFatura(fatura);
        fatura.itens.forEach((item) => {
          const valorTotal = item.parcelas_total * item.valor_parcela;
          const valorPago = item.parcelas_pagas * item.valor_parcela;
          totalEmprestado += valorTotal;
          totalPago += valorPago;
        });
      });

      // Soma empréstimos
      emprestimosData.forEach((emp) => {
        const valorTotal = emp.parcelas_total * emp.valor_parcela;
        const valorPago = emp.parcelas_pagas * emp.valor_parcela;
        totalEmprestado += valorTotal;
        totalPago += valorPago;
      });

      const percentual = totalEmprestado > 0 ? (totalPago / totalEmprestado) * 100 : 0;

      setResumo({
        total_emprestado: totalEmprestado,
        total_pago: totalPago,
        percentual_pago: Math.round(percentual),
      });
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className=" pt-20 space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando seus empréstimos...</p>
          </div>
        </div>
      </section>
    );
  }

  const temDados = faturas.length > 0 || emprestimos.length > 0;

  return (
    <section className=" pt-20 space-y-8 max-w-5xl mx-auto">
      
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">💰 Meus Empréstimos</h1>
        <p className="text-gray-400">Acompanhe suas faturas e empréstimos</p>
      </div>

      {!temDados ? (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
          <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💳</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum empréstimo encontrado</h3>
          <p className="text-gray-400">Você não possui empréstimos ou faturas no momento.</p>
        </div>
      ) : (
        <>
          {/* Card de Resumo */}
          <div className="bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-pink-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-white font-semibold mb-6 text-lg">📊 Resumo Geral</h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Emprestado</p>
                <p className="text-3xl font-bold text-white">{formatarMoeda(resumo.total_emprestado)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Pago</p>
                <p className="text-3xl font-bold text-green-400">{formatarMoeda(resumo.total_pago)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Restante</p>
                <p className="text-3xl font-bold text-purple-400">
                  {formatarMoeda(resumo.total_emprestado - resumo.total_pago)}
                </p>
              </div>
            </div>

            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${resumo.percentual_pago}%` }}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">{resumo.percentual_pago}% quitado</p>
          </div>

          {/* Faturas */}
          {faturas.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">💳 Faturas de Cartão</h3>
              <div className="space-y-4">
                {faturas.map((fatura) => {
                  const totalFatura = calcularTotalFatura(fatura);
                  const totalItens = fatura.itens.length;
                  const itensPagos = fatura.itens.filter(item => item.parcelas_pagas >= item.parcelas_total).length;
                  const percentualFatura = totalItens > 0 ? (itensPagos / totalItens) * 100 : 0;
                  const isExpandido = itemExpandido === fatura.id;

                  return (
                    <div
                      key={fatura.id}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                    >
                      {/* Header */}
                      <button
                        onClick={() => setItemExpandido(isExpandido ? null : fatura.id)}
                        className={`w-full bg-gradient-to-r ${getBancoColor(fatura.banco)} p-6 flex items-center justify-between hover:opacity-90 transition-opacity`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-4xl">{getBancoIcon(fatura.banco)}</span>
                          <div className="text-left">
                            <h4 className="text-white font-bold text-xl capitalize">{fatura.banco}</h4>
                            <p className="text-white/80 text-sm">
                              {totalItens} {totalItens === 1 ? "item" : "itens"} • {Math.round(percentualFatura)}% pago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-white/80 text-sm">Restante</p>
                            <p className="text-white font-bold text-2xl">{formatarMoeda(totalFatura)}</p>
                          </div>
                          <ChevronRight
                            className={`w-6 h-6 text-white transition-transform duration-300 ${
                              isExpandido ? "rotate-90" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Detalhes (expandível) */}
                      {isExpandido && (
                        <div className="p-6 space-y-3">
                          {fatura.itens.map((item, index) => {
                            const parcelasRestantes = item.parcelas_total - item.parcelas_pagas;
                            const valorRestante = parcelasRestantes * item.valor_parcela;
                            const percentualItem = (item.parcelas_pagas / item.parcelas_total) * 100;
                            const juros = getJurosItem(item);

                            return (
                              <div key={index} className="bg-white/5 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <p className="text-white font-semibold">{item.descricao}</p>
                                    <p className="text-gray-400 text-sm">
                                      {item.parcelas_pagas}/{item.parcelas_total} parcelas pagas
                                    </p>
                                    {juros > 0 && (
                                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mt-1 inline-block">
                                        +{juros}% juros
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-white font-bold text-lg">{formatarMoeda(valorRestante)}</p>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className="h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                                    style={{ width: `${percentualItem}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empréstimos em Dinheiro */}
          {emprestimos.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-4">💵 Empréstimos em Dinheiro</h3>
              <div className="space-y-4">
                {emprestimos.map((emprestimo) => {
                  const parcelasRestantes = emprestimo.parcelas_total - emprestimo.parcelas_pagas;
                  const valorDevido = parcelasRestantes * emprestimo.valor_parcela;
                  const percentualPago = (emprestimo.parcelas_pagas / emprestimo.parcelas_total) * 100;

                  return (
                    <div
                      key={emprestimo.id}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-lg">Empréstimo</p>
                            <p className="text-gray-400 text-sm">
                              {emprestimo.parcelas_pagas}/{emprestimo.parcelas_total} parcelas pagas
                            </p>
                          </div>
                          {emprestimo.juros_percentual > 0 && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                              +{emprestimo.juros_percentual}% juros
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-sm">Restante</p>
                          <p className="text-white font-bold text-2xl">{formatarMoeda(valorDevido)}</p>
                        </div>
                      </div>

                      <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-3 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentualPago}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{Math.round(percentualPago)}% quitado</span>
                        <span className="text-gray-400">
                          Vencimento: {new Date(emprestimo.vencimento).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}