export interface DashboardAlunosPorComum {
  comum: string;
  quantidade: number;
}

export interface DashboardAtividade {
  id: number;
  tipoEvento: string;
  descricao: string;
  dataHora: string;
}

export interface DashboardNotificacao {
  id: number;
  tipoEvento: string;
  titulo: string;
  mensagem: string;
  dataHora: string;
  lida: boolean;
}

export interface DashboardAlteracaoPendente {
  id: number;
  aluno: string;
  campo: string;
  solicitante: string;
  status: string;
  criadoEm: string;
}

export interface DashboardResponse {
  totalAlunos: number;
  alunosAtivos: number;
  alunosArquivados: number;
  alteracoesPendentes: number;
  notificacoes: number;

  alunosPorComum: DashboardAlunosPorComum[];

  atividadesRecentes: DashboardAtividade[];

  notificacoesRecentes: DashboardNotificacao[];

  alteracoesRestritasPendentes: DashboardAlteracaoPendente[];
}
