export interface HistoricoItem {
  valor: number;
  data: string;
  status: "pago" | "pendente";
  quantidade_parcelas?: number;
}

export interface Emprestimo {
  id: string;
  valor_original: number;      // Valor SEM juros
  juros_percentual: number;    // % de juros
  valor_total: number;         // Valor COM juros
  parcelas_total: number;
  parcelas_pagas: number;
  valor_parcela: number;
  vencimento: string;
  status: "em_dia" | "atrasado" | "quitado";
  created_at: string;
  historico: HistoricoItem[];
}

export interface DadosFinanceiros {
  valor_devido: number;
  percentual_quitado: number;
  parcelas_restantes: number;
  total_juros: number;
  proximo_vencimento: string;
  status: "em_dia" | "atrasado" | "quitado";
}