export interface HistoricoItemFatura {
  valor: number;
  data: string;
  status: "pago" | "pendente";
  quantidade_parcelas?: number;
}

export interface ItemFatura {
  descricao: string;           // Ex: "Spotify", "Netshoes"
  valor_original: number;      // Ex: 500 (SEM juros)
  juros_percentual: number;    // Ex: 5 (%)
  valor_com_juros: number;     // Ex: 525 (COM juros)
  parcelas_total: number;      // Ex: 12
  parcelas_pagas: number;      // Ex: 3
  valor_parcela: number;       // Ex: 43.75 (525 / 12)
  total: number;               // Ex: 525 (mesmo que valor_com_juros)
  historico?: HistoricoItemFatura[]; // Histórico de pagamentos
}

export interface Fatura {
  id: string;
  banco: "nubank" | "inter" | "outro";
  total: number;               // Soma de todos os itens
  status: "aberta" | "paga";
  vencimento: string;          // Ex: "2025-01-20"
  itens: ItemFatura[];
  created_at: string;
}

export interface ResumoFinanceiro {
  total_faturas: number;       // Soma total de todas as parcelas restantes
  total_emprestimos: number;   // Soma de todos os empréstimos
  total_geral: number;         // Faturas + Empréstimos
  fatura_mensal: number;       // Valor a pagar ESTE MÊS (1 parcela de cada item)
  faturas: Fatura[];
}