import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  UsuarioResponse
} from '../../models/usuario-response';

import {
  PerfilUsuarioResponse
} from '../../models/perfil-usuario-response';

import {
  PermissaoResponse
} from '../../models/permissao-response';

import {
  UsuarioService
} from '../../services/usuario.service';

import {
  PerfilUsuarioService
} from '../../services/perfil-usuario.service';

import {
  PermissaoService
} from '../../services/permissao.service';


@Component({
  selector: 'app-usuarios-permissoes',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl:
    './usuarios-permissoes.component.html',

  styleUrl:
    './usuarios-permissoes.component.css'
})
export class UsuariosPermissoesComponent
  implements OnInit {

  private readonly PERFIL_SECRETARIA =
    'SECRETARIA';

  private readonly PERMISSAO_RESTRITA =
    'ALTERACAO_RESTRITA_APROVAR';


  usuarios: UsuarioResponse[] = [];

  perfis: PerfilUsuarioResponse[] = [];

  permissoes: PermissaoResponse[] = [];


  perfilSelecionadoId:
    number | null = null;


  permissoesSelecionadas =
    new Set<number>();


  termoBusca = '';

  carregando = false;

  erro = '';

  mensagem = '';


  constructor(
    private readonly usuarioService:
    UsuarioService,

    private readonly perfilService:
    PerfilUsuarioService,

    private readonly permissaoService:
    PermissaoService,

    private readonly cdr:
    ChangeDetectorRef
  ) {
  }


  ngOnInit(): void {

    this.carregarDados();
  }


  carregarDados(): void {

    this.carregando = true;

    this.erro = '';

    this.mensagem = '';


    forkJoin({

      usuarios:
        this.usuarioService.listarTodos(),

      perfis:
        this.perfilService.listarTodos(),

      permissoes:
        this.permissaoService.listarTodas()

    })
      .subscribe({

        next: (dados) => {

          this.usuarios =
            dados.usuarios;

          this.perfis =
            dados.perfis;

          this.permissoes =
            dados.permissoes;


          if (
            this.perfis.length > 0
          ) {

            this.perfilSelecionadoId =
              this.perfis[0].id;

            this.carregarPermissoesPerfil();
          }


          this.carregando = false;

          this.cdr.detectChanges();
        },


        error: (erro) => {

          console.error(
            'Erro ao carregar usuários e permissões:',
            erro
          );


          this.erro =
            'Não foi possível carregar usuários e permissões.';


          this.carregando = false;

          this.cdr.detectChanges();
        }

      });
  }


  get usuariosFiltrados():
    UsuarioResponse[] {

    const termo =
      this.termoBusca
        .trim()
        .toLowerCase();


    if (!termo) {

      return this.usuarios;
    }


    return this.usuarios.filter(
      usuario => {

        const campos = [
          usuario.nome,
          usuario.email,
          usuario.perfilUsuarioNome,
          usuario.comumNome
        ];


        return campos.some(
          campo =>
            String(
              campo ?? ''
            )
              .toLowerCase()
              .includes(
                termo
              )
        );
      }
    );
  }


  alterarAtivo(
    usuario: UsuarioResponse
  ): void {

    const novoValor =
      !usuario.ativo;


    const acao =
      novoValor
        ? 'ativar'
        : 'desativar';


    if (
      !confirm(
        `Deseja ${acao} o usuário ${usuario.nome}?`
      )
    ) {

      return;
    }


    this.erro = '';

    this.mensagem = '';


    this.usuarioService
      .alterarAtivo(
        usuario.id,
        novoValor
      )
      .subscribe({

        next: (atualizado) => {

          this.atualizarUsuarioLista(
            atualizado
          );


          this.mensagem =
            'Situação do usuário atualizada com sucesso.';


          this.cdr.detectChanges();
        },


        error: (erro) => {

          console.error(
            'Erro ao alterar usuário:',
            erro
          );


          this.erro =
            'Não foi possível alterar a situação do usuário.';


          this.cdr.detectChanges();
        }

      });
  }


  alterarPerfil(
    usuario: UsuarioResponse,
    perfilId: number
  ): void {

    if (
      perfilId ===
      usuario.perfilUsuarioId
    ) {

      return;
    }


    const perfil =
      this.perfis.find(
        item =>
          item.id === perfilId
      );


    if (!perfil) {

      return;
    }


    if (
      !confirm(
        `Alterar o perfil de ${usuario.nome} para ${perfil.nome}?`
      )
    ) {

      return;
    }


    this.erro = '';

    this.mensagem = '';


    this.usuarioService
      .alterarPerfil(
        usuario.id,
        perfilId
      )
      .subscribe({

        next: (atualizado) => {

          this.atualizarUsuarioLista(
            atualizado
          );


          this.mensagem =
            'Perfil do usuário atualizado com sucesso.';


          this.cdr.detectChanges();
        },


        error: (erro) => {

          console.error(
            'Erro ao alterar perfil:',
            erro
          );


          this.erro =
            'Não foi possível alterar o perfil do usuário.';


          this.cdr.detectChanges();
        }

      });
  }


  carregarPermissoesPerfil(): void {

    if (
      this.perfilSelecionadoId === null
    ) {

      return;
    }


    this.erro = '';

    this.mensagem = '';


    this.permissaoService
      .listarPorPerfil(
        this.perfilSelecionadoId
      )
      .subscribe({

        next: (dados) => {

          this.permissoesSelecionadas =
            new Set(
              dados.map(
                permissao =>
                  permissao.id
              )
            );


          this.aplicarRegraPermissaoRestrita();


          this.cdr.detectChanges();
        },


        error: (erro) => {

          console.error(
            'Erro ao carregar permissões:',
            erro
          );


          this.erro =
            'Não foi possível carregar as permissões do perfil.';


          this.cdr.detectChanges();
        }

      });
  }


  permissaoMarcada(
    id: number
  ): boolean {

    return this.permissoesSelecionadas
      .has(id);
  }


  permissaoBloqueada(
    permissao: PermissaoResponse
  ): boolean {

    return this.ehPermissaoRestrita(
      permissao
    );
  }


  alternarPermissao(
    permissao: PermissaoResponse,
    marcada: boolean
  ): void {

    /*
     * A permissão ALTERACAO_RESTRITA_APROVAR
     * não pode ser modificada manualmente
     * pela interface.
     */
    if (
      this.ehPermissaoRestrita(
        permissao
      )
    ) {

      this.aplicarRegraPermissaoRestrita();

      this.cdr.detectChanges();

      return;
    }


    if (marcada) {

      this.permissoesSelecionadas
        .add(
          permissao.id
        );

    } else {

      this.permissoesSelecionadas
        .delete(
          permissao.id
        );
    }
  }


  perfilSelecionadoEhSecretaria():
    boolean {

    const perfil =
      this.obterPerfilSelecionado();


    if (!perfil) {

      return false;
    }


    return this.normalizar(
        perfil.nome
      ) ===
      this.PERFIL_SECRETARIA;
  }


  salvarPermissoes(): void {

    if (
      this.perfilSelecionadoId === null
    ) {

      return;
    }


    const perfil =
      this.obterPerfilSelecionado();


    if (!perfil) {

      return;
    }


    /*
     * Antes de enviar para o backend,
     * reaplica a regra fixa:
     *
     * SECRETARIA -> deve possuir.
     * Demais perfis -> não podem possuir.
     */
    this.aplicarRegraPermissaoRestrita();


    if (
      !confirm(
        `Salvar as permissões do perfil ${perfil.nome}?`
      )
    ) {

      return;
    }


    this.erro = '';

    this.mensagem = '';


    const ids =
      Array.from(
        this.permissoesSelecionadas
      );


    this.permissaoService
      .atualizarPerfil(
        perfil.id,
        ids
      )
      .subscribe({

        next: (dados) => {

          /*
           * Substitui o estado local pelo
           * estado realmente devolvido
           * pelo backend.
           */
          this.permissoesSelecionadas =
            new Set(
              dados.map(
                permissao =>
                  permissao.id
              )
            );


          this.aplicarRegraPermissaoRestrita();


          this.mensagem =
            'Permissões atualizadas com sucesso.';


          this.cdr.detectChanges();
        },


        error: (erro) => {

          console.error(
            'Erro ao salvar permissões:',
            erro
          );


          if (
            erro?.status === 409
          ) {

            this.erro =
              'ALTERACAO_RESTRITA_APROVAR é exclusiva do perfil SECRETARIA.';

          } else {

            this.erro =
              'Não foi possível atualizar as permissões.';
          }


          /*
           * Em caso de erro,
           * consulta novamente o backend
           * para não manter estado visual falso.
           */
          this.carregarPermissoesPerfil();


          this.cdr.detectChanges();
        }

      });
  }


  private aplicarRegraPermissaoRestrita():
    void {

    const permissaoRestrita =
      this.permissoes.find(
        permissao =>
          this.ehPermissaoRestrita(
            permissao
          )
      );


    if (!permissaoRestrita) {

      return;
    }


    if (
      this.perfilSelecionadoEhSecretaria()
    ) {

      /*
       * SECRETARIA:
       * sempre marcada.
       */
      this.permissoesSelecionadas
        .add(
          permissaoRestrita.id
        );

    } else {

      /*
       * Qualquer outro perfil:
       * sempre desmarcada.
       */
      this.permissoesSelecionadas
        .delete(
          permissaoRestrita.id
        );
    }
  }


  private ehPermissaoRestrita(
    permissao: PermissaoResponse
  ): boolean {

    return this.normalizar(
        permissao.nome
      ) ===
      this.PERMISSAO_RESTRITA;
  }


  private obterPerfilSelecionado():
    PerfilUsuarioResponse | null {

    if (
      this.perfilSelecionadoId === null
    ) {

      return null;
    }


    return this.perfis.find(
      perfil =>
        perfil.id ===
        this.perfilSelecionadoId
    ) ?? null;
  }


  private normalizar(
    valor: string | null | undefined
  ): string {

    return String(
      valor ?? ''
    )
      .trim()
      .toUpperCase();
  }


  private atualizarUsuarioLista(
    atualizado: UsuarioResponse
  ): void {

    const indice =
      this.usuarios.findIndex(
        usuario =>
          usuario.id === atualizado.id
      );


    if (
      indice < 0
    ) {

      return;
    }


    this.usuarios[indice] =
      atualizado;


    this.usuarios = [
      ...this.usuarios
    ];
  }

}
