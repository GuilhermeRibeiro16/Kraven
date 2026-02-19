"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { formatarMoeda } from "@/services/faturaService";
import { Users, DollarSign, TrendingUp, Clock, Plus, CreditCard, UserPlus } from "lucide-react";
import AdicionarFaturaModal from "@/components/modals/AdicionarFaturaModal";
import AdicionarEmprestimoModal from "@/components/modals/AdicionarEmprestimoModal";
import AdicionarClienteModal from "@/components/modals/AdicionarClienteModal";
import Button from "@/components/ui/Button";

interface ClienteResumo {
  uid: string;
  nome: string;
  email: string;
  total_devido: number;
  role: string;
}

export default function AdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [clientes, setClientes] = useState<ClienteResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [resumoGeral, setResumoGeral] = useState({
    total_emprestado: 0,
    total_clientes: 0,
    media_por_cliente: 0,
  });
  const [modalFatura, setModalFatura] = useState(false);
  const [modalEmprestimo, setModalEmprestimo] = useState(false);
  const [modalCliente, setModalCliente] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/dashboard/financeiro");
    }
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      carregarClientes();
    }
  }, [isAdmin]);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      const clientesData: ClienteResumo[] = [];
      let totalEmprestado = 0;

      for (const userDoc of snapshot.docs) {
        const userData = userDoc.data();
        
        if (userData.role === "admin") continue;

        const faturasRef = collection(db, `users/${userDoc.id}/faturas`);
        const faturasSnapshot = await getDocs(faturasRef);
        
        let totalCliente = 0;
        faturasSnapshot.forEach((faturaDoc) => {
          const fatura = faturaDoc.data();
          if (fatura.itens) {
            fatura.itens.forEach((item: any) => {
              const parcelasRestantes = item.parcelas_total - item.parcelas_pagas;
              totalCliente += parcelasRestantes * item.valor_parcela;
            });
          }
        });

        const emprestimosRef = collection(db, `users/${userDoc.id}/emprestimos`);
        const emprestimosSnapshot = await getDocs(emprestimosRef);
        
        emprestimosSnapshot.forEach((emprestimoDoc) => {
          const emprestimo = emprestimoDoc.data();
          const parcelasRestantes = emprestimo.parcelas_total - emprestimo.parcelas_pagas;
          totalCliente += parcelasRestantes * emprestimo.valor_parcela;
        });

        totalEmprestado += totalCliente;

        clientesData.push({
          uid: userDoc.id,
          nome: userData.nome || userData.email?.split("@")[0] || "Cliente",
          email: userData.email || "",
          total_devido: totalCliente,
          role: userData.role || "cliente",
        });
      }

      setClientes(clientesData);
      setResumoGeral({
        total_emprestado: totalEmprestado,
        total_clientes: clientesData.length,
        media_por_cliente: clientesData.length > 0 ? totalEmprestado / clientesData.length : 0,
      });
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <section className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando painel administrativo...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <section className="relative z-10 pt-20 px-4 sm:px-6 lg:px-8 pb-20 space-y-8 max-w-7xl mx-auto">
      
      {/* Título */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          👑 Painel Administrativo
        </h1>
        <p className="text-gray-400">Gerencie todos os clientes e empréstimos</p>
      </div>

      {/* Botões de Ação Rápida */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button 
          onClick={() => setModalCliente(true)} 
          variant="primary" 
          className="flex items-center gap-2"
        >
          <UserPlus size={20} /> Adicionar Cliente
        </Button>
        <Button 
          onClick={() => setModalFatura(true)} 
          variant="secondary" 
          className="flex items-center gap-2"
        >
          <Plus size={20} /> Adicionar Fatura
        </Button>
        <Button 
          onClick={() => setModalEmprestimo(true)} 
          variant="secondary" 
          className="flex items-center gap-2"
        >
          <CreditCard size={20} /> Adicionar Empréstimo
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 text-purple-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Total Emprestado</p>
          <p className="text-3xl font-bold text-white">{formatarMoeda(resumoGeral.total_emprestado)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-blue-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Clientes Ativos</p>
          <p className="text-3xl font-bold text-white">{resumoGeral.total_clientes}</p>
        </div>

        <div className="bg-gradient-to-br from-green-600/20 to-green-900/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-green-400" />
          </div>
          <p className="text-gray-400 text-sm mb-1">Média por Cliente</p>
          <p className="text-3xl font-bold text-white">{formatarMoeda(resumoGeral.media_por_cliente)}</p>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          👥 Clientes ({clientes.length})
        </h3>

        {clientes.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-gray-400">Nenhum cliente cadastrado ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientes.map((cliente) => (
              <div
                key={cliente.uid}
                className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
                onClick={() => router.push(`/dashboard/admin/cliente/${cliente.uid}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-white font-bold text-lg group-hover:text-purple-400 transition-colors">
                      {cliente.nome}
                    </h4>
                    <p className="text-gray-400 text-sm">{cliente.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-xs">Total devido</p>
                    <p className="text-2xl font-bold text-white">{formatarMoeda(cliente.total_devido)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Clique para ver detalhes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AdicionarClienteModal
        open={modalCliente}
        onClose={() => setModalCliente(false)}
        onSuccess={() => {
          carregarClientes();
        }}
      />

      <AdicionarFaturaModal 
        open={modalFatura} 
        onClose={() => setModalFatura(false)}
        onSuccess={() => {
          carregarClientes();
        }}
      />
      
      <AdicionarEmprestimoModal 
        open={modalEmprestimo} 
        onClose={() => setModalEmprestimo(false)}
        onSuccess={() => {
          carregarClientes();
        }}
      />
    </section>
  );
}