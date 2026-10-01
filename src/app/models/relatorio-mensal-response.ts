export interface RelatorioMensalResponse {
  id: number;

  periodoInicio: string;
  periodoFim: string;

  totalAlunosAtivos: number;
  totalAlunosArquivados: number;

  totalMts: number;
  totalMsa: number;
  totalMetodo: number;
  totalHinario: number;
  totalEscala: number;

  totalAlunosSemMovimentacao60Dias: number;

  totalCompartilhamentos: number;
  totalExclusoesArquivamentos: number;
  totalRestauracoes: number;

  totalNotificacoes: number;
  totalEventosAuditoria: number;

  geradoEm: string;
}
