export interface ItemFatura {
  descricao: string;           // Ex: "Spotify", "Netshoes"
  parcelas_total: number;      // Ex: 12
  parcelas_pagas: number;      // Ex: 3
  valor_parcela: number;       // Ex: 12.90
  total: number;               // Ex: 154.80 (12 x 12.90)
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
  total_faturas: number;       // Soma de todas as faturas
  total_emprestimos: number;   // Soma de todos os empréstimos
  total_geral: number;         // Faturas + Empréstimos
  faturas: Fatura[];
}