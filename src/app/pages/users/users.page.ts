import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { environment } from "../../../environments/environment.prod";
import { AlertController } from '@ionic/angular';
import { IonicSelectableComponent } from 'ionic-selectable';
//MODELS
import { Segmento } from '../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';
import { Perfil } from 'src/app/models/perfil';
import { NgForm } from '@angular/forms';
import { Cargo } from 'src/app/models/cargo';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';
  private APP_NAME: string = this.env.AppName;

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];
  public usuarios: Array<User> = [];
  public perfil = new Perfil();
  public perfis: Array<Perfil> = [];
  public cargo = new Cargo();
  public cargos: Array<Cargo> = [];

  public user = new User();
  public usuario = new User();

  constructor(
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    
  
    
   
    this.getPermissoesModulo();
    this.getSegmentos();
    this.getPerfis();
   
  }
  ionViewDidEnter() {
if(this.user.perfil=='SUPERVISOR DE UNIDADE'){
  this.user.SEGMENTO=localStorage.getItem('orgaoUsuario').trim();
  this.user.PERFIL = this.perfis[0].slug;
  this.CarregaSegmentoGrupos()
  
  }
    this.CRUDuser(UsersPage.CRUD_READ, '', '');
   

  }

  private getPerfis() {
    this.sendRequest('spPerfis', {
      StatusCRUD: 'READ',
      formValues: this.perfil

    }, (resultado) => {

      this.perfis = JSON.parse(atob(resultado.results));

      if (this.perfis.length > 1) {
        let perfiTemp = new Perfil();
        perfiTemp.slug = 'TODOS';
        perfiTemp.nome = 'TODOS';
        this.perfis.unshift(perfiTemp);
      }
      console.log('this.perfil', this.perfis);
    });
  }



  private getSegmentos() {
    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.segmento.trim();
        segmento.segmento = value.segmento.trim();

        return segmento;
      });

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
      }

      console.log('segmentos', this.segmentos);

    });
  }


  CarregaSegmentoGrupos() {
    
    console.log(this.user.SEGMENTO);
    this.consultarGruposSegmento(this.user.SEGMENTO);
  }

  private consultarGruposSegmento(segmento: string) {
    if(this.user.perfil=='SUPERVISOR DE UNIDADE'){
      this.user.GRUPO=localStorage.getItem('codigoUnidade');
      this.user.nomegrupo=localStorage.getItem('unidadeUsuario')
    }
    
   
    if (!segmento) {
      this.grupos = [];
      return;
    } else {

      this.sendRequest('spConsultarGruposSegmento', {
        StatusCRUD: 'READ',
        formValues: { 'segmento': segmento }
      }, (resultado) => {

        let results = JSON.parse(atob(resultado.results));

        console.log('grupos', results);

        this.grupos = results.map(function callback(value) {
          let grupo = new Grupo();
          grupo.codigo = value.CODIGO;
          grupo.nome = value.NOME;

          return grupo;
        });
        //logic to fill the grupos array with the unidade of the user SUPERVISOR UNIDADE
        if(this.user.GRUPO){
          this.grupos[0].codigo=this.user.GRUPO
          this.grupos[0].nome=this.user.nomegrupo;
          console.log('grupos',this.grupos);
          return;
        }
        //
        if (this.grupos.length > 1) {
          let grupo = new Grupo();
          grupo.codigo = 'TODOS';
          grupo.nome = 'TODOS';
          this.grupos.unshift(grupo);
        }
      });
    }
  }


  CarregaSegmentoGrupoUsuarios() {
    this.consultarUsuarioGrupo(this.user.GRUPO == 'TODOS' ? '' : this.user.GRUPO);
  }

  private consultarUsuarioGrupo(grupo: string) {
    this.sendRequest('spConsultarUsuarioGrupo', {
      StatusCRUD: 'READ',
      formValues: { 'grupo': grupo }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));


      this.users = results.map(function callback(value) {
        let user = new User();
        user.CODIGO = value.CODIGO;
        user.NOME = value.NOME;

        return user;
      });

      console.log('users', this.users);
      if (this.users.length > 1) {
        let userTodos = new User();
        userTodos.CODIGO = 'TODOS';
        userTodos.NOME = 'TODOS';
        this.users.unshift(userTodos);
      }

    });
  }


  CarregaSegmentoGrupoUsuariosPerfis() {
    this.consultarUsuarioGrupoPerfis(this.user.GRUPO == 'TODOS' ? '' : this.user.GRUPO);
  }

  private consultarUsuarioGrupoPerfis(grupo: string) {
    if (!grupo) return;
    if (grupo == "TODOS") grupo = "";
    this.sendRequest('spConsultarUsuarioGrupoPerfil', {
      StatusCRUD: 'READ',
      formValues: {
        'grupo': grupo,

      }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));


      this.usuarios = results.map(function callback(value) {
        let usuario = new User();
        usuario.CODIGO = value.CODIGO;
        usuario.NOME = value.NOME;

        return usuario;
      });

      console.log('users', this.users);

    });
  }

  // goBack() {
  //   this.navCtrl.back();
  // }
  NewUser() {
    this.router.navigate(['/menu/cadastro-user']);
  }

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

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/98']);
  }

  pesquisar(form: NgForm, exportExcel) {
    if (form.value.userPerfil == 'TODOS') form.value.userPerfil = '';
    if (form.value.userSegmento == 'TODOS') form.value.userSegmento = '';
    if (form.value.userGrupo == 'TODOS') form.value.userGrupo = '';
    /*    if ( this.CRUDuser=null) {
         console.log('form: ', form.value);
         this.alertService.presentToast('There is no matching data');
         return;
       }else */
    if (exportExcel) { this.CRUDuser('READ_EXCEL', form.value, exportExcel); }
    this.CRUDuser(UsersPage.CRUD_READ, form.value, exportExcel);
  }

  private CRUDuser(_statusCRUD, _formValues, exportExcel) {
    this.sendRequest('spUsuarios', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case UsersPage.CRUD_CREATE:
          this.router.navigate(['/menu/users']);
          break;
        case UsersPage.CRUD_READ:
          if (JSON.parse(atob(resultado.results))[0].NOME = null) {
            this.alertService.presentToast('Sem dados a mostrar');
            this.users = [];
            return;
          } else {
            this.users = JSON.parse(atob(resultado.results));
            console.log('users ', this.users);
          }
          break;
        case 'READ_EXCEL':
          if (JSON.parse(atob(resultado.results))[0].NOME = null) {
            this.alertService.presentToast('Sem dados para exportação');
            return;
          } else { this.Authorizer.convertToExcel(JSON.parse(atob(resultado.results)), "usuarios"); }
          break;
        case UsersPage.CRUD_UPDATE:
          this.router.navigate(['/menu/users']);
          break;
        case UsersPage.CRUD_DELETE:
          //this.pesquisar(_formValues, '');
          this.CRUDuser(UsersPage.CRUD_READ, '', '');
          break;
        default:
          break;
      }
    });
  }

  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD == 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD == 'READ_EXCEL') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD == 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD == 'DELETE') && (this.permissoes.Deletar > 0))
        // || (procedure === 'spUsuarios')
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
            this.users = [];
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
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
  async delete(id: string, value: string, form: NgForm) {

    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você deseja apagar <strong>' + value + '?</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          // handler: (blah) => {
          //   console.log('Confirm Cancel: blah');
          // }
        }, {
          text: 'SIM',
          handler: () => {
            this.CRUDuser(UsersPage.CRUD_DELETE, { 'codigo': id }, '');

          }
        }
      ]
    });

    await alert.present();
  }
  editarUsuario(codigoUsuario) {
    sessionStorage.dataFiltrosPesquisa = JSON.stringify({ 'dataFiltrosPesquisa': this.user });
    this.router.navigate(['/menu/cadastro-user', codigoUsuario]);

  }
  LimpiarFiltros() {
    this.user = new User();
  }
}