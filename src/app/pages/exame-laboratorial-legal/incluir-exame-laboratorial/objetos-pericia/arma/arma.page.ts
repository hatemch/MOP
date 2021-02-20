import { Component, OnInit } from '@angular/core';
import { NavController, AlertController,ModalController } from '@ionic/angular';
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

import { ArmaModel } from 'src/app/models/armas';
import { TipoArma } from 'src/app/models/tipo_arma';
import { TipoObjeto } from 'src/app/models/tipo-objeto';
import { TipoLocal } from 'src/app/models/tipo-local';
import { ExameItem } from 'src/app/models/exame-item';

@Component({
  selector: 'app-arma',
  templateUrl: './arma.page.html',
  styleUrls: ['./arma.page.scss'],
})
export class ArmaPage implements OnInit {

 
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
  public arma = new ArmaModel();
  public armas: Array<ArmaModel> = [];
  public opcaoEditar: boolean = false;
  public opcaoIncluir: boolean = false;

  public tempArray: Array<any> = [];
  public arrayExames: Array<any> = [];
  public tiposArmas : Array<TipoArma> = [];
  public tipoObjetos: Array<TipoObjeto> = [];
  public tipolocales: Array<TipoLocal> = [];
  public examesItems: Array<ExameItem> = [];


  public subtitle = 'Armas de Fogo';
  public flagForm: boolean = false;
  public activateButton  = true;

  constructor(  private navCtrl: NavController,
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
    this.getTipoArmas();
    

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.arma.numguia = data.codigoGuia;
        this.arma.codigoArma = data.codigoArma;
      
        if (this.arma.codigoArma) {
          this.CRUDArmas(ArmaPage.CRUD_READ);
          this.readExames();
          this.activateButton=false;
          
        }
      });
      
  }

  getTipoArmas() {
    this.sendRequest('spConsultaTipoArmas', {
      StatusCRUD: 'READ',
      formValues: '',
    }, (resultado) => {
      this.tiposArmas = JSON.parse(atob(resultado.results));
      console.log('armas',this.tiposArmas);


    });

  }
   
  save(form: NgForm) {
    if (this.arrayExames.length > 0){
      if (this.arma.codigoArma) {
        //ADD CODIGO TO UPDATE 
     
     
        console.log('UPDATE')
        console.log(this.arma.codigoArma);
       
        this.arma.usuario=this.Authorizer.CodigoUsuarioSistema;
        this.CRUDArmas(ArmaPage.CRUD_UPDATE);
        
      } else {
        console.log(this.arma.numguia);
         this.arma.usuario=this.Authorizer.CodigoUsuarioSistema;
         this.CRUDArmas(ArmaPage.CRUD_CREATE);
       
      
       }
    } else {
      this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Faltam Exames Requisitados' });
      return;
    }
    if(this.arma.tipo_arma==null ||this.arma.tipo_arma.toString()=='')
    {
      this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Selecione o tipo de arma' });
      return;
    }
 this.router.navigate(['/menu/objetos-pericia',this.arma.numguia]);

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
  goBack() {
    this.navCtrl.back();
  }
  
  private CRUDArmas(_statusCRUD) {
    
    this.sendRequest('spArmaFogo', {
      StatusCRUD: _statusCRUD,
      formValues: this.arma
    }, (resultado) => {

      switch (_statusCRUD) {
        case ArmaPage.CRUD_CREATE:
         // this.router.navigate(['/menu/exame-laboratorial-legal']);
         this.arma.codigoArma=JSON.parse(atob(resultado.results))[0].codigo;
         this.salvarExames(this.arma.codigoArma,this.arma.numguia);
          console.log('data guia arma', this.arma.codigoArma)


          break;
        case ArmaPage.CRUD_READ:

 
          this.arma.numguia = JSON.parse(atob(resultado.results))[0].numguia;
          this.arma.tipo_local = Number(JSON.parse(atob(resultado.results))[0].tipo_local);
          this.arma.tipo_arma = Number(JSON.parse(atob(resultado.results))[0].tipo_arma);
          this.arma.marca = JSON.parse(atob(resultado.results))[0].marca;
          this.arma.serie = JSON.parse(atob(resultado.results))[0].serie;
          this.arma.calibre = JSON.parse(atob(resultado.results))[0].calibre;
          this.arma.descricao = JSON.parse(atob(resultado.results))[0].descricao;
          this.arma.descricao_local=JSON.parse(atob(resultado.results))[0].descricao_local;
          this.arma.quesitacoes = JSON.parse(atob(resultado.results))[0].quesitacoes;
          this.arma.usuario = JSON.parse(atob(resultado.results))[0].usuario;


          break;
        case ArmaPage.CRUD_UPDATE:
          this.updateExames(this.arma.codigoArma,this.arma.numguia);
          this.router.navigate(['/menu/objetos-pericia',this.arma.numguia]);
          break;

        default:
          break;
      }
    });
  }
  consultarExamReq() {
    this.sendRequest('spConsultaExameItem', {
      StatusCRUD: 'READ',
      formValues: ' '
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      for (let i = 0; i < results.length; i++) {
        if (results[i].Applicado == 'Arma de Fogo') {
          this.tempArray.push(results[i]);
        }
      }
      this.examesItems = this.tempArray.map(function callback(value) {
        let exame = new ExameItem();
        exame.CODIGO = value.CODIGO;
        exame.nome_de_exame = value.nome_de_exame;
        return exame;
      });
      console.log('Arma', this.examesItems.length)
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
    this.salvarExames(this.arma.codigoArma,this.arma.numguia);
  }
  salvarExames(codigoArmaExame: any, numguia:any) {
    this.arrayExames.forEach(element => {
      element.codigoArmaExame = codigoArmaExame;
      element.numguia=numguia;
      console.log('array gravar:', element)
      this.sendRequest('spArmaFogo', {
        StatusCRUD: 'CREATE_EXAME',
        formValues: element,
      }, (resultado) => { });
    });
    this.arrayExames = [];
   // this.goBack();
  }
  updateExames(codigoArmaExame: any, numguia:any) {
    this.sendRequest('spArmaFogo', {
      StatusCRUD: 'DELETE_EXAMES',
      formValues: { codigoArmaExame: codigoArmaExame, numguia: this.arma.numguia }
    }, (resultado) => {
      this.arrayExames.forEach(element => {
        element.codigoArmaExame = codigoArmaExame;
        element.numguia = numguia;
        console.log('array gravar:', element)
        this.sendRequest('spArmaFogo', {
          StatusCRUD: 'CREATE_EXAME',
          formValues: element
        }, (resultado) => { });
      });
      this.arrayExames = [];
     // this.goBack();
    });

  }
  readExames() {
    console.log('cod to read exames', this.arma.codigoArma);
    this.sendRequest('spArmaFogo', {
      StatusCRUD: 'READ_EXAM_ONE',
      formValues: { codigoArmaExame: this.arma.codigoArma }
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
      console.log("tipolocal",this.tipolocales)
    });
  }

}
