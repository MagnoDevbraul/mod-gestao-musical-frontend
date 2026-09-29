export interface NotificacaoResponse {
  id: number;

  usuarioId: number | null;
  usuarioNome: string | null;

  alunoId: number | null;
  alunoNome: string | null;

  tipoEvento: string;
  titulo: string;
  mensagem: string;

  dataHora: string;

  lida: boolean;
  dataLeitura: string | null;
}
