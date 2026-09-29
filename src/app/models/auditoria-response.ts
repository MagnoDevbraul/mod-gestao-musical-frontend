export interface AuditoriaResponse {
  id: number;

  usuarioId: number | null;
  usuarioNome: string | null;

  acao: string;
  tabelaAfetada: string;
  registroId: number | null;
  descricao: string;

  dadosAnteriores: Record<string, unknown> | null;
  dadosNovos: Record<string, unknown> | null;

  criadoEm: string;
}
