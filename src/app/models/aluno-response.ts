export interface AlunoResponse {

  id: number;
  nome: string;

  comumId: number | null;
  comumNome: string | null;

  nivelId: number | null;
  nivelNome: string | null;

  cargoMinisterioId: number | null;
  cargoMinisterioNome: string | null;

  possuiInstrumento: boolean;

  dataBatismo: string | null;
  dataInicioGem: string | null;

  situacao: string;

  criadoEm: string;
  atualizadoEm: string;
}
