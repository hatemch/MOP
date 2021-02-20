import { Component, OnInit } from '@angular/core';
import { Infracao } from 'src/app/models/infracao';
import { Segmento } from 'src/app/models/segmento';
import { Grupo } from 'src/app/models/grupo';
import { User } from 'src/app/models/user';
import { Municipio } from 'src/app/models/municipio';
import { NavController, AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-reenvio-infracoes',
  templateUrl: './reenvio-infracoes.page.html',
  styleUrls: ['./reenvio-infracoes.page.scss'],
})
export class ReenvioInfracoesPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  private CRUD_READ = 'READ';

  public showTable = false;
  public showButtonReenviar = false;
  public showChecks = true;
  public user = new User();
  public disabledata = true;

  public infracao = new Infracao();
  public Infracoes: Array<Infracao> = [];

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];

  // public columns = [
  // {  text: 'Checks', bold: true, width: 200 },
  // { text: 'Status', bold: true, width: 20 },
  // { text: 'AUTO', bold: true },
  // { text: 'Código DETRAN', bold: true },
  // { text: 'Enquadramento', bold: true },
  // { text: 'Descrição', bold: true },
  // { text: 'Data Infração', bold: true }];

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public date: Date = new Date();

  public quantInfracoesSelecionadas = 0;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }


  ngOnInit() {
    this.getPermissoesModulo();
    this.getSegmentos();

  }

  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.
  }

  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    // if (!this.Authorizer.HashKey) {
    //   this.router.navigate(['/menu/options/tabs/main']);
    // } else {
    //   this.getSegmentos();
    //   this.CarregaUFs();
    // }
    this.showTable = false;
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.infracao.Segmento = localStorage.getItem('orgaoUsuario').trim();
      this.CarregaSegmentoGrupos()

    }
  }
  /* -------------------------- LOAD SELECTS ---------------------------- */
  // SEGMENTO
  private getSegmentos() {
    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.segmento;
        segmento.segmento = value.segmento;
        return segmento;
      });

      //FILTER ONLY SEGMENTOS FOR INFRACTION
      this.segmentos = this.segmentos.filter((value) => {
        return value.segmento.trim() == "DETRAN" || value.segmento.trim() == "Policia Militar";
      })

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
        this.infracao.Segmento = 'TODOS';
      }
    });
  }
  // GRUPOS
  CarregaSegmentoGrupos() {
    this.infracao.Grupo = '';
    this.infracao.usuario = '';
    this.grupos = [];
    this.users = [];
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.infracao.Grupo = localStorage.getItem('codigoUnidade');
      this.user.nomegrupo = localStorage.getItem('unidadeUsuario')
    }
    if (!this.infracao.Segmento || this.infracao.Segmento == "TODOS") { return }
    else {
      if (this.infracao.Segmento !== 'TODOS') {
        this.sendRequest('spConsultarGruposSegmento', {
          StatusCRUD: 'READ',
          formValues: { segmento: this.infracao.Segmento }
        }, (resultado) => {

          let results = JSON.parse(atob(resultado.results));

          this.grupos = results.map(function callback(value) {
            let grupo = new Grupo();
            grupo.codigo = value.CODIGO;
            grupo.nome = value.NOME;
            return grupo;
          });
          //logic to fill the grupos array with the unidade of the user SUPERVISOR UNIDADE
          if (this.infracao.Grupo) {
            this.grupos[0].codigo = this.infracao.Grupo
            this.grupos[0].nome = this.user.nomegrupo;
            this.CarregaSegmentoGrupoUsuarios();
            console.log('grupos', this.grupos);
            return;
          }
          //
          if (this.grupos.length === 0) {
            this.users = [];
          } else if (this.grupos.length > 1) {
            let grupo = new Grupo();
            grupo.codigo = 'TODOS';
            grupo.nome = 'TODOS';
            this.grupos.unshift(grupo);
          }
          console.log('grupos', this.grupos);
        });
      } else {
        this.grupos = [];
      }
    }
  }
  // USUARIOS
  CarregaSegmentoGrupoUsuarios() {
    this.infracao.usuario = '';
    this.users = [];
    if (!this.infracao.Grupo || this.infracao.Grupo == "TODOS") { return }
    else {
      this.sendRequest('spConsultarUsuarioGrupo', {
        StatusCRUD: 'READ',
        formValues: { 'grupo': this.infracao.Grupo }
      }, (resultado) => {

        let results = JSON.parse(atob(resultado.results));

        this.users = results.map(function callback(value) {
          let user = new User();
          user.codigo = value.CODIGO;
          user.nome = value.NOME;
          return user;
        });

        if (this.users.length > 1) {
          let userTodos = new User();
          userTodos.codigo = 'TODOS';
          userTodos.nome = 'TODOS';
          this.users.unshift(userTodos);
          console.log('users', this.users);
        }

      });
    }
  }

  dataInicio(event) {
    if (event.detail.value) {
      this.disabledata = false;
    } else {
      this.disabledata = true;
    }
  }
  /* -------------------------- END LOAD SELECTS ---------------------------- */
  /* --------------------- LOAD TABLE --------------------------------------- */
  private consultaInfracoes(_statusCRUD, _formValues) {

    _formValues.Segmento == "TODOS" ? _formValues.Segmento = '' : null;
    _formValues.Grupo == "TODOS" ? _formValues.Grupo = '' : null;
    _formValues.usuario == "TODOS" ? _formValues.usuario = '' : null;

    this.alertService.loaderPresent();
    this.sendRequest('spInfracoesParaReenviar', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {
      this.Infracoes = JSON.parse(atob(resultado.results));
      this.alertService.loaderDismiss();

      if (this.Infracoes.length === 0) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
      } else {
        this.showTable = true;
        this.showButtonReenviar = true;
        this.showChecks = true;
      }
    });
  }

  CarregaInfracoesUsuario(form: NgForm) {
    this.quantInfracoesSelecionadas = 0;
    if (form.value.Segmento === 'TODOS') {
      form.value.Segmento = '';
    }
    if (form.value.DataInicial) {
      if (form.value.DataFinal) {
        this.consultaInfracoes(this.CRUD_READ, form.value);
      } else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Informe a data final!' });
      }
    } else {
      this.consultaInfracoes(this.CRUD_READ, form.value);
    }
  }
  /* --------------------- END LOAD TABLE --------------------------------------- */

  public compareWithFn = (o1, o2) => {
    return o1 === o2;
  };
  compareWith = this.compareWithFn;
  /* ------------------- PERMISIONS USER -------------------------------------- */
  // NEEDED FUNCTIONS
  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    })

    if (permissaoModulo.length === 1) {
      this.permissoes = {
        Route: permissaoModulo[0].Route,
        Pesquisar: permissaoModulo[0].Pesquisar,
        Inserir: permissaoModulo[0].Inserir,
        Editar: permissaoModulo[0].Editar,
        Deletar: permissaoModulo[0].Deletar
      };
    } else {
      console.log('Houve um problema nas permissoes do modulo: ', this.router.url);
    }
  }
  /* ------------------- END PERMISIONS USER -------------------------------------- */
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/96']);
  }
  /* ---------------------------- SENDREQUEST -------------------------------------- */
  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD === 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
        // || (procedure === 'spCargos')
      ) {

        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
          const resultado: any = res[0];
          try {
            if (resultado.success) {
              next(resultado);
              this.alertService.showLoader(resultado.message, 500);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }

  /* ---------------------------- END SENDREQUEST -------------------------------------- */

  async confirmarReenvioInfracoes(form: NgForm) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `Deseja reenviar ${this.quantInfracoesSelecionadas} infrações selecionadas?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          // handler: (blah) => {
          //   console.log('Confirm Cancel: blah');
          // }
        }, {
          text: 'Sim',
          handler: () => {
            console.log(form.value)
            this.alterarStatusInfracoes(form.value);
          }
        }
      ]
    });

    await alert.present();
  }

  public onOffCheckInfracoes(event) {
    const valorOnOff = event.detail.checked;
    this.quantInfracoesSelecionadas = (valorOnOff) ? this.Infracoes.length : 0;
    this.Infracoes.forEach(element => {
      element.reenviar = valorOnOff;
    });
  }

  public contarInfracaoSelecionada(value) {
    if (value) {
      this.quantInfracoesSelecionadas++;
    } else {
      this.quantInfracoesSelecionadas--;
    }
  }

  alterarStatusInfracoes(form: object) {
    let strCodigos = '';
    for (const key in form) {
      if (form[key] === true) {
        strCodigos = strCodigos + key + ',';
      }
    }

    // Excluido a ultima virgula
    const ultimoCharacter = strCodigos.substr(-1);
    if (ultimoCharacter === ',') {
      strCodigos = strCodigos.substring(0, strCodigos.length - 1);
    }

    // Enviando informacao
    this.sendRequest('spInfracoesParaReenviar', {
      StatusCRUD: 'UPDATE',
      formValues: { strCodigosInfracoes: strCodigos }
    }, (resultado) => {
      this.Infracoes = JSON.parse(atob(resultado.results));
      this.showButtonReenviar = false;
      this.showChecks = false;
    });

  }


  public showDescricao(texto, event) {
    event.target.textContent = texto;
  }

  public hiddeDescricao(texto, event) {
    event.target.textContent = texto;
  }

}
