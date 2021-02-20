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
import { VeiculoGuia } from 'src/app/models/veiculo-guia';
import { OutrosObjetos } from 'src/app/models/outros-objetos';
import { TipoObjeto } from 'src/app/models/tipo-objeto';
import { UnidadeMedida } from 'src/app/models/unidade-medida';
import { TipoDroga } from 'src/app/models/tipo_droga';
import { DrogaModel } from 'src/app/models/drogas';
import { TipoLocal } from 'src/app/models/tipo-local';
import { ExameItem } from 'src/app/models/exame-item';

@Component({
  selector: 'app-drogas',
  templateUrl: './drogas.page.html',
  styleUrls: ['./drogas.page.scss'],
})
export class DrogasPage implements OnInit {

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
  public droga = new DrogaModel();
  public drogas: Array<DrogaModel> = [];
  public unidades: Array<UnidadeMedida> = [];
  public opcaoEditar: boolean = false;
  public opcaoIncluir: boolean = false;

  public tempArray: Array<any> = [];
  public arrayExames: Array<any> = [];
  
  public tipoObjetos: Array<TipoObjeto> = [];
  public tipolocales: Array<TipoLocal> = [];
  public examesItems: Array<ExameItem> = []
  public tiposDrogas : Array<TipoDroga> = [];


  public subtitle = 'Drogas';
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
    this.getTipoDrogas();
    this.getUnidade();
    
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.droga.codigoDroga = data.codigoDroga;
        this.droga.numguia= data.codigoGuia;
        console.log("numguia", this.droga.numguia);
        if (this.droga.codigoDroga) {
          this.CRUDDrogas(DrogasPage.CRUD_READ);
          this.readExames();
          this.activateButton=false;
        }
      });
      
  }
  getTipoDrogas() {
    this.sendRequest('spConsultaTipoDrogas', {
      StatusCRUD: 'READ',
      formValues: '',
    }, (resultado) => {
      this.tiposDrogas = JSON.parse(atob(resultado.results));
      console.log('outros',this.tiposDrogas);


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
  
  save(form: NgForm) {
 
    this.activateButton = false;
 //Custom Validation, you can create a function to validate it
 

 if (this.droga.codigoDroga) {
   //ADD CODIGO TO UPDATE 


   console.log('UPDATE')
   console.log(this.droga.codigoDroga);
   console.log(this.droga.numguia);
   this.droga.usuario=this.Authorizer.CodigoUsuarioSistema;
   this.CRUDDrogas(DrogasPage.CRUD_UPDATE);
   
 }
 else {
   this.droga.usuario=this.Authorizer.CodigoUsuarioSistema;
   this.CRUDDrogas(DrogasPage.CRUD_CREATE);
 

 }
 
 this.router.navigate(['/menu/objetos-pericia',this.droga.numguia]);
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
  
  private CRUDDrogas(_statusCRUD) {
    
    this.sendRequest('spDroga', {
      StatusCRUD: _statusCRUD,
      formValues: this.droga
    }, (resultado) => {

      switch (_statusCRUD) {
        case DrogasPage.CRUD_CREATE:
         // this.router.navigate(['/menu/exame-laboratorial-legal']);
         this.droga.codigoDroga=JSON.parse(atob(resultado.results))[0].codigo;
         this.salvarExames(this.droga.codigoDroga,this.droga.numguia);
          console.log('data guia droga', this.droga.codigoDroga)


          break;
        case DrogasPage.CRUD_READ:

 
          this.droga.numguia = JSON.parse(atob(resultado.results))[0].numguia;
          this.droga.tipo_local = Number(JSON.parse(atob(resultado.results))[0].tipo_local);
          this.droga.tipo_droga = Number(JSON.parse(atob(resultado.results))[0].tipo_droga);
          this.droga.unidade_medida = Number(JSON.parse(atob(resultado.results))[0].unidade_medida);
          this.droga.quantidade = JSON.parse(atob(resultado.results))[0].quantidade;
          this.droga.descricao = JSON.parse(atob(resultado.results))[0].descricao;
          this.droga.descricao_local = JSON.parse(atob(resultado.results))[0].descricao_local;
          this.droga.quesitacoes = JSON.parse(atob(resultado.results))[0].quesitacoes;
          this.droga.usuario = JSON.parse(atob(resultado.results))[0].usuario;


          break;
        case DrogasPage.CRUD_UPDATE:
          this.updateExames(this.droga.codigoDroga,this.droga.numguia);
          this.router.navigate(['/menu/objetos-pericia',this.droga.numguia]);
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
        if (results[i].Applicado == 'Drogas') {
          this.tempArray.push(results[i]);
        }
      }
      this.examesItems = this.tempArray.map(function callback(value) {
        let exame = new ExameItem();
        exame.CODIGO = value.CODIGO;
        exame.nome_de_exame = value.nome_de_exame;
        return exame;
      });
      console.log('Droga', this.examesItems.length)
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
    this.salvarExames(this.droga.codigoDroga,this.droga.numguia);
  }
  salvarExames(codigoDrogaExame: any, numguia:any) {
    this.arrayExames.forEach(element => {
      element.codigoDrogaExame = codigoDrogaExame;
      element.numguia=numguia;
      console.log('array gravar:', element)
      this.sendRequest('spDroga', {
        StatusCRUD: 'CREATE_EXAME',
        formValues: element,
      }, (resultado) => { });
    });
    this.arrayExames = [];
   // this.goBack();
  }
  updateExames(codigoDrogaExame: any, numguia:any) {
    this.sendRequest('spDroga', {
      StatusCRUD: 'DELETE_EXAMES',
      formValues: { codigoDrogaExame: codigoDrogaExame, numguia: this.droga.numguia }
    }, (resultado) => {
      this.arrayExames.forEach(element => {
        element.codigoDrogaExame = codigoDrogaExame;
        element.numguia = numguia;
        console.log('array gravar:', element)
        this.sendRequest('spDroga', {
          StatusCRUD: 'CREATE_EXAME',
          formValues: element
        }, (resultado) => { });
      });
      this.arrayExames = [];
     // this.goBack();
    });

  }
  readExames() {
    console.log('cod to read exames', this.droga.codigoDroga);
    this.sendRequest('spDroga', {
      StatusCRUD: 'READ_EXAM_ONE',
      formValues: { codigoDrogaExame: this.droga.codigoDroga }
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
