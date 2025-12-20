import { collection, query, getDocs, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Emprestimo, DadosFinanceiros } from "@/types/emprestimo";

export async function buscarEmprestimos(userId: string): Promise<Emprestimo[]> {
  try {
    const emprestimosRef = collection(db, `users/${userId}/emprestimos`);
    const q = query(emprestimosRef);
    const snapshot = await getDocs(q);

    const emprestimos: Emprestimo[] = [];
    snapshot.forEach((doc) => {
      emprestimos.push({
        id: doc.id,
        ...doc.data(),
      } as Emprestimo);
    });

    return emprestimos;
  } catch (error) {
    console.error("Erro ao buscar empréstimos:", error);
    return [];
  }
}

export function calcularDadosFinanceiros(emprestimos: Emprestimo[]): DadosFinanceiros | null {
  if (emprestimos.length === 0) {
    return null;
  }

  // Pega o empréstimo mais recente (ou você pode somar todos)
  const emprestimoAtivo = emprestimos[0];

  const parcelas_restantes = emprestimoAtivo.parcelas_total - emprestimoAtivo.parcelas_pagas;
  const valor_devido = parcelas_restantes * emprestimoAtivo.valor_parcela;
  const percentual_quitado = (emprestimoAtivo.parcelas_pagas / emprestimoAtivo.parcelas_total) * 100;
  const total_juros = emprestimoAtivo.valor_total * (emprestimoAtivo.juros_percentual / 100);

  return {
    valor_devido,
    percentual_quitado: Math.round(percentual_quitado),
    parcelas_restantes,
    total_juros,
    proximo_vencimento: emprestimoAtivo.vencimento,
    status: emprestimoAtivo.status,
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