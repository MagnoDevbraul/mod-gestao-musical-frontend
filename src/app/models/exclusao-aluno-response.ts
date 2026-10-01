export interface ExclusaoAlunoResponse {
  id: number;

  alunoId: number;
  alunoNome: string;

  usuarioId: number | null;
  usuarioNome: string | null;

  motivo: string;
  dataHora: string;
}

export interface ExclusaoAlunoRequest {
  alunoId: number;
  motivo: string;
}
