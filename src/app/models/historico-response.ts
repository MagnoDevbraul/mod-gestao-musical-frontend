export interface HistoricoResponse {

  id: number;

  alunoId: number | null;
  alunoNome: string | null;

  usuarioId: number | null;
  usuarioNome: string | null;

  tipoEvento: string;

  dataHora: string;

  descricao: string | null;

  valorAnterior: string | null;
  valorNovo: string | null;
}
