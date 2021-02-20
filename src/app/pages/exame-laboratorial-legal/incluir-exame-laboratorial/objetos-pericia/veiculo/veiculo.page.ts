import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import { UsersPage } from 'src/app/pages/users/users.page';
import { Md5 } from 'ts-md5';
//SERVICES
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { ValidationsService } from 'src/app/services/validations.service';
//MODELS
import { GuiaPericia } from 'src/app/models/guia-pericia';
import { Grupo } from 'src/app/models/grupo';
import { BuscarOcorrenciaPage } from 'src/app/pages/exame-medico-legal/buscar-ocorrencia/buscar-ocorrencia.page';
import { VeiculoGuia } from 'src/app/models/veiculo-guia';
import { TipoObjeto } from 'src/app/models/tipo-objeto';
import { TipoLocal } from 'src/app/models/tipo-local';
import { ExameItem } from 'src/app/models/exame-item';

@Component({
  selector: 'app-veiculo',
  templateUrl: './veiculo.page.html',
  styleUrls: ['./veiculo.page.scss'],
})
export class VeiculoPage implements OnInit {

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
  private APP_NAME: string = this.env.AppName;

  public noCompleteForm: boolean = false;


  public subtitle = 'Incluir Veiculo';
  public flagForm: boolean = false;
  public veiculoGuia = new VeiculoGuia();
  public veiculoGuias: Array<VeiculoGuia> = [];
  public activateButton = true;

  public opcaoEditar: boolean = false;
  public opcaoIncluir: boolean = false;

  public tempArray: Array<any> = [];
  public arrayExames: Array<any> = [];

  public tipoObjetos: Array<TipoObjeto> = [];
  public tipolocales: Array<TipoLocal> = [];
  public examesItems: Array<ExameItem> = [];

  constructor(private navCtrl: NavController,
    private alertCtrl: AlertController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private validations: ValidationsService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.consultarExamReq();
    this.consultarTipoLocal();
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.veiculoGuia.codigo = data.codigoVeiculo;
        this.veiculoGuia.numguia = data.codigoGuia;

        if (this.veiculoGuia.codigo) {
          this.CRUDVeiculo(VeiculoPage.CRUD_READ);
          this.readExames();
          this.activateButton = false;
          
        }
      });
   
  }

  save(form: NgForm) {
    if (this.arrayExames.length > 0) {
      if (this.veiculoGuia.codigo) {
        //ADD CODIGO TO UPDATE 


        console.log('UPDATE')
        console.log(this.veiculoGuia.codigo);
        console.log(this.veiculoGuia.numguia);
        this.veiculoGuia.usuario = this.Authorizer.CodigoUsuarioSistema;
        this.CRUDVeiculo(VeiculoPage.CRUD_UPDATE);
      } else {
        console.log('CREATE')
        this.veiculoGuia.usuario = this.Authorizer.CodigoUsuarioSistema;
        this.CRUDVeiculo(VeiculoPage.CRUD_CREATE);

      }
      this.activateButton = false;
      //Custom Validation, you can create a function to validate it


    } else {
      this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Faltam Exames Requisitados' });
      return;
    }



    this.router.navigate(['/menu/objetos-pericia', this.veiculoGuia.numguia]);
  }
  /* ===== END SAVE NEW/CHANGES =============================================================================== */


  /* ===== CRUD MODULE USERS =============================================================================== */
  private CRUDVeiculo(_statusCRUD) {

    this.sendRequest('spVeiculoGuia', {
      StatusCRUD: _statusCRUD,
      formValues: this.veiculoGuia
    }, (resultado) => {

      switch (_statusCRUD) {
        case VeiculoPage.CRUD_CREATE:
          // this.router.navigate(['/menu/exame-laboratorial-legal']);

          this.veiculoGuia.codigo = JSON.parse(atob(resultado.results))[0].codigo;
          this.salvarExames(this.veiculoGuia.codigo, this.veiculoGuia.numguia);
          console.log('data guia', this.veiculoGuia.codigo)


          break;
        case VeiculoPage.CRUD_READ:


          this.veiculoGuia.numguia = JSON.parse(atob(resultado.results))[0].numguia;
          this.veiculoGuia.placa = JSON.parse(atob(resultado.results))[0].placa;
          this.veiculoGuia.marca = JSON.parse(atob(resultado.results))[0].marca;
          this.veiculoGuia.tipo_local = Number(JSON.parse(atob(resultado.results))[0].tipo_local);
          this.veiculoGuia.tipo_veiculo = JSON.parse(atob(resultado.results))[0].tipo_veiculo;
          this.veiculoGuia.ano_mod = JSON.parse(atob(resultado.results))[0].ano_mod;
          this.veiculoGuia.modelo = JSON.parse(atob(resultado.results))[0].modelo;
          this.veiculoGuia.ano_fab = JSON.parse(atob(resultado.results))[0].ano_fab;
          this.veiculoGuia.chassi = JSON.parse(atob(resultado.results))[0].chassi;
          this.veiculoGuia.renavam = JSON.parse(atob(resultado.results))[0].renavam;
          this.veiculoGuia.descricao = JSON.parse(atob(resultado.results))[0].descricao;
          this.veiculoGuia.descricao_local = JSON.parse(atob(resultado.results))[0].descricao_local;
          this.veiculoGuia.quesitacoes = JSON.parse(atob(resultado.results))[0].quesitacoes;
          this.veiculoGuia.usuario = JSON.parse(atob(resultado.results))[0].usuario;

          //this.router.navigate(['/menu/objetos-pericia',this.veiculoGuia.numguia]);


          break;
        case VeiculoPage.CRUD_UPDATE:
          this.veiculoGuia.codigo = JSON.parse(atob(resultado.results))[0].codigo;

          this.updateExames(this.veiculoGuia.codigo, this.veiculoGuia.numguia);
          this.router.navigate(['/menu/objetos-pericia', this.veiculoGuia.numguia]);
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
        ((params.StatusCRUD === 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
        || ((params.StatusCRUD === 'CREATE_EXAME') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'NOVO_EXAME') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'READ_ONE') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'READ_EXAM_ONE') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'DELETE_EXAMES') && (this.permissoes.Deletar > 0))
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

  private sendRequestOnline(
    procedure: string,
    params: any,
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {

      if (this.permissoes.Pesquisar > 0
        || this.permissoes.Deletar > 0
        || this.permissoes.Inserir > 0
        || this.permissoes.Editar > 0
        // || (params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
      ) {
        this.Authorizer.QueryOnline(procedure, params).then(res => {
          const resultado: any = res;
          try {
            if (Array.isArray(resultado)) {
              next(resultado);
              this.alertService.showLoader('Cargando', 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.error.Message });
              console.log('resultado.error.StackTrace: ', resultado.error.StackTrace);
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação' })
      }


    } else {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
      });
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  public getVeiculoData(evt) {

    console.log('evt:', evt);
    const params = new FormData();
    this.veiculoGuia.placa = evt;

    params.append('placa', this.Authorizer.encripta(this.veiculoGuia.placa ? this.veiculoGuia.placa.toUpperCase() : ''));


    // params.append('placa', this.Authorizer.encripta(this.veiculo.placa));
    // params.append('chassi', this.Authorizer.encripta(this.veiculo.chassi));

    this.sendRequestOnline('ConsultaVeiculo', params
      , (resultado) => {

        console.log('resultado.results:', resultado);

        this.veiculoGuias = resultado.map(function callback(value) {
          let veiculoGuia = new VeiculoGuia();

          if (value.codretorno == "0") {
            let marcaComplete = value.marca.split("/");


            veiculoGuia.placa = value.placa;
            veiculoGuia.marca = marcaComplete[0];
            veiculoGuia.modelo = marcaComplete[1];
            veiculoGuia.tipo_veiculo = value.tipo;
            veiculoGuia.chassi = value.chassi;
            veiculoGuia.ano_mod = value.anomodelo;
            veiculoGuia.renavam = value.renavam;
            veiculoGuia.chassi = value.chassi;
            veiculoGuia.ano_fab = value.anofabricacao;


          }
          return veiculoGuia;
        });

        if (this.veiculoGuias.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        }

        if (!this.veiculoGuias[0].placa) {
          this.veiculoGuias = [];
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
          return;
        }
        else {
          this.veiculoGuia.placa = this.veiculoGuias[0].placa;
          this.veiculoGuia.marca = this.veiculoGuias[0].marca;
          this.veiculoGuia.modelo = this.veiculoGuias[0].modelo;
          this.veiculoGuia.chassi = this.veiculoGuias[0].chassi;
          this.veiculoGuia.ano_mod = this.veiculoGuias[0].ano_fab;
          this.veiculoGuia.renavam = this.veiculoGuias[0].renavam;
          this.veiculoGuia.chassi = this.veiculoGuias[0].chassi;
          this.veiculoGuia.tipo_veiculo = this.veiculoGuias[0].tipo_veiculo;
          this.veiculoGuia.ano_fab = this.veiculoGuias[0].ano_fab;
          console.log('dataVeiculo', this.veiculoGuias);
        }

        //Assign placa searched
        //this.veiculoGuias[0].placa = this.veiculoGuia.placa;

        // console.log('this.veiculos:', this.veiculos);

      });
  }
  consultarExamReq() {
    this.sendRequest('spConsultaExameItem', {
      StatusCRUD: 'READ',
      formValues: ' '
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      for (let i = 0; i < results.length; i++) {
        if (results[i].Applicado == 'Veiculo') {
          this.tempArray.push(results[i]);
        }
      }
      this.examesItems = this.tempArray.map(function callback(value) {
        let exame = new ExameItem();
        exame.CODIGO = value.CODIGO;
        exame.nome_de_exame = value.nome_de_exame;
        return exame;
      });
      console.log('VEICULO', this.examesItems.length)
    });
    this.tempArray = [];
  }
  GetExame(item: any) {
    console.log('codigo exam', item)
    for (let index = 0; index < this.examesItems.length; index++) {
      if (this.examesItems[index].CODIGO == item) {
        this.arrayExames.push(this.examesItems[index]);
        this.examesItems.splice(index, 1)
      }
    }
  }
  deleteExame(i: any, abc: any) {
    if (this.arrayExames[i].turmaaluo_id) {
      //this.saveSmallForm(AlunoPage.CRUD_APAGAR, null, this.turmaalumnoarray[i].turmaaluo_id);
    }

    this.examesItems.push(this.arrayExames[i]);

    console.log('the index value', i)
    this.arrayExames.splice(i, 1);
    console.log('new data', this.arrayExames)
  }
  incluirExames() {
    this.salvarExames(this.veiculoGuia.codigo, this.veiculoGuia.numguia);
  }
  salvarExames(codigoVeiculo: any, numguia: any) {

    this.arrayExames.forEach(element => {
      element.codigoVeiculo = codigoVeiculo;
      element.numguia = numguia;
      console.log('array gravar:', element)
      this.sendRequest('spVeiculoGuia', {
        StatusCRUD: 'CREATE_EXAME',
        formValues: element,
      }, (resultado) => { });
    });
    this.arrayExames = [];
    // this.goBack();
  }
  updateExames(codigoVeiculo: any, numguia: any) {
    this.sendRequest('spVeiculoGuia', {
      StatusCRUD: 'DELETE_EXAMES',
      formValues: { codigoVeiculo: codigoVeiculo, numguia: this.veiculoGuia.numguia }
    }, (resultado) => {
      this.arrayExames.forEach(element => {
        element.codigoVeiculo = codigoVeiculo;
        element.numguia = numguia;
        console.log('array gravar:', element)
        this.sendRequest('spVeiculoGuia', {
          StatusCRUD: 'CREATE_EXAME',
          formValues: element
        }, (resultado) => { });
      });
      this.arrayExames = [];
      // this.goBack();
    });

  }
  readExames() {
    console.log('cod to read exames', this.veiculoGuia.codigo);
    this.sendRequest('spVeiculoGuia', {
      StatusCRUD: 'READ_EXAM_ONE',
      formValues: { codigoVeiculo: this.veiculoGuia.codigo }
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.arrayExames = results;
      console.log('read Exames:', results)
      this.fixSelect(this.arrayExames);
    });
  }
  fixSelect(arrayExames: any) {
    if (arrayExames.length > 0) {
      for (let j = 0; j < this.arrayExames.length; j++) {
        for (let index = 0; index < this.examesItems.length; index++) {
          if (this.examesItems[index].CODIGO == this.arrayExames[j].id_exame) {
            this.examesItems.splice(index, 1)
          }
        }
      }
    }
    console.log('After select', this.examesItems)
  }
  consultarTipoLocal() {
    this.sendRequest('spConsultaTipolocal', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.tipolocales = results.map(function callback(value) {
        let tipoL = new TipoLocal();
        tipoL.codigo = value.codigo;
        tipoL.tipo_local = value.tipo_local;
        return tipoL;
      });
      console.log("tipolocal", this.tipolocales)
    });
  }


}
