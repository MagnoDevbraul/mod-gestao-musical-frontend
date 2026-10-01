export interface UsuarioResponse {
  id: number;

  nome: string;
  email: string;

  perfilUsuarioId: number;
  perfilUsuarioNome: string;

  ativo: boolean;

  comumId: number | null;
  comumNome: string | null;
}
