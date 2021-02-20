import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { environment } from "../../../../environments/environment.prod";
import { AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

//MODELS
import { Segmento } from '../../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';
import { Alerta } from 'src/app/models/alerta';

@Component({
  selector: 'app-add-alerta',
  templateUrl: './add-alerta.page.html',
  styleUrls: ['./add-alerta.page.scss'],
})
export class AddAlertaPage implements OnInit {
  static CRUD_CREATE: string = 'CREATE';
  static APP_NAME: string = EnvService.name;

  public permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1 ,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];
  public today : any;
  public alerta = new Alerta();
  

  public user = new User();

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getSegmentos();
  }
  goBack() {
    this.navCtrl.back();
  }

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

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
      }

      console.log('segmentos', this.segmentos);

    });
  }

  CarregaSegmentoGrupos()
  {
    console.log(this.user.segmento);
    this.consultarGruposSegmento(this.user.segmento);
  }

  // private consultarGruposSegmento(segmento: string) {
  //   this.sendRequest('spConsultarGruposSegmento', {
  //     StatusCRUD: 'READ',
  //     formValues: {'segmento': segmento}
  //   }, (resultado) => {

  //     let results = JSON.parse(atob(resultado.results));

  //     console.log('grupos',results);

  //     this.grupos = results.map(function callback(value) {
  //       let grupo = new Grupo();
  //       grupo.codigo = value.CODIGO;
  //       grupo.nome = value.NOME;

  //       return grupo;
  //     });
  //   });
  // }

  private consultarGruposSegmento(segmento: string) {
    this.alerta.grupo = '';
    this.alerta.usuario= '';
    this.grupos = [];
    this.users = [];
    if (!this.alerta.segmento) {
      this.grupos = [];
      this.users = [];
      return;
    }
    else {
      this.sendRequest('spConsultarGruposSegmento', {
        StatusCRUD: 'READ',
        formValues: { 'segmento': this.alerta.segmento }
      }, (resultado) => {

        let results = JSON.parse(atob(resultado.results));

        console.log('grupos', results);

        this.grupos = results.map(function callback(value) {
          let grupo = new Grupo();
          grupo.codigo = value.CODIGO;
          grupo.nome = value.NOME;

          return grupo;
        });

        if (this.grupos.length == 0) {
          this.grupos = [];
        } else if (this.grupos.length > 1) {
          let grupo = new Grupo();
          grupo.codigo = 'TODOS';
          grupo.nome = 'TODOS';
          this.grupos.unshift(grupo);
        }


      });
    }
  }


  CarregaSegmentoGrupoUsuarios()
  {
    this.consultarUsuarioGrupo(this.alerta.grupo == 'TODOS' ? '' :this.alerta.grupo);
  }

  private consultarUsuarioGrupo(grupo: string) {
    this.alerta.usuario= '';
    this.users = []
    if (!this.alerta.grupo) {
      this.users = [];
      return;
    }
    else {
      this.sendRequest('spConsultarUsuarioGrupo', {
        StatusCRUD: 'READ',
        formValues: { 'grupo': grupo }
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
        }

        console.log('users', this.users);
      });
    }
  }




  save(form: NgForm) {
    // if(form.value.Segmento=='TODOS')form.value.Segmento='';
    if(form.value.Grupo=='TODOS')form.value.Grupo='';
    if(form.value.User=='TODOS')form.value.User='';
      this.CRUDAlerta(AddAlertaPage.CRUD_CREATE, form.value);  

  }

  private CRUDAlerta(_statusCRUD, _formValues) {
    this.sendRequest('spConsultaAlerta', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues 
     
    }, (resultado) => {

      switch (_statusCRUD) {
        case AddAlertaPage.CRUD_CREATE:
          this.router.navigate(['/menu/alertas']);
          break;
       

        default:
          break;
      }


    });
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
  
  
    /**
     * Autor: Lina Jimenez 
     * Data: 04/12/2019
     * @param procedure Nome da procedura armazanada no banco de dados
     * @param params JSON do parametros precisados pelo procedure
     * @param next Callback executado depois de executar a request
     */
    private sendRequest(
      procedure: string,
      params: { StatusCRUD: string; formValues: any; },
      next: any) {
  
      if (typeof this.Authorizer.HashKey !== 'undefined') {
        if (
          ((params.StatusCRUD === 'CREATE') && (this.permissoes.Inserir > 0))
          || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
          || (procedure === 'spConsultaAlerta')
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
                this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddAlertaPage.APP_NAME, pMessage: resultado.message });
              }
            } catch (err) {
              this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: AddAlertaPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
            }
          });
        } else {
          this.alertService.presentAlert({
            pTitle: 'SEM PERMISSÃO', pSubtitle: AddAlertaPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
          });
        }
      } else {
        this.goBack()
      }
    }

}


