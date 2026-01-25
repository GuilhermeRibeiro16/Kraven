"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { buscarEmprestimos, calcularDadosFinanceiros } from "@/services/emprestimoService";
import { buscarFaturas, calcularResumoFinanceiro, formatarMoeda, getBancoIcon, getBancoColor, calcularTotalFatura, calcularFaturaMensal, getValorOriginalItem, getJurosItem, getValorComJurosItem } from "@/services/faturaService";
import { DadosFinanceiros } from "@/types/emprestimo";
import { ResumoFinanceiro, Fatura } from "@/types/fatura";

export default function Financeiro() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const [dadosEmprestimos, setDadosEmprestimos] = useState<DadosFinanceiros | null>(null);

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
      // Busca faturas e empréstimos
      const [faturas, emprestimos] = await Promise.all([
        buscarFaturas(user.uid),
        buscarEmprestimos(user.uid),
      ]);

      // Calcula dados dos empréstimos
      const dadosEmp = calcularDadosFinanceiros(emprestimos);
      setDadosEmprestimos(dadosEmp);

      // Calcula resumo financeiro total
      const valorEmprestimos = dadosEmp?.valor_devido || 0;
      const resumoCalc = calcularResumoFinanceiro(faturas, valorEmprestimos);
      setResumo(resumoCalc);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
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

  return (
    <section className=" pt-20 space-y-8 max-w-5xl mx-auto ">
      
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

      {/* Faturas por Banco */}
      {resumo.faturas.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            💳 Faturas de Cartão
          </h3>

          <div className="space-y-4">
            {resumo.faturas.map((fatura) => {
              const totalFatura = calcularTotalFatura(fatura);
              const faturaMensal = calcularFaturaMensal(fatura);

              return (
                <div
                  key={fatura.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                >
                  {/* Header do banco */}
                  <div className={`bg-gradient-to-r ${getBancoColor(fatura.banco)} p-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{getBancoIcon(fatura.banco)}</span>
                      <div>
                        <h4 className="text-white font-bold text-lg capitalize">{fatura.banco}</h4>
                        <p className="text-white/80 text-sm">Vencimento: {new Date(fatura.vencimento).toLocaleDateString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-xs">Este mês</p>
                      <p className="text-white font-bold text-3xl">{formatarMoeda(faturaMensal)}</p>
                      <p className="text-white/60 text-xs mt-1">Total: {formatarMoeda(totalFatura)}</p>
                    </div>
                  </div>

                  {/* Itens da fatura */}
                  <div className="p-6 space-y-3">
                    {fatura.itens.map((item, index) => {
                      const parcelasRestantes = item.parcelas_total - item.parcelas_pagas;
                      const valorRestante = parcelasRestantes * item.valor_parcela;
                      const valorOriginal = getValorOriginalItem(item);
                      const juros = getJurosItem(item);
                      const valorComJuros = getValorComJurosItem(item);
                      const totalJuros = valorComJuros - valorOriginal;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex-1">
                            <p className="text-white font-semibold">{item.descricao}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <p className="text-gray-400 text-sm">
                                {formatarMoeda(item.valor_parcela)}/mês • {parcelasRestantes} de {item.parcelas_total} parcelas
                              </p>
                              {juros > 0 && (
                                <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                  +{juros}% juros
                                </span>
                              )}
                            </div>
                            {juros > 0 && (
                              <p className="text-gray-500 text-xs mt-1">
                                Original: {formatarMoeda(valorOriginal)} • Juros: {formatarMoeda(totalJuros)}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold text-lg">{formatarMoeda(item.valor_parcela)}</p>
                            <p className="text-gray-400 text-xs">
                              Restante: {formatarMoeda(valorRestante)}
                            </p>
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

        {dadosEmprestimos && dadosEmprestimos.valor_devido > 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-sm">Valor devido</p>
                <p className="text-3xl font-bold text-white">{formatarMoeda(dadosEmprestimos.valor_devido)}</p>
              </div>
              <div className={`px-4 py-2 rounded-full ${
                dadosEmprestimos.status === "em_dia" ? "bg-green-500/20 text-green-400" :
                dadosEmprestimos.status === "atrasado" ? "bg-red-500/20 text-red-400" :
                "bg-blue-500/20 text-blue-400"
              }`}>
                {dadosEmprestimos.status === "em_dia" ? "Em dia" :
                 dadosEmprestimos.status === "atrasado" ? "Atrasado" :
                 "Quitado"}
              </div>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <div 
                className="h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${dadosEmprestimos.percentual_quitado}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">
              {dadosEmprestimos.percentual_quitado}% quitado • {dadosEmprestimos.parcelas_restantes} parcelas restantes
            </p>
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