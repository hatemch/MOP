import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';
import { Segmento } from 'src/app/models/segmento';
import { Grupo } from 'src/app/models/grupo';
import { NavController, Events, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Comando } from 'src/app/models/comando';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-add-grupo',
  templateUrl: './add-grupo.page.html',
  styleUrls: ['./add-grupo.page.scss'],
})
export class AddGrupoPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static APP_NAME: string = EnvService.name;

  public title = "";
  public grupo = new Grupo();

  public segmentos: Array<Segmento> = [];
  public comandos: Array<Comando> = [];

  // public collectionNivel = [
  //     { value: 1, nome: 'Nível 1'}
  //   , { value: 2, nome: 'Nível 2'}
  //   , { value: 3, nome: 'Nível 3'}
  // ];  alertController: any;

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {

    // Getting data from another page
    this.getSegmentos();
    this.getComandos();

    await new Promise(resolve => setTimeout(resolve, 500)); // 3 sec

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.grupo.codigo = data.codigo;

        if (this.grupo.codigo) {
          this.title = 'Editar';
          this.CRUDGrupos(AddGrupoPage.CRUD_READ, { 'codigo': this.grupo.codigo });
        }
        else {
          this.title = 'Nova';
        }

      });

  }

  save(form: NgForm) {
    if (this.grupo.codigo) {
      //ADD CODIGO TO UPDATE 
      form.value.codigo = this.grupo.codigo;
      this.CRUDGrupos(AddGrupoPage.CRUD_UPDATE, form.value);
    }
    else {
      this.CRUDGrupos(AddGrupoPage.CRUD_CREATE, form.value);
    }
  }

  private CRUDGrupos(_statusCRUD, _formValues) {
    this.sendRequest('spGrupos', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case AddGrupoPage.CRUD_CREATE:
          this.router.navigate(['/menu/grupos']);
          break;
        case AddGrupoPage.CRUD_READ:
          this.grupo.nome = JSON.parse(atob(resultado.results))[0].nome;
          this.grupo.grupo = JSON.parse(atob(resultado.results))[0].grupo;
          this.grupo.segmento = (JSON.parse(atob(resultado.results))[0].segmento).trim();

         // this.grupo.nivel = JSON.parse(atob(resultado.results))[0].nivel;
         if (JSON.parse(atob(resultado.results))[0].nivel) {
          this.grupo.nivel = String(JSON.parse(atob(resultado.results))[0].nivel).trim();
        }
        
          //this.grupo.comandoGrupo = JSON.parse(atob(resultado.results))[0].comando;
          if (JSON.parse(atob(resultado.results))[0].comandoGrupo) {
            this.grupo.comandoGrupo = String(JSON.parse(atob(resultado.results))[0].comandoGrupo).trim();
          }

          this.grupo.email = JSON.parse(atob(resultado.results))[0].email;
          console.log('grupo',this.grupo);
          break;
        case AddGrupoPage.CRUD_UPDATE:
          this.router.navigate(['/menu/grupos']);
          break;

        default:
          break;
      }
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
        segmento.codigo = value.codigo;
        segmento.segmento = value.segmento.trim();

        return segmento;
      });
    });
  }

  private getComandos() {
    this.sendRequest('spTBL_comandoPM', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.comandos = results.map(function callback(value) {
        let comando = new Comando();
        comando.ID_COMANDO = String(value.ID_COMANDO);
        comando.COMANDO = value.COMANDO;

        return comando;
      });
    });
  }

  goBack() {
    this.router.navigate(['/menu/grupos']);
  }
  NewGrupo() {
    this.router.navigate(['add-alerta']);
  }

   //NEEDED FUNCTION
  /**
  * Autor: Hatem CHAOUCH 
  * Data: 16/03/2020
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
      ((params.StatusCRUD == 'CREATE') && (this.permissoes.Inserir > 0))
      || ((params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
      || ((params.StatusCRUD == 'UPDATE') && (this.permissoes.Editar > 0))
      || ((params.StatusCRUD == 'DELETE') && (this.permissoes.Deletar > 0))
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
            this.alertService.showLoader(resultado.message, 1000);
          } else {
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddGrupoPage.APP_NAME, pMessage: resultado.message });
          }
        } catch (err) {
          this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: AddGrupoPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
        }
      });
    } else {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: AddGrupoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
      });
    }
  } else {
    this.goBack()
  }
}

  }


