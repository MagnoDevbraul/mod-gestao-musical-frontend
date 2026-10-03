export interface AlunoCompartilhamentoResponse {

  id: number;

  alunoId: number;
  alunoNome: string;

  comumOrigemId:
    number | null;

  comumOrigemNome:
    string | null;

  comumDestinoId: number;
  comumDestinoNome: string;

  compartilhadoPorUsuarioId:
    number | null;

  compartilhadoPorUsuarioNome:
    string | null;

  criadoEm: string;

  atualizadoEm:
    string | null;
}


export interface AlunoCompartilhamentoRequest {

  alunoId: number;

  comumDestinoId: number;
}
