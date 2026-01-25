"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { formatarMoeda, getBancoIcon, getBancoColor, calcularFaturaMensal, calcularTotalFatura, getValorOriginalItem, getJurosItem } from "@/services/faturaService";
import { ArrowLeft, CreditCard, DollarSign, Calendar, TrendingUp, Edit, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { Fatura } from "@/types/fatura";
import { Emprestimo } from "@/types/emprestimo";
import RegistrarPagamentoModal from "@/components/modals/RegistrarPagamentoModal";
import ConfirmarExclusaoModal from "@/components/modals/ConfirmarExclusaoModal";
import EditarFaturaModal from "@/components/modals/EditarFaturaModal";
import EditarEmprestimoModal from "@/components/modals/EditarEmprestimoModal";

interface ClienteInfo {
  uid: string;
  nome: string;
  email: string;
  role: string;
}

export default function ClienteDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState({
    total_devido: 0,
    fatura_mensal: 0,
    total_faturas: 0,
    total_emprestimos: 0,
  });
  const [modalPagamento, setModalPagamento] = useState(false);
  const [pagamentoInfo, setPagamentoInfo] = useState<{
    tipo: "fatura" | "emprestimo";
    itemId: string;
    descricao: string;
    valorParcela: number;
    parcelasPagas: number;
    parcelasTotal: number;
  } | null>(null);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [exclusaoInfo, setExclusaoInfo] = useState<{
    tipo: "fatura" | "emprestimo";
    itemId: string;
    descricao: string;
  } | null>(null);
  const [modalEditarFatura, setModalEditarFatura] = useState(false);
  const [faturaParaEditar, setFaturaParaEditar] = useState<Fatura | null>(null);
  const [modalEditarEmprestimo, setModalEditarEmprestimo] = useState(false);
  const [emprestimoParaEditar, setEmprestimoParaEditar] = useState<Emprestimo | null>(null);

  const uid = params.uid as string;

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard/financeiro");
    } else if (isAdmin && uid) {
      carregarDadosCliente();
    }
  }, [isAdmin, authLoading, uid]); // Removemos router e carregarDadosCliente das dependências

  const carregarDadosCliente = async () => {
    setLoading(true);
    try {
      // Busca informações do cliente
      const clienteDoc = await getDoc(doc(db, "users", uid));
      if (clienteDoc.exists()) {
        const data = clienteDoc.data();
        setCliente({
          uid: clienteDoc.id,
          nome: data.nome || data.email?.split("@")[0] || "Cliente",
          email: data.email || "",
          role: data.role || "cliente",
        });
      }

      // Busca faturas
      const faturasRef = collection(db, `users/${uid}/faturas`);
      const faturasSnapshot = await getDocs(faturasRef);
      const faturasData: Fatura[] = [];
      faturasSnapshot.forEach((doc) => {
        faturasData.push({ id: doc.id, ...doc.data() } as Fatura);
      });
      setFaturas(faturasData);

      // Busca empréstimos
      const emprestimosRef = collection(db, `users/${uid}/emprestimos`);
      const emprestimosSnapshot = await getDocs(emprestimosRef);
      const emprestimosData: Emprestimo[] = [];
      emprestimosSnapshot.forEach((doc) => {
        emprestimosData.push({ id: doc.id, ...doc.data() } as Emprestimo);
      });
      setEmprestimos(emprestimosData);

      // Calcula resumo
      let totalFaturas = 0;
      let faturaMensal = 0;
      faturasData.forEach((fatura) => {
        totalFaturas += calcularTotalFatura(fatura);
        faturaMensal += calcularFaturaMensal(fatura);
      });

      let totalEmprestimos = 0;
      emprestimosData.forEach((emp) => {
        const parcelasRestantes = emp.parcelas_total - emp.parcelas_pagas;
        totalEmprestimos += parcelasRestantes * emp.valor_parcela;
      });

      setResumo({
        total_devido: totalFaturas + totalEmprestimos,
        fatura_mensal: faturaMensal,
        total_faturas: totalFaturas,
        total_emprestimos: totalEmprestimos,
      });
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <section className="space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando dados do cliente...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin || !cliente) {
    return null;
  }

  return (
    <section className=" pt-20 space-y-8 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push("/dashboard/admin")}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            👤 {cliente.nome}
          </h1>
          <p className="text-gray-400">{cliente.email}</p>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-8 h-8 text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">Total Devido</p>
              <p className="text-2xl font-bold text-white">{formatarMoeda(resumo.total_devido)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-gray-400 text-sm">Fatura Mensal</p>
              <p className="text-2xl font-bold text-white">{formatarMoeda(resumo.fatura_mensal)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">Empréstimos</p>
              <p className="text-2xl font-bold text-white">{formatarMoeda(resumo.total_emprestimos)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Faturas */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          💳 Faturas de Cartão ({faturas.length})
        </h3>

        {faturas.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-400">Nenhuma fatura cadastrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faturas.map((fatura) => {
              const faturaMensal = calcularFaturaMensal(fatura);
              const totalFatura = calcularTotalFatura(fatura);

              return (
                <div
                  key={fatura.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${getBancoColor(fatura.banco)} p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getBancoIcon(fatura.banco)}</span>
                        <div>
                          <h4 className="text-white font-bold text-lg capitalize">{fatura.banco}</h4>
                          <p className="text-white/80 text-sm">
                            Vencimento: {new Date(fatura.vencimento).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white/80 text-xs">Este mês</p>
                        <p className="text-white font-bold text-2xl">{formatarMoeda(faturaMensal)}</p>
                        <p className="text-white/60 text-xs">Total: {formatarMoeda(totalFatura)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="p-4 space-y-2">
                    {fatura.itens.map((item, index) => {
                      const parcelasRestantes = item.parcelas_total - item.parcelas_pagas;
                      const valorOriginal = getValorOriginalItem(item);
                      const juros = getJurosItem(item);

                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{item.descricao}</p>
                            <p className="text-gray-400 text-sm">
                              {parcelasRestantes} de {item.parcelas_total} parcelas • {formatarMoeda(item.valor_parcela)}/mês
                            </p>
                            {juros > 0 && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded mt-1 inline-block">
                                +{juros}% juros
                              </span>
                            )}
                          </div>
                          <p className="text-white font-bold">{formatarMoeda(item.valor_parcela)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Ações */}
                  <div className="p-4 border-t border-white/10 flex gap-2">
                    <Button 
                      variant="primary" 
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => {
                        // Pega o primeiro item com parcelas restantes
                        const itemComParcelas = fatura.itens.find(
                          item => item.parcelas_pagas < item.parcelas_total
                        );
                        if (itemComParcelas) {
                          setPagamentoInfo({
                            tipo: "fatura",
                            itemId: fatura.id,
                            descricao: `${fatura.banco} - ${itemComParcelas.descricao}`,
                            valorParcela: itemComParcelas.valor_parcela,
                            parcelasPagas: itemComParcelas.parcelas_pagas,
                            parcelasTotal: itemComParcelas.parcelas_total,
                          });
                          setModalPagamento(true);
                        }
                      }}
                    >
                      <DollarSign size={16} /> Registrar Pagamento
                    </Button>
                    <button 
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      onClick={() => {
                        console.log("Editando fatura:", fatura); // Debug
                        setFaturaParaEditar(fatura);
                        setModalEditarFatura(true);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                      onClick={() => {
                        setExclusaoInfo({
                          tipo: "fatura",
                          itemId: fatura.id,
                          descricao: `Fatura ${fatura.banco}`,
                        });
                        setModalExclusao(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Empréstimos */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          💰 Empréstimos em Dinheiro ({emprestimos.length})
        </h3>

        {emprestimos.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
            <p className="text-gray-400">Nenhum empréstimo cadastrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emprestimos.map((emprestimo) => {
              const parcelasRestantes = emprestimo.parcelas_total - emprestimo.parcelas_pagas;
              const valorDevido = parcelasRestantes * emprestimo.valor_parcela;
              const percentualQuitado = (emprestimo.parcelas_pagas / emprestimo.parcelas_total) * 100;

              return (
                <div
                  key={emprestimo.id}
                  className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-5 h-5 text-purple-400" />
                        <p className="text-white font-bold text-lg">Empréstimo</p>
                        {emprestimo.juros_percentual > 0 && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">
                            +{emprestimo.juros_percentual}% juros
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">
                        {emprestimo.parcelas_pagas}/{emprestimo.parcelas_total} parcelas pagas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Valor devido</p>
                      <p className="text-white font-bold text-2xl">{formatarMoeda(valorDevido)}</p>
                    </div>
                  </div>

                  <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${percentualQuitado}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>{Math.round(percentualQuitado)}% quitado</span>
                    <span>Vencimento: {new Date(emprestimo.vencimento).toLocaleDateString("pt-BR")}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="primary" 
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={() => {
                        setPagamentoInfo({
                          tipo: "emprestimo",
                          itemId: emprestimo.id,
                          descricao: "Empréstimo em dinheiro",
                          valorParcela: emprestimo.valor_parcela,
                          parcelasPagas: emprestimo.parcelas_pagas,
                          parcelasTotal: emprestimo.parcelas_total,
                        });
                        setModalPagamento(true);
                      }}
                    >
                      <DollarSign size={16} /> Registrar Pagamento
                    </Button>
                    <button 
                      className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                      onClick={() => {
                        setEmprestimoParaEditar(emprestimo);
                        setModalEditarEmprestimo(true);
                      }}
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      className="p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
                      onClick={() => {
                        setExclusaoInfo({
                          tipo: "emprestimo",
                          itemId: emprestimo.id,
                          descricao: "Empréstimo em dinheiro",
                        });
                        setModalExclusao(true);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Registrar Pagamento */}
      {pagamentoInfo && (
        <RegistrarPagamentoModal
          open={modalPagamento}
          onClose={() => {
            setModalPagamento(false);
            setPagamentoInfo(null);
          }}
          onSuccess={() => {
            carregarDadosCliente(); // Recarrega os dados
          }}
          tipo={pagamentoInfo.tipo}
          clienteUid={uid}
          itemId={pagamentoInfo.itemId}
          itemDescricao={pagamentoInfo.descricao}
          valorParcela={pagamentoInfo.valorParcela}
          parcelasPagas={pagamentoInfo.parcelasPagas}
          parcelasTotal={pagamentoInfo.parcelasTotal}
        />
      )}

      {/* Modal de Confirmar Exclusão */}
      {exclusaoInfo && (
        <ConfirmarExclusaoModal
          open={modalExclusao}
          onClose={() => {
            setModalExclusao(false);
            setExclusaoInfo(null);
          }}
          onSuccess={() => {
            carregarDadosCliente(); // Recarrega os dados
          }}
          tipo={exclusaoInfo.tipo}
          clienteUid={uid}
          itemId={exclusaoInfo.itemId}
          itemDescricao={exclusaoInfo.descricao}
        />
      )}


      {/* Modal de Editar Fatura */} 
        {faturaParaEditar && (
        <EditarFaturaModal
          open={modalEditarFatura}
          onClose={() => {
            setModalEditarFatura(false);
            setFaturaParaEditar(null);
          }}
          onSuccess={() => {
            carregarDadosCliente(); // Recarrega os dados
          }}
          clienteUid={uid}
          fatura={faturaParaEditar}
        />
      )}
      {/* Modal de Editar Empréstimo */}
      {emprestimoParaEditar && (
        <EditarEmprestimoModal
          open={modalEditarEmprestimo}
          onClose={() => {
            setModalEditarEmprestimo(false);
            setEmprestimoParaEditar(null);
          }}
          onSuccess={() => {
            carregarDadosCliente(); // Recarrega os dados
          }}
          clienteUid={uid}
          emprestimo={emprestimoParaEditar}
        />
      )}

    </section>
  );
}