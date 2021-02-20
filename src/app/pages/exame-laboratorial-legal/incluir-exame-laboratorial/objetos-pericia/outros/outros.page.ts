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
import { GuiaPericia } from 'src/app/models/guia-pericia';
import { Grupo } from 'src/app/models/grupo';
import { BuscarOcorrenciaPage } from 'src/app/pages/exame-medico-legal/buscar-ocorrencia/buscar-ocorrencia.page';

import { OutrosObjetos } from 'src/app/models/outros-objetos';
import { TipoLocal } from 'src/app/models/tipo-local';
import { ExameItem } from 'src/app/models/exame-item';
import { UnidadeMedida } from 'src/app/models/unidade-medida';

@Component({
  selector: 'app-outros',
  templateUrl: './outros.page.html',
  styleUrls: ['./outros.page.scss'],
})
export class OutrosPage implements OnInit {

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


  public subtitle = 'Outros Objetos';
  public flagForm: boolean = false;
  public tiposObjetos: Array<OutrosObjetos> = [];
  public unidades: Array<UnidadeMedida> = [];

  public opcaoEditar: boolean = false;
  public opcaoIncluir: boolean = false;

  public tempArray: Array<any> = [];
  public arrayExames: Array<any> = [];
  
  
  public tipolocales: Array<TipoLocal> = [];
  public examesItems: Array<ExameItem> = []
  public outroObjeto = new OutrosObjetos();
  public outrosObjetos: Array<OutrosObjetos> = [];
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
    this.getOutrosObjetos();
    this.getUnidade();
    
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.outroObjeto.numguia = data.codigoGuia;
        this.outroObjeto.codigoObjeto= data.codigoOutros;
        console.log("numguia", this.outroObjeto.numguia);
        if (this.outroObjeto.codigoObjeto) {
          this.CRUDOutrosObjetos(OutrosPage.CRUD_READ);
          this.readExames();
          this.activateButton=false;
        }
      });
     
  }

  getOutrosObjetos() {
    this.sendRequest('spConsultaOutrosObjetos', {
      StatusCRUD: 'READ',
      formValues: '',
    }, (resultado) => {
      this.tiposObjetos = JSON.parse(atob(resultado.results));
      console.log('outros',this.tiposObjetos);


    });

  }

  getUnidade() {
    this.sendRequest('spConsultaUnidadeMedida', {
      StatusCRUD: 'READ',
      formValues: '',
    }, (resultado) => {
      this.unidades = JSON.parse(atob(resultado.results));
      console.log('unidades',this.unidades);


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
  goBack() {
    this.navCtrl.back();
  }

  save(form: NgForm) {
    if (this.arrayExames.length > 0){
      if (this.outroObjeto.codigoObjeto) {
        //ADD CODIGO TO UPDATE 
  
  
        console.log('UPDATE')
        console.log(this.outroObjeto.codigoObjeto);
        console.log(this.outroObjeto.numguia);
        this.outroObjeto.usuario=this.Authorizer.CodigoUsuarioSistema;
        this.CRUDOutrosObjetos(OutrosPage.CRUD_UPDATE);
        
      }
      else {
        this.outroObjeto.usuario=this.Authorizer.CodigoUsuarioSistema;
        this.CRUDOutrosObjetos(OutrosPage.CRUD_CREATE);
      
  
      }
    }else {
      this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Faltam Exames Requisitados' });
      return;
    }
       this.activateButton = false;
    //Custom Validation, you can create a function to validate it
    

    
    
    this.router.navigate(['/menu/objetos-pericia',this.outroObjeto.numguia]);

  }
  /* ===== END SAVE NEW/CHANGES =============================================================================== */


  /* ===== CRUD MODULE USERS =============================================================================== */
  private CRUDOutrosObjetos(_statusCRUD) {
    
    this.sendRequest('spOutrosGuia', {
      StatusCRUD: _statusCRUD,
      formValues: this.outroObjeto
    }, (resultado) => {

      switch (_statusCRUD) {
        case OutrosPage.CRUD_CREATE:
         // this.router.navigate(['/menu/exame-laboratorial-legal']);
         this.outroObjeto.codigoObjeto=JSON.parse(atob(resultado.results))[0].codigo;
         this.salvarExames(this.outroObjeto.codigoObjeto,this.outroObjeto.numguia);
          console.log('data guia', this.outroObjeto.codigoObjeto)


          break;
        case OutrosPage.CRUD_READ:

 
          this.outroObjeto.numguia = JSON.parse(atob(resultado.results))[0].numguia;
          this.outroObjeto.tipo_local = Number(JSON.parse(atob(resultado.results))[0].tipo_local);
          this.outroObjeto.tipo_objeto = Number(JSON.parse(atob(resultado.results))[0].tipo_objeto);
          this.outroObjeto.unidade_medida = Number(JSON.parse(atob(resultado.results))[0].unidade_medida);
          this.outroObjeto.quantidade = JSON.parse(atob(resultado.results))[0].quantidade;
          this.outroObjeto.descricao = JSON.parse(atob(resultado.results))[0].descricao;
          this.outroObjeto.descricao_local = JSON.parse(atob(resultado.results))[0].descricao_local;
          this.outroObjeto.quesitacoes = JSON.parse(atob(resultado.results))[0].quesitacoes;
          this.outroObjeto.usuario = JSON.parse(atob(resultado.results))[0].usuario;


          break;
        case OutrosPage.CRUD_UPDATE:
          this.updateExames(this.outroObjeto.codigoObjeto,this.outroObjeto.numguia);
          this.router.navigate(['/menu/objetos-pericia',this.outroObjeto.numguia]);
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
        if (results[i].Applicado == 'Outros Objetos') {
          this.tempArray.push(results[i]);
        }
      }
      this.examesItems = this.tempArray.map(function callback(value) {
        let exame = new ExameItem();
        exame.CODIGO = value.CODIGO;
        exame.nome_de_exame = value.nome_de_exame;
        return exame;
      });
      console.log('Outros Objetos', this.examesItems.length)
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
    this.salvarExames(this.outroObjeto.codigoObjeto,this.outroObjeto.numguia);
  }
  salvarExames(codigoOutroObjetoExame: any, numguia:any) {
    this.arrayExames.forEach(element => {
      element.codigoOutroObjetoExame = codigoOutroObjetoExame;
      element.numguia=numguia;
      console.log('array gravar:', element)
      this.sendRequest('spOutrosGuia', {
        StatusCRUD: 'CREATE_EXAME',
        formValues: element,
      }, (resultado) => { });
    });
    this.arrayExames = [];
   // this.goBack();
  }
  updateExames(codigoOutroObjetoExame: any, numguia:any) {
    this.sendRequest('spOutrosGuia', {
      StatusCRUD: 'DELETE_EXAMES',
      formValues: { codigoOutroObjetoExame: codigoOutroObjetoExame, numguia: this.outroObjeto.numguia }
    }, (resultado) => {
      this.arrayExames.forEach(element => {
        element.codigoOutroObjetoExame = codigoOutroObjetoExame;
        element.numguia = numguia;
        console.log('array gravar:', element)
        this.sendRequest('spOutrosGuia', {
          StatusCRUD: 'CREATE_EXAME',
          formValues: element
        }, (resultado) => { });
      });
      this.arrayExames = [];
     // this.goBack();
    });

  }
  readExames() {
    console.log('cod to read exames', this.outroObjeto.codigoObjeto);
    this.sendRequest('spOutrosGuia', {
      StatusCRUD: 'READ_EXAM_ONE',
      formValues: { codigoOutroObjetoExame: this.outroObjeto.codigoObjeto }
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
