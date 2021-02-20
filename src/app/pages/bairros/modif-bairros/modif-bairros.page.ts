import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { NgForm } from '@angular/forms';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Bairros } from 'src/app/models/bairro';
import { Municipio } from 'src/app/models/municipio';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-modif-bairros',
  templateUrl: './modif-bairros.page.html',
  styleUrls: ['./modif-bairros.page.scss'],
})
export class ModifBairrosPage implements OnInit {
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
  public bairro = new Bairros();
  alertController: any;

  public user = new User();

  public municipio = new Municipio();
  public municipios: Array<Municipio> = [];

  public risps : Array<String> = [];
  public aisps : Array<String> = [];


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
    this.getMunicipios();
    this.getRisp();
    this.getAisp();

    await new Promise(resolve => setTimeout(resolve, 500)); // 3 sec
    // Getting data from another page
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.bairro.codigo = data.codigo;

        if (this.bairro.codigo) {
          this.title = 'Editar';
          this.CRUDBairros(ModifBairrosPage.CRUD_READ, { 'codigo': this.bairro.codigo });
        }
        else {
          this.title = 'Novo';
        }

      });
    //this.getSegmentos();
  }

  isNumeric(value) {
    return /^\d+$/.test(value);
  }

  save(form: NgForm) {

    /*if (!this.isNumeric(this.bairro.codigo_bairro)) {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: ModifBairrosPage.APP_NAME, pMessage: 'Código não é número.'
      });
      return;
    }*/



    if (this.bairro.codigo) {
      //ADD CODIGO TO UPDATE 
      form.value.codigo = this.bairro.codigo;
      this.CRUDBairros(ModifBairrosPage.CRUD_UPDATE, form.value);
    }
    else {
      console.log(form.value);
      this.CRUDBairros(ModifBairrosPage.CRUD_CREATE, form.value);
    }
  }

  private CRUDBairros(_statusCRUD, _formValues) {
    this.sendRequest('spBairros', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case ModifBairrosPage.CRUD_CREATE:
          this.router.navigate(['/menu/bairros']);
          break;
        case ModifBairrosPage.CRUD_READ:
          this.bairro.codigo_bairro = JSON.parse(atob(resultado.results))[0].codigo_bairro;
          this.bairro.nome_bairro = JSON.parse(atob(resultado.results))[0].nome_bairro.toUpperCase();
          this.bairro.nome_municipio = JSON.parse(atob(resultado.results))[0].nome_municipio;
          this.bairro.aisp = JSON.parse(atob(resultado.results))[0].aisp;
          this.bairro.risp = JSON.parse(atob(resultado.results))[0].risp;
          this.bairro.cipm = JSON.parse(atob(resultado.results))[0].cipm;
          this.bairro.dt = JSON.parse(atob(resultado.results))[0].dt;
          this.bairro.codigo_municipio = JSON.parse(atob(resultado.results))[0].codigo_municipio;
          break;
        case ModifBairrosPage.CRUD_UPDATE:
          this.router.navigate(['/menu/bairros']);
          break;
        case 'READ1':
            this.aisps = JSON.parse(atob(resultado.results));
          break;
        case 'READ2':
            this.risps = JSON.parse(atob(resultado.results));
          break;
      
        default:
          break;
      }
    });
  }

  // private getMunicipios() {
  //   this.sendRequest('spMunicipios', {
  //     StatusCRUD: 'READ',
  //     formValues: ''

  //   }, (resultado) => {

  //     let results = JSON.parse(atob(resultado.results));

  //     this.municipios = results.map(function callback(value) {
  //       let municipio = new Municipio();
  //       municipio.codigo = value.codigo;
  //       municipio.nome = value.nome;

  //       return municipio;
  //     });
  //   });
  // }

  getMunicipios() {
    this.consultarUFMunicipio(this.user.UF);
  }

  private consultarUFMunicipio(uf: string) {

    let municioTemp
    if (this.bairro.nome_municipio) {
      municioTemp = this.bairro.nome_municipio.toUpperCase();
      this.bairro.nome_municipio = "";
    }

    this.sendRequest('spMunicipiosUser', {
      StatusCRUD: 'READ',
      formValues: { "UF": "BA" }
    }, (resultado) => {



      let results = JSON.parse(atob(resultado.results));

      this.municipios = results.map(function callback(value) {
        let municipio = new Municipio();
        municipio.codigo = value.codigo;
        municipio.nome = value.nome.toUpperCase();


        return municipio;
      });

      if (municioTemp) {
        this.bairro.nome_municipio = municioTemp.toUpperCase();
      }

    });

  }

  getAisp() {
    this.CRUDBairros('READ1', '');
  }

  getRisp(){
    this.CRUDBairros('READ2', '');
  }

  goBack() {
    this.router.navigate(['/menu/bairros']);
  }

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
        || (procedure === 'spBairros')
      ) {

        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }
        console.log(_params);

        this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
          const resultado: any = res[0];
          try {
            if (resultado.success) {
              next(resultado);
              this.alertService.showLoader(resultado.message, 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: ModifBairrosPage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: ModifBairrosPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: ModifBairrosPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }

}
