"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { buscarEmprestimos, calcularDadosFinanceiros } from "@/services/emprestimoService";
import { buscarFaturas, calcularResumoFinanceiro, formatarMoeda, getBancoIcon, getBancoColor, calcularTotalFatura, calcularFaturaMensal, getValorOriginalItem, getJurosItem, getValorComJurosItem } from "@/services/faturaService";
import { DadosFinanceiros, Emprestimo } from "@/types/emprestimo";
import { ResumoFinanceiro, Fatura } from "@/types/fatura";

interface FaturaPorBanco {
  banco: string;
  faturas: Fatura[];
}

export default function Financeiro() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [dadosEmprestimos, setDadosEmprestimos] = useState<DadosFinanceiros | null>(null);
  const [emprestimosLista, setEmprestimosLista] = useState<Emprestimo[]>([]);

  useEffect(() => {
    if (user) {
      console.log("UID do usuário:", user.uid);
      carregarDados();
    }
  }, [user]);

  const carregarDados = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [faturas, emprestimos] = await Promise.all([
        buscarFaturas(user.uid),
        buscarEmprestimos(user.uid),
      ]);

      setEmprestimosLista(emprestimos);

      const dadosEmp = calcularDadosFinanceiros(emprestimos);
      setDadosEmprestimos(dadosEmp);

      const valorEmprestimos = dadosEmp?.valor_devido || 0;
      const resumoCalc = calcularResumoFinanceiro(faturas, valorEmprestimos);
      setResumo(resumoCalc);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupa faturas por banco
  const agruparFaturasPorBanco = (): FaturaPorBanco[] => {
    if (!resumo) return [];
    
    const grupos: { [key: string]: Fatura[] } = {};
    
    resumo.faturas.forEach(fatura => {
      if (!grupos[fatura.banco]) {
        grupos[fatura.banco] = [];
      }
      grupos[fatura.banco].push(fatura);
    });

    return Object.entries(grupos).map(([banco, faturas]) => ({
      banco,
      faturas
    }));
  };

  // Ordena itens por proximidade de quitação
  const ordenarItensPorProximidade = (itens: any[]) => {
    return [...itens].sort((a, b) => {
      const restantesA = a.parcelas_total - a.parcelas_pagas;
      const restantesB = b.parcelas_total - b.parcelas_pagas;
      return restantesA - restantesB;
    });
  };

  if (loading) {
    return (
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando seus dados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!resumo) {
    return (
      <section className="space-y-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Visão Geral Financeira</h1>
          <p className="text-gray-400">Acompanhe suas faturas e empréstimos</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
          <div className="w-20 h-20 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💰</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum dado encontrado</h3>
          <p className="text-gray-400 mb-6">Você não possui faturas ou empréstimos ativos no momento.</p>
        </div>
      </section>
    );
  }

  const faturasPorBanco = agruparFaturasPorBanco();

  return (
    <section className="space-y-8 max-w-5xl mx-auto">
      
      {/* Título da página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Visão Geral Financeira</h1>
        <p className="text-gray-400">Acompanhe suas faturas e empréstimos</p>
      </div>

      {/* Card de Resumo Total */}
      <div className="bg-gradient-to-br from-purple-900/50 via-purple-800/30 to-pink-900/50 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
        <p className="text-gray-300 text-sm mb-2 uppercase tracking-wide">Fatura deste mês</p>
        <h2 className="text-5xl font-black text-white mb-2">
          {formatarMoeda(resumo.fatura_mensal)}
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Valor a pagar agora • Total parcelado: {formatarMoeda(resumo.total_geral)}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-gray-300 text-xs mb-1">Faturas de Cartão</p>
            <p className="text-2xl font-bold text-white">{formatarMoeda(resumo.total_faturas)}</p>
            <p className="text-gray-400 text-xs mt-1">Total parcelado</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-gray-300 text-xs mb-1">Empréstimos</p>
            <p className="text-2xl font-bold text-white">{formatarMoeda(resumo.total_emprestimos)}</p>
            <p className="text-gray-400 text-xs mt-1">Saldo devedor</p>
          </div>
        </div>
      </div>

      {/* Faturas Agrupadas por Banco */}
      {faturasPorBanco.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            💳 Faturas de Cartão
          </h3>

          <div className="space-y-6">
            {faturasPorBanco.map(({ banco, faturas: faturasGrupo }) => {
              const todosItens = faturasGrupo.flatMap(f => 
                f.itens.map(item => ({ ...item, faturaId: f.id, vencimento: f.vencimento }))
              );
              const itensOrdenados = ordenarItensPorProximidade(todosItens);
              const totalBanco = faturasGrupo.reduce((sum, f) => sum + calcularTotalFatura(f), 0);
              const mensalBanco = faturasGrupo.reduce((sum, f) => sum + calcularFaturaMensal(f), 0);

              return (
                <div key={banco} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300">
                  
                  {/* Header do Banco */}
                  <div className={`bg-gradient-to-r ${getBancoColor(banco)} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getBancoIcon(banco)}</span>
                        <div>
                          <h4 className="text-white font-bold text-lg capitalize">{banco}</h4>
                          <p className="text-white/80 text-sm">{itensOrdenados.length} itens</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-xs">Este mês</p>
                        <p className="text-white font-bold text-3xl">{formatarMoeda(mensalBanco)}</p>
                        <p className="text-white/60 text-xs mt-1">Total: {formatarMoeda(totalBanco)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Itens Ordenados */}
                  <div className="p-6 space-y-3">
                    {itensOrdenados.map((item, index) => {
                      const parcelasRestantes = item.parcelas_total - item.parcelas_pagas;
                      const valorRestante = parcelasRestantes * item.valor_parcela;
                      const valorOriginal = getValorOriginalItem(item);
                      const juros = getJurosItem(item);
                      const valorComJuros = getValorComJurosItem(item);
                      const totalJuros = valorComJuros - valorOriginal;
                      const percentual = (item.parcelas_pagas / item.parcelas_total) * 100;

                      return (
                        <div
                          key={index}
                          className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-white font-semibold">{item.descricao}</p>
                                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold">
                                  {item.parcelas_pagas}/{item.parcelas_total}
                                </span>
                                {juros > 0 && (
                                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                    +{juros}% juros
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-400 text-sm">
                                {formatarMoeda(item.valor_parcela)}/mês • Faltam {parcelasRestantes} parcelas
                              </p>
                              {juros > 0 && (
                                <p className="text-gray-500 text-xs mt-1">
                                  Original: {formatarMoeda(valorOriginal)} • Juros: {formatarMoeda(totalJuros)}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-white font-bold text-lg">{formatarMoeda(item.valor_parcela)}</p>
                              <p className="text-gray-400 text-xs">
                                Restante: {formatarMoeda(valorRestante)}
                              </p>
                            </div>
                          </div>

                          {/* Barra de Progresso */}
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                              style={{ width: `${percentual}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empréstimos em Dinheiro */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          💰 Empréstimos em Dinheiro
        </h3>

        {emprestimosLista.length > 0 ? (
          <div className="space-y-4">
            {emprestimosLista.map((emprestimo) => {
              const parcelasRestantes = emprestimo.parcelas_total - emprestimo.parcelas_pagas;
              const valorDevido = parcelasRestantes * emprestimo.valor_parcela;
              const percentualQuitado = (emprestimo.parcelas_pagas / emprestimo.parcelas_total) * 100;

              return (
                <div key={emprestimo.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-white font-bold text-lg">Empréstimo</p>
                        <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-bold">
                          {emprestimo.parcelas_pagas}/{emprestimo.parcelas_total}
                        </span>
                        {emprestimo.juros_percentual > 0 && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                            +{emprestimo.juros_percentual}% juros
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {formatarMoeda(emprestimo.valor_parcela)}/mês • Faltam {parcelasRestantes} parcelas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Valor devido</p>
                      <p className="text-white font-bold text-2xl">{formatarMoeda(valorDevido)}</p>
                    </div>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentualQuitado}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-400">
                      {Math.round(percentualQuitado)}% quitado
                    </p>
                    <p className="text-gray-400">
                      Vencimento: {new Date(emprestimo.vencimento).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-400">Nenhum empréstimo em dinheiro ativo</p>
          </div>
        )}
      </div>
    </section>
  );
}