export interface SolicitacaoAlteracaoAlunoResponse {
  id: number;

  alunoId: number;
  alunoNome: string;

  solicitanteId: number;
  solicitanteNome: string;

  aprovadorId: number | null;
  aprovadorNome: string | null;

  status: string;

  comumId: number | null;
  nivelId: number | null;
  cargoMinisterioId: number | null;

  dataBatismo: string | null;
  dataInicioGem: string | null;

  motivo: string | null;
  observacaoDecisao: string | null;

  criadoEm: string;
  decididoEm: string | null;
}
