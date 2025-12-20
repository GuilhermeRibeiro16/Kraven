export interface HistoricoItem {
  valor: number;
  data: string;
  status: "pago" | "pendente";
}

export interface Emprestimo {
  id: string;
  valor_total: number;
  parcelas_total: number;
  parcelas_pagas: number;
  valor_parcela: number;
  juros_percentual: number;
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