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

          this.usuarios = dados.usuarios;
          this.perfis = dados.perfis;
          this.permissoes = dados.permissoes;

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
            String(campo ?? '')
              .toLowerCase()
              .includes(termo)
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

  alternarPermissao(
    id: number,
    marcada: boolean
  ): void {

    if (marcada) {

      this.permissoesSelecionadas
        .add(id);

    } else {

      this.permissoesSelecionadas
        .delete(id);
    }
  }

  salvarPermissoes(): void {

    if (
      this.perfilSelecionadoId === null
    ) {
      return;
    }

    const perfil =
      this.perfis.find(
        item =>
          item.id ===
          this.perfilSelecionadoId
      );

    if (!perfil) {
      return;
    }

    if (
      !confirm(
        `Salvar as permissões do perfil ${perfil.nome}?`
      )
    ) {
      return;
    }

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

          this.permissoesSelecionadas =
            new Set(
              dados.map(
                item =>
                  item.id
              )
            );

          this.mensagem =
            'Permissões atualizadas com sucesso.';

          this.cdr.detectChanges();
        },

        error: (erro) => {

          console.error(
            'Erro ao salvar permissões:',
            erro
          );

          this.erro =
            'Não foi possível atualizar as permissões.';

          this.cdr.detectChanges();
        }
      });
  }

  private atualizarUsuarioLista(
    atualizado: UsuarioResponse
  ): void {

    const indice =
      this.usuarios.findIndex(
        usuario =>
          usuario.id === atualizado.id
      );

    if (indice < 0) {
      return;
    }

    this.usuarios[indice] =
      atualizado;

    this.usuarios = [
      ...this.usuarios
    ];
  }
}
