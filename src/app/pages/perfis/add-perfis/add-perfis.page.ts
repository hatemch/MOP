import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Perfis } from "../../../models/perfis";
import { Segmento } from "../../../models/segmento";

@Component({
  selector: 'app-add-perfis',
  templateUrl: './add-perfis.page.html',
  styleUrls: ['./add-perfis.page.scss'],
})
export class AddPerfisPage implements OnInit {
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static APP_NAME: string = EnvService.name;

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado
  
  public title = "";
  public perfi = new Perfis();
  public segmentos: Array<Segmento> = [];
  public segmentoTemp = '';

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

    await new Promise(resolve => setTimeout(resolve, 100)); // 1 sec

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.perfi.codigo = data.codigo;

        if (this.perfi.codigo) {
          this.title = 'Editar';
          this.CRUDPerfis(AddPerfisPage.CRUD_READ, { 'codigo': this.perfi.codigo });
        }
        else {
          this.title = 'Novo';
        }

      });

  }

  save(form: NgForm) {
    if (this.perfi.codigo) {
      //ADD CODIGO TO UPDATE 
      form.value.codigo = this.perfi.codigo;
      this.CRUDPerfis(AddPerfisPage.CRUD_UPDATE, form.value);
    }
    else {
      this.CRUDPerfis(AddPerfisPage.CRUD_CREATE, form.value);
    }
  }

  //--------------------------------------------------------------------------------------

  private CRUDPerfis(_statusCRUD, _formValues) {
    this.sendRequest('spPerfis', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case AddPerfisPage.CRUD_CREATE:
          this.router.navigate(['/menu/perfis']);
          break;
        case AddPerfisPage.CRUD_READ:
          this.perfi.nome = JSON.parse(atob(resultado.results))[0].nome;
          this.perfi.slug = JSON.parse(atob(resultado.results))[0].slug;
          this.perfi.segmento = (JSON.parse(atob(resultado.results))[0].segmento).trim();
          // this.segmentoTemp = JSON.parse(atob(resultado.results))[0].segmento;
          break;
        case AddPerfisPage.CRUD_UPDATE:
          this.router.navigate(['/menu/perfis']);
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
        segmento.codigo = value.segmento.trim();
        segmento.segmento = value.segmento.trim();

        return segmento;
      });

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': '(Todos)', 'segmento': '(Todos)' });
      }

      // this.perfi.segmento = this.segmentoTemp.trim();

    });
  }

  goBack() {
    this.router.navigate(['/menu/perfis']);
  }

  //NEEDED FUNCTION
  /**
  * Autor: Hatem CHAOUCH 
  * Data: 25/02/2020
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
        || ((params.StatusCRUD === 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
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
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddPerfisPage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: AddPerfisPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: AddPerfisPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }
 
}


