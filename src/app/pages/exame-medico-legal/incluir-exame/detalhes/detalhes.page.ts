import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { Grupo } from 'src/app/models/grupo';
import { EnvService } from 'src/app/services/env.service';
import { ValidationsService } from 'src/app/services/validations.service';
import { DetalhesFato } from 'src/app/models/detalhes-fato';
import { UF } from 'src/app/models/uf';
import { Municipio } from 'src/app/models/municipio';
import { Bairros } from 'src/app/models/bairro';
import { TipoLocal } from 'src/app/models/tipo-local';
import { Tipificacao } from 'src/app/models/tipificacao';
import { NgForm } from '@angular/forms';
import { TipoLogradouro } from 'src/app/models/tipo-logradouro';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.page.html',
  styleUrls: ['./detalhes.page.scss'],
})
export class DetalhesPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_READ_TIPI: string = 'READ_TIPI';
  static CRUD_READ_LOCAL: string = 'READ_LOCAL';

  static CRUD_CREATE_TIPI: string = 'CREATE_TIPI';
  static CRUD_CREATE_LOCAL: string = 'CREATE_LOCAL';

  static CRUD_UPDATE_TIPI: string = 'UPDATE_TIPI';
  static CRUD_UPDATE_LOCAL: string = 'UPDATE_LOCAL';

  static CRUD_DELETE: string = 'DELETE';

  private APP_NAME: string = this.env.AppName;

  public isEditingTipi: boolean = false;
  public isEditingLocal: boolean = false;
  public noCompleteFormTipi: boolean = false;
  public noCompleteFormLocal: boolean = false;
  public opcion: string = ''


  public subtitle = 'Detalhes do Fato';
  public nomeGuia: string;
  public flagForm: boolean = false;
  public detalhe = new DetalhesFato();
  public detalheTipo = new DetalhesFato();
  public detalheFato = new DetalhesFato();
  public detalhesTipo: Array<DetalhesFato> = [];
  public detalhesLocal: Array<DetalhesFato> = [];
  public showOutrasPericias: boolean  = false;
  public showObjetosPericia: boolean = false;

  public Bairros: any[];

  public grupos: Array<Grupo> = [];

  public ufs: Array<UF> = [];
  public municipios: Array<Municipio> = [];
  public bairros: Array<Bairros> = [];
  public tipolocals: Array<TipoLocal> = [];
  public tipologradouros: Array<TipoLogradouro> = [];
  public tipificacaos: Array<Tipificacao> = [];

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  };


  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private authService: AuthService,
    private validations: ValidationsService,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    let current_datetime = new Date()
    let formatted_date = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()

    await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec


    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.detalhe.numguia = data.numguia;
        this.detalhe.tipo_guia = data.tipoGuia
        if (this.detalhe.tipo_guia == 'GM') {
          this.nomeGuia = 'Guia Medica';
          this.showOutrasPericias=true;
        }
        if (this.detalhe.tipo_guia == 'GL') {
          this.showObjetosPericia= true;
          this.nomeGuia = 'Guia Laboratorial';
        }
        if (this.detalhe.numguia) {
          this.CRUDDetalhes(DetalhesPage.CRUD_READ);
          this.CRUDDetalhes(DetalhesPage.CRUD_READ_TIPI);
          this.CRUDDetalhes(DetalhesPage.CRUD_READ_LOCAL);
        }
      });
    this.CarregaTipoLocal();
    this.CarregaTipificacao();
    this.GetMunicipios();
    this.CarregaTipoLogradouro();
  }

  goBack() {
    this.router.navigate(['/menu/incluir-exame-medico', this.detalhe.numguia]);
  }
  goObjetosPericia() {
    this.router.navigate(['/menu/objetos-pericia', this.detalhe.numguia]);
  }
  goToGuia(){
    if(this.detalhe.tipo_guia=='GM'){
      this.router.navigate(['/menu/incluir-exame-medico', this.detalhe.numguia]);
    }
    if(this.detalhe.tipo_guia=='GL'){
      this.router.navigate(['/menu/incluir-exame-laboratorial', this.detalhe.numguia]);
    }
  }

  /* ======= SELECT MUNICIPIOS ============================================================== */
  private GetMunicipios() {
    this.sendRequest('spMunicipios', {
      StatusCRUD: 'READ',
      formValues: { 'codigoUF': "29" },
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      console.log('Municipios', results);
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
      //}
    });
  }
  /* ======= END SELECT MUNICIPIOS ============================================================== */

  /* ======= SELECT BAIRROS ============================================================== */
  public GetBairros(form: NgForm) {

    this.sendRequest('spConsultaBairros', {
      StatusCRUD: 'READ',
      formValues: { 'codigoMunicipio': this.detalhe.municipio }
    }, (resultado) => {
      this.Bairros = JSON.parse(atob(resultado.results));
    });
  }

  /* ======= SELECT BAIRROS ============================================================== */

  /* ======= SELECT TIPIFICACAO ============================================================== */
  CarregaTipificacao() {
    this.consultarTipificacao();
  }

  private consultarTipificacao() {
    this.sendRequest('spConsultaTipificacao', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      console.log('Tipificacaos', results);
      this.tipificacaos = results.map(function callback(value) {
        let tipificacao = new Tipificacao();
        tipificacao.id_tipificacao = value.id_tipificacao;
        tipificacao.tipificacao = value.tipificacao;
        return tipificacao;
      });
    });
  }
  /* ======= END SELECT TIPIFICACAO ============================================================== */

  /* ======= SELECT TIPO LOGRADURO ============================================================== */
  CarregaTipoLogradouro() {
    this.consultarTipoLogradouro();
  }

  private consultarTipoLogradouro() {
    this.sendRequest('spTipoLogradouro', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      console.log('tiposLogradouro', results);
      this.tipologradouros = results.map(function callback(value) {
        let tipoLog = new TipoLogradouro();
        tipoLog.idTipoLogradouro = value.idTipoLogradouro;
        tipoLog.nome = value.nome;
        tipoLog.abreviatura = value.abreviatura;
        return tipoLog;
      });
    });
  }
  /* ======= END SELECT TIPO LOGRADURO ============================================================== */

  /* ======= SELECT TIPO LOCAL ============================================================== */
  CarregaTipoLocal() {
    this.consultarTipoLocal();
  }

  private consultarTipoLocal() {
    this.sendRequest('spConsultaTipolocal', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      console.log('tiposLocal', results);
      this.tipolocals = results.map(function callback(value) {
        let tipo = new TipoLocal();
        tipo.codigo = value.codigo;
        tipo.tipo_local = value.tipo_local;
        return tipo;
      });
    });
  }
  /* ======= END SELECT TIPO LOCAL ============================================================== */

  incluirTipificacao() {
    console.log('TIPIFICACACO');
    console.log('data', this.detalhe.data);
    console.log('hora', this.detalhe.hora);
    console.log('descricao', this.detalhe.descricao);//
    console.log('naturaleza', this.detalhe.natureza_do_fato);
    console.log('tipificacao', this.detalhe.tipificacao);

    if (!this.detalhe.data) { this.noCompleteFormTipi = true; } else { this.noCompleteFormTipi = false; }
    if (!this.detalhe.hora) { this.noCompleteFormTipi = true; } else { this.noCompleteFormTipi = false; }
    if (!this.detalhe.descricao) { this.noCompleteFormTipi = true; } else { this.noCompleteFormTipi = false; }
    if (!this.detalhe.natureza_do_fato) { this.noCompleteFormTipi = true; } else { this.noCompleteFormTipi = false; }
    if (!this.detalhe.tipificacao) { this.noCompleteFormTipi = true; } else { this.noCompleteFormTipi = false; }

    if (this.noCompleteFormTipi) {
      this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Preencha os campos em vermelho' });
      return;
    } else {
      console.log('all', this.detalhe);
      if (this.detalhe.codigoTipo) {
        this.isEditingTipi = false;
        this.CRUDDetalhes(DetalhesPage.CRUD_UPDATE_TIPI);
      } else {
        this.CRUDDetalhes(DetalhesPage.CRUD_CREATE_TIPI);
      }
    }
  }

  editTipi(row: any) {
    console.log('para editar', row);
    this.isEditingTipi = true;
    this.detalhe.codigo = Number(row.codigoTipo);
    this.detalhe.codigoTipo = row.codigoTipo;
    this.detalhe.natureza_do_fato = row.natureza_do_fato;
    this.detalhe.tipificacao = row.tipificacao.toString();
    if (row.descricao_da_suspeita) { this.detalhe.descricao_da_suspeita = row.descricao_da_suspeita; } else { this.detalhe.descricao_da_suspeita = ''; }
  }

  public async alertdeleteTipi(row: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você deseja apagar <strong>' + row.nome_tipificacao + '</strong>?',
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
            this.opcion = 'TIPI'
            this.detalhe.codigoTipo = row.codigoTipo;
            this.CRUDDetalhes(DetalhesPage.CRUD_DELETE);
          }
        }
      ]
    });

    await alert.present();
    //this.CRUDDetalhes(DetalhesPage.CRUD_READ_TIPI);
  }

  incluirLocalFato() {
    console.log('LOCAL FATO')
    console.log('data', this.detalhe.data)
    console.log('hora', this.detalhe.hora)
    console.log('descricao', this.detalhe.descricao)//
    console.log('uf', this.detalhe.uf)
    console.log('tipo local', this.detalhe.tipo_local)
    console.log('municipio', this.detalhe.municipio)
    console.log('bairro', this.detalhe.bairro)
    console.log('lograduro', this.detalhe.tipo_logradouro)

    if (!this.detalhe.data) { this.noCompleteFormLocal = true; } else { this.noCompleteFormLocal = false; }
    if (!this.detalhe.hora) { this.noCompleteFormLocal = true; } else { this.noCompleteFormLocal = false; }
    if (!this.detalhe.descricao) { this.noCompleteFormLocal = true; } else { this.noCompleteFormLocal = false; }

    this.detalhe.uf = 'Bahia';
    if (!this.detalhe.tipo_local) { this.noCompleteFormLocal = true; } else { this.noCompleteFormLocal = false; }
    if (!this.detalhe.municipio) { this.noCompleteFormLocal = true; } else { this.noCompleteFormLocal = false; }
    if (!this.detalhe.bairro) { this.noCompleteFormLocal = true; } else { this.noCompleteFormLocal = false; }
    if (!this.detalhe.tipo_logradouro) { this.noCompleteFormLocal = true; } else { this.noCompleteFormLocal = false; }

    if (this.noCompleteFormLocal) {
      this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Preencha os campos em vermelho' });
      return;
    } else {
      console.log('all', this.detalhe);
      if (this.detalhe.codigoLocal) {
        this.isEditingLocal = false;
        this.CRUDDetalhes(DetalhesPage.CRUD_UPDATE_LOCAL);
      } else { this.CRUDDetalhes(DetalhesPage.CRUD_CREATE_LOCAL); }
    }
  }

  editLocal(row: any) {
    console.log('para editar', row);
    this.isEditingLocal = true;
    this.detalhe.codigo = Number(row.codigoLocal);
    this.detalhe.codigoLocal = row.codigoLocal;
    this.detalhe.uf = row.uf;
    if (row.cep) { this.detalhe.cep = this.validations.convertCPFtoNumber(row.cep); } else { this.detalhe.cep = ''; }
    this.detalhe.municipio = row.municipio;
    this.detalhe.bairro = row.bairro;
    this.detalhe.tipo_logradouro = Number(row.tipo_logradouro);
    this.detalhe.tipo_local = Number(row.tipo_local);
    if (row.complemento) { this.detalhe.complemento = row.complemento; } else { this.detalhe.complemento = ''; }
  }

  public async alertdeleteLocal(row: any) {
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
            this.opcion = 'LOCAL'
            this.detalhe.codigoLocal = row.codigoLocal;
            this.CRUDDetalhes(DetalhesPage.CRUD_DELETE);
          }
        }
      ]
    });

    await alert.present();
    //this.CRUDDetalhes(DetalhesPage.CRUD_READ_TIPI);
  }

  /* ======= CRUD DETALHES ============================================================== */
  private CRUDDetalhes(_statusCRUD) {

    this.sendRequest('spDetalhesFato', {
      StatusCRUD: _statusCRUD,
      formValues: this.detalhe
    }, (resultado) => {
      switch (_statusCRUD) {
        case DetalhesPage.CRUD_CREATE_TIPI:
          //this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.message });
          this.detalhe.codigo = '';
          this.detalhe.tipificacao = '';
          this.detalhe.natureza_do_fato = '';
          this.detalhe.descricao_da_suspeita = '';
          this.CRUDDetalhes(DetalhesPage.CRUD_READ_TIPI);
          break;
        case DetalhesPage.CRUD_CREATE_LOCAL:
          this.detalhe.codigo = '';
          this.detalhe.uf = '';
          this.detalhe.tipo_local = '';
          this.detalhe.cep = '';
          this.detalhe.municipio = '';
          this.detalhe.bairro = '';
          this.detalhe.tipo_logradouro = '';
          this.detalhe.complemento = '';
          this.CRUDDetalhes(DetalhesPage.CRUD_READ_LOCAL);
          break;
        case DetalhesPage.CRUD_READ:
          let results = JSON.parse(atob(resultado.results));
          if (results.length > 0) {
            this.detalhe.data = results[0].data;
          } else {
            this.detalhe.data = '';
          }
          if (results.length > 0) {
            this.detalhe.hora = results[0].hora;
          } else {
            this.detalhe.hora = '';
          }
          if (results.length > 0) {
            this.detalhe.descricao = results[0].descricao;
          } else {
            this.detalhe.descricao = '';
          }



          console.log('read top:', results)
          break;
        case DetalhesPage.CRUD_READ_TIPI:
          // this.detalhe.numguia = JSON.parse(atob(resultado.results))[0].numguia;
          // this.detalhe.usuario = JSON.parse(atob(resultado.results))[0].usuario;
          let resultsT = JSON.parse(atob(resultado.results));
          this.detalhesTipo = resultsT.map(function callback(value) {
            let detalTipo = new DetalhesFato();
            detalTipo.natureza_do_fato = value.natureza_do_fato;
            detalTipo.tipificacao = Number(value.tipificacao);
            detalTipo.nome_tipificacao = value.nome_tipificacao;
            detalTipo.descricao_da_suspeita = value.descricao_da_suspetia;
            detalTipo.codigoTipo = value.CODIGO;
            detalTipo.codigoLocal = '';
            return detalTipo;
          });
          console.log('resultado read:', resultsT)
          break;
        case DetalhesPage.CRUD_READ_LOCAL:
          let resultsL = JSON.parse(atob(resultado.results));
          this.detalhesLocal = resultsL.map(function callback(value) {
            let detalLocal = new DetalhesFato();
            detalLocal.codigoLocal = value.CODIGO;
            detalLocal.codigoTipo = '';
            detalLocal.uf = value.uf;
            detalLocal.tipo_local = Number(value.tipo_local);
            detalLocal.nome_tipo_local = value.nome_tipo_local;
            detalLocal.cep = value.cep;
            detalLocal.municipio = Number(value.municipio);
            detalLocal.nome_municipio = value.nome_municipio;
            detalLocal.bairro = Number(value.bairro);
            detalLocal.nome_bairro = value.nome_bairro;
            detalLocal.tipo_logradouro = Number(value.tipo_logradouro);
            detalLocal.nome_logradouro = value.nome_logradouro;
            detalLocal.complemento = value.complemento;
            detalLocal.descricao_local = value.nome_logradouro + '-' + value.nome_bairro + '-' + value.nome_municipio + '-' + value.uf;
            return detalLocal;
          });
          console.log('resultado read:', resultsL)
          break;
        case DetalhesPage.CRUD_UPDATE_TIPI:
          //this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.message });
          this.detalhe.codigo = '';
          this.detalhe.codigoTipo = '';
          this.detalhe.tipificacao = '';
          this.detalhe.natureza_do_fato = '';
          this.detalhe.descricao_da_suspeita = '';
          this.CRUDDetalhes(DetalhesPage.CRUD_READ_TIPI);
          break;
        case DetalhesPage.CRUD_UPDATE_LOCAL:
          this.detalhe.codigo = '';
          this.detalhe.codigoLocal = '';
          this.detalhe.uf = '';
          this.detalhe.tipo_local = '';
          this.detalhe.cep = '';
          this.detalhe.municipio = '';
          this.detalhe.bairro = '';
          this.detalhe.tipo_logradouro = '';
          this.detalhe.complemento = '';
          this.CRUDDetalhes(DetalhesPage.CRUD_READ_LOCAL);
          break;
        case DetalhesPage.CRUD_DELETE:
          this.detalhe.codigo = '';
          this.detalhe.codigoTipo = '';
          this.detalhe.tipificacao = '';
          this.detalhe.natureza_do_fato = '';
          this.detalhe.descricao_da_suspeita = '';
          this.detalhe.codigoLocal = '';
          this.detalhe.uf = '';
          this.detalhe.tipo_local = '';
          this.detalhe.cep = '';
          this.detalhe.municipio = '';
          this.detalhe.bairro = '';
          this.detalhe.tipo_logradouro = '';
          this.detalhe.complemento = '';
          if (this.opcion == 'TIPI') { this.isEditingTipi = false; this.CRUDDetalhes(DetalhesPage.CRUD_READ_TIPI); }
          else if (this.opcion == 'LOCAL') { this.isEditingLocal = false; this.CRUDDetalhes(DetalhesPage.CRUD_READ_LOCAL); }
          break;
        default:
          break;
      }
    });
  }
  /* ======= END CRUD DETALHES ============================================================== */

  /* ======= SEND REQUEST ============================================================== */
  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD === 'CREATE_TIPI') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'CREATE_LOCAL') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'READ_TIPI') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'READ_LOCAL') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'UPDATE_TIPI') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD === 'UPDATE_LOCAL') && (this.permissoes.Editar > 0))
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

  // save(form: NgForm) {

  //   this.detalhe.numguia = this.detalhe.numguia;

  //   this.detalhe.data = this.detalhe.data;
  //   this.detalhe.descricao = this.detalhe.descricao;
  //   this.detalhe.natureza_do_fato = this.detalhe.natureza_do_fato;
  //   this.detalhe.descricao_da_suspeita = this.detalhe.descricao_da_suspeita;
  //   this.detalhe.tipificacao = this.detalhe.tipificacao;

  //   this.detalhe.tipo_local = this.detalhe.tipo_local;
  //   this.detalhe.cep = this.detalhe.cep;
  //   this.detalhe.municipio = this.detalhe.municipio;
  //   this.detalhe.bairro = this.detalhe.bairro;
  //   this.detalhe.tipo_logradouro = this.detalhe.tipo_logradouro;
  //   this.detalhe.complemento = this.detalhe.complemento;

  //   this.detalhe.usuario = this.Authorizer.CodigoUsuarioSistema;

  //   if (this.detalhe.codigo) {
  //     //ADD CODIGO TO UPDATE 
  //     console.log('UPDATE')
  //     //this.CRUDDetalhes(DetalhesPage.CRUD_UPDATE);
  //   }
  //   else {
  //     console.log('CREATE')
  //     //this.CRUDDetalhes(DetalhesPage.CRUD_CREATE);
  //   }
  // }


}

/* 9l */