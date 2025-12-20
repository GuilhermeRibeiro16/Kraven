import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Fatura, ResumoFinanceiro } from "@/types/fatura";

export async function buscarFaturas(userId: string): Promise<Fatura[]> {
  try {
    const faturasRef = collection(db, `users/${userId}/faturas`);
    const q = query(faturasRef);
    const snapshot = await getDocs(q);

    const faturas: Fatura[] = [];
    snapshot.forEach((doc) => {
      faturas.push({
        id: doc.id,
        ...doc.data(),
      } as Fatura);
    });

    return faturas;
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    return [];
  }
}

export function calcularTotalFatura(fatura: Fatura): number {
  return fatura.itens.reduce((total, item) => {
    const parcelas_restantes = item.parcelas_total - item.parcelas_pagas;
    return total + (parcelas_restantes * item.valor_parcela);
  }, 0);
}

export function calcularFaturaMensal(fatura: Fatura): number {
  // Soma apenas o valor de UMA parcela de cada item (o que vai pagar este mês)
  return fatura.itens.reduce((total, item) => {
    const parcelas_restantes = item.parcelas_total - item.parcelas_pagas;
    // Se ainda tem parcelas restantes, adiciona o valor da parcela mensal
    if (parcelas_restantes > 0) {
      return total + item.valor_parcela;
    }
    return total;
  }, 0);
}

export function calcularResumoFinanceiro(
  faturas: Fatura[],
  valorEmprestimos: number
): ResumoFinanceiro {
  const total_faturas = faturas.reduce((total, fatura) => {
    return total + calcularTotalFatura(fatura);
  }, 0);

  return {
    total_faturas,
    total_emprestimos: valorEmprestimos,
    total_geral: total_faturas + valorEmprestimos,
    faturas,
  };
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

export function formatarData(data: string): string {
  const date = new Date(data);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function getBancoIcon(banco: string): string {
  const icons: Record<string, string> = {
    nubank: "💳",
    inter: "🏦",
    outro: "💰",
  };
  return icons[banco] || "💳";
}

export function getBancoColor(banco: string): string {
  const colors: Record<string, string> = {
    nubank: "from-purple-600 to-purple-800",
    inter: "from-orange-500 to-orange-700",
    outro: "from-blue-600 to-blue-800",
  };
  return colors[banco] || "from-gray-600 to-gray-800";
}