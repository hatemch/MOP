import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';
import { Municipios_enderecos } from 'src/app/models/municipios_enderecos';
import { NavController, Events, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Municipio } from 'src/app/models/municipio';
import { ValidationsService } from "../../../services/validations.service";

@Component({
  selector: 'app-add-municipio-endereco',
  templateUrl: './add-municipio-endereco.page.html',
  styleUrls: ['./add-municipio-endereco.page.scss'],
})
export class AddMunicipioEnderecoPage implements OnInit {

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
  public municipioEndereco = new Municipios_enderecos();
  public cidades: Array<Municipio> = [];
  alertController: any;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private validations: ValidationsService
  ) {}

  ngOnInit() {

    // Getting data from another page
   // this.getCidades();
 
    this.getMunicipios();

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.municipioEndereco.id = data.cidade;
        this.municipioEndereco.cidade = data.cidade;

        if (this.municipioEndereco.id) {
          this.title = 'Editar';
          this.CRUDMunicipiosEnderecos(AddMunicipioEnderecoPage.CRUD_READ, { 'cidade': this.municipioEndereco.cidade });
        }
        else {
          this.municipioEndereco.id = "";
          this.title = 'Novo';
        }

      });

  }

  save(form: NgForm) {
    
    if (this.municipioEndereco.id) {
      //ADD CODIGO TO UPDATE 
      console.log('cidade', this.municipioEndereco.cidade);
      form.value.cidade = this.municipioEndereco.cidade.toUpperCase();
      this.CRUDMunicipiosEnderecos(AddMunicipioEnderecoPage.CRUD_UPDATE, form.value);
    }
    else {
      form.value.cidade = form.value.cidade.toUpperCase();
      this.CRUDMunicipiosEnderecos(AddMunicipioEnderecoPage.CRUD_CREATE, form.value);
    }
  }
  
  private CRUDMunicipiosEnderecos(_statusCRUD, _formValues) {
    this.sendRequest('spMunicipiosEnderecos', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case AddMunicipioEnderecoPage.CRUD_CREATE:
          this.router.navigate(['/menu/municipios-enderecos']);
          break;
        case AddMunicipioEnderecoPage.CRUD_READ:
          this.municipioEndereco.id      = JSON.parse(atob(resultado.results))[0].cidade;
          this.municipioEndereco.cidade      = JSON.parse(atob(resultado.results))[0].cidade;
          this.municipioEndereco.bairro      = JSON.parse(atob(resultado.results))[0].bairro;
          this.municipioEndereco.numero      = JSON.parse(atob(resultado.results))[0].numero;
          this.municipioEndereco.complemento = JSON.parse(atob(resultado.results))[0].complemento;
          this.municipioEndereco.rua         = JSON.parse(atob(resultado.results))[0].rua;
          this.municipioEndereco.cep         = JSON.parse(atob(resultado.results))[0].cep;

          break;
        case AddMunicipioEnderecoPage.CRUD_UPDATE:
          this.router.navigate(['/menu/municipios-enderecos']);
          break;

        default:
          break;
      }
    });
  }

  // private getCidades() {
  //   this.sendRequest('spMunicipios', {
  //     StatusCRUD: 'READ',
  //     formValues: ''
  //   }, (resultado) => {

  //     let results = JSON.parse(atob(resultado.results));

  //     this.cidades = results.map(function callback(value) {
  //       let cidade = new Municipio();
  //       cidade.codigo = value.CodigoBaseMunicipio;
  //       cidade.nome = value.Nome;

  //       return cidade;
  //     });
  //   });
  // }

  getMunicipios() {
    this.consultarUFMunicipio(this.municipioEndereco.cidade);
  }

  private consultarUFMunicipio(uf: string) {
    this.sendRequest('spMunicipiosUser', {
      StatusCRUD: 'READ',
      formValues: { "UF": "BA" }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.cidades = results.map(function callback(value) {
        let cidade = new Municipio();
        cidade.codigo = value.codigo;
        cidade.nome = value.nome;


        return cidade;
      });

    });

    }

  goBack() {
    this.router.navigate(['/menu/municipios-enderecos']);
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
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddMunicipioEnderecoPage.APP_NAME, pMessage: resultado.message });
          }
        } catch (err) {
          this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: AddMunicipioEnderecoPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
        }
      });
    } else {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: AddMunicipioEnderecoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
      });
    }
  } else {
    this.goBack()
  }
}

  /* ==================== CPF MASK ====================== */
  formatCEP(valString: any, idComponent: any) {
    this.validations.formatcep(valString, idComponent)
  }


}
