import { Component, OnInit } from '@angular/core';
import { LocalPericia } from 'src/app/models/local-pericia';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { Municipio } from 'src/app/models/municipio';
import { Bairros } from 'src/app/models/bairro';
import { TipoLocal } from 'src/app/models/tipo-local';
import { TipoLogradouro } from 'src/app/models/tipo-logradouro';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationsService } from 'src/app/services/validations.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-local-pericia',
  templateUrl: './local-pericia.page.html',
  styleUrls: ['./local-pericia.page.scss'],
})
export class LocalPericiaPage implements OnInit {

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  };

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';
  private APP_NAME: string = this.env.AppName;

  public isEditing: boolean = false;

  public numguia: any;
  public nomeGuia: string;
  public showOutrasPericias: boolean  = false;
  public showObjetosPericia: boolean = false;
  public localpericias: Array<LocalPericia> = [];
  public localpericia = new LocalPericia();

  public municipios: Array<Municipio> = [];
  public bairros: Array<Bairros> = [];
  public tipolocales: Array<TipoLocal> = [];
  public tipologradouros: Array<TipoLogradouro> = [];

  constructor(
    private Authorizer: AuthService,
    private alertService: AlertService,
    private env: EnvService,
    private validations: ValidationsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController
  ) { }

  ngOnInit() {

    this.localpericias = [];
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        //this.localpericia.numguia = data.numguia;
        this.numguia = data.numguia;
        this.localpericia.tipo_guia=data.tipoGuia;
        if (this.localpericia.tipo_guia == 'GM') {
          this.nomeGuia = 'Guia Medica';
          this.showOutrasPericias=true;
        }
        if (this.localpericia.tipo_guia == 'GL') {
          this.showObjetosPericia= true;
          this.nomeGuia = 'Guia Laboratorial';
        }
        if (this.numguia) {
          this.localpericia.numguia = this.numguia
          
          this.CRUDLocalPericia(LocalPericiaPage.CRUD_READ);
        }
      });
    this.consultarTipoLocal();
    this.GetMunicipios();
    this.consultarLogradouro();
  }

  /* ======= SELECT TIPO LOCAL============================================================== */
  consultarTipoLocal() {
    this.sendRequest('spConsultaTipolocal', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.tipolocales = results.map(function callback(value) {
        let tipo = new TipoLocal();
        tipo.codigo = value.codigo;
        tipo.tipo_local = value.tipo_local;
        return tipo;
      });
      console.log("tipoLocal",this.tipolocales)
    });
  }
  nameTipo(tipo_local: any) {
    console.log('name_tipo_local', tipo_local)
  }
  /* ======= END SELECT TIPO LOCAL ============================================================== */

  /* ======= SELECT MUNICIPIOS ============================================================== */
  GetMunicipios() {
    this.sendRequest('spMunicipios', {
      StatusCRUD: 'READ',
      formValues: { 'codigoUF': "29" },
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.municipios = results.map(function callback(value) {
        let municipio = new Municipio();
        municipio.codigo = value.CodigoBaseMunicipio;
        municipio.nome = value.Nome;
        municipio.bairro = value.bairro;
        municipio.complemento = value.complemento;
        municipio.endereco = value.endereco;
        municipio.cep = value.cep;
        municipio.unidade = value.unidade;
        return municipio;
      });
    });
  }
  /* ======= END SELECT MUNICIPIOS ============================================================== */

  /* ======= SELECT BAIRROS ============================================================== */
  GetBairros() {
    this.sendRequest('spConsultaBairros', {
      StatusCRUD: 'READ',
      formValues: { 'codigoMunicipio': this.localpericia.municipio }
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.bairros = results.map(function callback(value) {
        let bairro = new Bairros();
        bairro.codigo_bairro = value.codigo_bairro;
        bairro.nome_bairro = value.nome_bairro;
        return bairro;
      });
      console.log('Bairros', results);
    });
  }
  /* ======= SELECT BAIRROS ============================================================== */

  /* ======= SELECT LOGRADURO ============================================================== */
  consultarLogradouro() {
    this.sendRequest('spTipoLogradouro', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.tipologradouros = results.map(function callback(value) {
        let tipoLog = new TipoLogradouro();
        tipoLog.idTipoLogradouro = value.idTipoLogradouro;
        tipoLog.nome = value.nome;
        tipoLog.abreviatura = value.abreviatura;
        return tipoLog;
      });
    });
  }
  /* ======= END SELECT LOGRADURO ============================================================== */
  /* ======= INCLUIR ============================================================== */
  buttomEnd() {
    let nameLograduro: any;
    let namemunicipio: any;
    let complemento: any
    let cep: any;

    this.localpericia.uf = 'Bahia';
    if (!this.localpericia.complemento) complemento = '...';
    else complemento = ',' + this.localpericia.complemento;
    if (this.localpericia.cep) cep = 'CEP:' + this.localpericia.cep;
    else cep = '';
    for (let i = 0; i < this.tipologradouros.length; i++) {
      if (this.localpericia.logradouro == this.tipologradouros[i].idTipoLogradouro) { nameLograduro = this.tipologradouros[i].nome }
    }
    for (let i = 0; i < this.municipios.length; i++) {
      if (this.localpericia.municipio == this.municipios[i].codigo) { namemunicipio = this.municipios[i].nome }
    }

    this.localpericia.descricao = nameLograduro + complemento + cep + '-' + namemunicipio + '-' + this.localpericia.uf + '-' + 'Brasil';
    console.log('to create:', this.localpericia)

    if (this.localpericia.codigo) { this.update(); }
    else { this.addToNumGuia(); }
  }

  addToNumGuia() {
    this.CRUDLocalPericia(LocalPericiaPage.CRUD_CREATE);
  }
  /* ======= END INCLUIR ============================================================== */
  edit(row: any) {
    console.log('para editar', row);
    this.isEditing = true;
    this.localpericia.codigo = Number(row.codigo);
    this.localpericia.tipo_local = Number(row.tipo_local);
    if (row.cep) { this.localpericia.cep = this.validations.convertCPFtoNumber(row.cep); } else { this.localpericia.cep = ''; }
    this.localpericia.municipio = Number(row.municipio);
    this.localpericia.bairro = Number(row.bairro);
    this.localpericia.logradouro = Number(row.logradouro);
    if (row.complemento) { this.localpericia.complemento = row.complemento; } else { this.localpericia.complemento = ''; }
    if (row.ponto_referencia) { this.localpericia.ponto_referencia = row.ponto_referencia; } else { this.localpericia.ponto_referencia = ''; }
    if (row.latitude) { this.localpericia.latitude = row.latitude; } else { this.localpericia.latitude = ''; }
    if (row.longitude) { this.localpericia.longitude = row.longitude; } else { this.localpericia.longitude = ''; }
  }

  public async alertdelete(row: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você deseja apagar <strong>' + row.nome_tipo_local + '</strong>?',
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
            this.localpericia.codigo = row.codigo;
            this.CRUDLocalPericia(LocalPericiaPage.CRUD_DELETE);
          }
        }
      ]
    });

    await alert.present();
    this.CRUDLocalPericia(LocalPericiaPage.CRUD_READ);
  }

  update() {
    this.CRUDLocalPericia(LocalPericiaPage.CRUD_UPDATE);
    this.isEditing = false;
  }
  /* ======= CRUD LOCAL PERICIA ============================================================== */
  private CRUDLocalPericia(_statusCRUD: any) {

    this.sendRequest('spLocalPericia', {
      StatusCRUD: _statusCRUD,
      formValues: this.localpericia
    }, (resultado) => {

      switch (_statusCRUD) {
        case LocalPericiaPage.CRUD_CREATE:
          this.localpericia = new LocalPericia();
          this.localpericia.numguia = Number(this.numguia);
          this.CRUDLocalPericia(LocalPericiaPage.CRUD_READ);
          break;
        case LocalPericiaPage.CRUD_READ:
          let results = JSON.parse(atob(resultado.results));
          this.localpericias = results.map(function callback(value) {
            let local = new LocalPericia();
            local.bairro = value.bairro;
            local.cep = value.cep;
            local.codigo = value.codigo;
            local.complemento = value.complemento;
            local.concluir = value.concluir;
            local.descricao = value.descricao;
            local.latitude = value.latitude;
            local.logradouro = value.logradouro;
            local.longitude = value.longitude;
            local.municipio = value.municipio;
            local.numguia = value.numguia;
            local.ponto_referencia = value.ponto_referencia;
            local.quesitacoes = value.quesitacoes;
            local.tipo_local = value.tipo_local;
            local.nome_tipo_local = value.nome_tipo_local;
            local.uf = value.uf;
            return local;
          });
          console.log('resultado read:', results)
          break;
        case LocalPericiaPage.CRUD_UPDATE:
          this.localpericia = new LocalPericia();
          this.localpericia.numguia = Number(this.numguia);
          this.CRUDLocalPericia(LocalPericiaPage.CRUD_READ);
          break;
        case LocalPericiaPage.CRUD_DELETE:
          this.localpericia = new LocalPericia();
          this.localpericia.numguia = Number(this.numguia);
          this.CRUDLocalPericia(LocalPericiaPage.CRUD_READ);
          break;

        default:
          break;
      }
    });
  }
  /* ======= END CRUD LOCAL PERICIA ============================================================== */

  /* ======= SEND REQUEST ============================================================== */
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
        || (procedure === 'spUsuarios')
      ) {

        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProcPost('ExecutarPOST', procedure, _params).then(res => {
          // this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
          const resultado: any = res[0];
          try {
            if (resultado.success) {
              next(resultado);
              this.alertService.showLoader(resultado.message, 1000);
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

  goBack() {
    
    this.router.navigate(['/menu/incluir-exame-medico', this.localpericia.numguia]);
  }
  goObjetosPericia() {
    this.router.navigate(['/menu/objetos-pericia', this.localpericia.numguia]);
  }
  goToGuia(){
    if(this.localpericia.tipo_guia=='GM'){
      this.router.navigate(['/menu/incluir-exame-medico', this.localpericia.numguia]);
    }
    if(this.localpericia.tipo_guia=='GL'){
      this.router.navigate(['/menu/incluir-exame-laboratorial', this.localpericia.numguia]);
    }
  }

  /* ======= END SEND REQUEST ============================================================== */

  /* ===== VALIDATIONS ======================================================= */
  isNumber(value: string | number): boolean {
    return ((value != null) &&
      (value !== '') &&
      !isNaN(Number(value.toString())));
  }
  formatCEP(valString: any, idComponent: any) {
    this.validations.formatcep(valString, idComponent)
  }
  /* ===== END VALIDATIONS ======================================================= */

}

/* 9L */
