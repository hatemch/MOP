import { Component, OnInit } from '@angular/core';
//SERVICES
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { Router, ActivatedRoute } from '@angular/router';
//MODULES
import { TipoObjeto } from 'src/app/models/tipo-objeto';
import { OutrasPericias } from 'src/app/models/outra-pericia';
import { TipoLocal } from 'src/app/models/tipo-local';
import { ExameItem } from 'src/app/models/exame-item';

@Component({
  selector: 'app-incluir-outras-pericias',
  templateUrl: './incluir-outras-pericias.page.html',
  styleUrls: ['./incluir-outras-pericias.page.scss'],
})
export class IncluirOutrasPericiasPage implements OnInit {

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  };

  static CRUD_READ_ONE: string = 'READ_ONE';
  static CRUD_READ_EXAM_ONE: string = 'READ_EXAM_ONE';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_NOVO_EXAME: string = 'NOVO_EXAME';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';

  private APP_NAME: string = this.env.AppName;

  public opcaoEditar: boolean = false;
  public opcaoIncluir: boolean = false;

  public tempArray: Array<any> = [];
  public arrayExames: Array<any> = [];

  public tipoObjetos: Array<TipoObjeto> = [];
  public tipolocales: Array<TipoLocal> = [];
  public examesItems: Array<ExameItem> = [];

  public outraPericia = new OutrasPericias;
  public outrasPericias: Array<OutrasPericias> = [];

  constructor(
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {

    this.consultarTipo();
    this.consultarTipoLocal();
    this.consultarExamReq();

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.outraPericia.numguia = data.numguia;
        this.outraPericia.codigo = data.codigo;
        this.outraPericia.tipo_guia=data.tipoGuia;
        if (this.outraPericia.codigo) {
          if (data.opcao == "1") { //EDITAR
            this.opcaoEditar = true;
            this.opcaoIncluir = false;
            this.CRUDOutrasPericias(IncluirOutrasPericiasPage.CRUD_READ_ONE);
            this.readExames();
          } else {//incluir = 2
            this.opcaoIncluir = true;
            this.opcaoEditar = false;
            this.CRUDOutrasPericias(IncluirOutrasPericiasPage.CRUD_READ_ONE);
            console.log('to inserir', this.outraPericia)
          }
        }
      });
  }

  /* ======= SELECT TIPO ============================================================== */
  consultarTipo() {
    this.sendRequest('spConsultaTipoObjeto', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.tipoObjetos = results.map(function callback(value) {
        let tipoO = new TipoObjeto();
        tipoO.idTipoObjeto = value.idTipoObjeto;
        tipoO.descricao = value.descricao;
        return tipoO;
      });
      console.log('tipo Ob', this.tipoObjetos);

    });
  }
  /* ======= END SELECT TIPO ============================================================== */

  /* ======= SELECT TIPO LOCAL ============================================================== */
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
  /* ======= END SELECT TIPO LOCAL ============================================================== */

  /* ======= SELECT EXAMES REQUISITADOS ============================================================== */
  consultarExamReq() {
    this.sendRequest('spConsultaExameItem', {
      StatusCRUD: 'READ',
      formValues: ' '
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      for (let i = 0; i < results.length; i++) {
        if (results[i].Applicado == 'Periciando') {
          this.tempArray.push(results[i]);
        }
      }
      this.examesItems = this.tempArray.map(function callback(value) {
        let exame = new ExameItem();
        exame.CODIGO = value.CODIGO;
        exame.nome_de_exame = value.nome_de_exame;
        return exame;
      });
      console.log('Periciando', this.examesItems.length)
    });
    this.tempArray = [];
  }
  /* ======= END SELECT EXAMES REQUISITADOS ============================================================== */
  /* =======  EXAMES REQUISITADOS ============================================================== */
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
  /* ======= END EXAMES REQUISITADOS ============================================================== */

  incluirOutrasP() {
    if (this.arrayExames.length > 0) {
      if (this.outraPericia.codigo) {
        this.CRUDOutrasPericias(IncluirOutrasPericiasPage.CRUD_UPDATE);
      } else {
        console.log('to save', this.outraPericia)
        this.CRUDOutrasPericias(IncluirOutrasPericiasPage.CRUD_CREATE);
      }
    } else { this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Faltam Exames Requisitados' }); }

  }

  incluirExames() {
    this.salvarExames(this.outraPericia.codigo,this.outraPericia.numguia);
  }

  /* ======= CRUD OUTRAS PERICIAS ============================================================== */
  private CRUDOutrasPericias(_statusCRUD: any) {

    this.sendRequest('spOutrasPericias', {
      StatusCRUD: _statusCRUD,
      formValues: this.outraPericia
    }, (resultado) => {

      switch (_statusCRUD) {
        case IncluirOutrasPericiasPage.CRUD_READ_ONE:
          let results = JSON.parse(atob(resultado.results));
          this.outraPericia.codigo = results[0].codigo;
          this.outraPericia.descricao = results[0].descricao;
          this.outraPericia.estatura = results[0].estatura;
          this.outraPericia.idade = results[0].idade;
          this.outraPericia.nome_tipo = results[0].nome_tipo;
          this.outraPericia.numguia = results[0].numguia;
          this.outraPericia.peso = results[0].peso;
          this.outraPericia.tipo = Number(results[0].tipo);
          if (!this.opcaoIncluir) {
            this.outraPericia.tipo_local = Number(results[0].tipo_local);
            this.outraPericia.descricao_do_local = results[0].descricao_do_local;
            this.outraPericia.quesitaces = results[0].quesitaces;
          } else {
            this.outraPericia.tipo_local = '';
            this.outraPericia.descricao_do_local = '';
            this.outraPericia.quesitaces = '';
          }
          console.log('resultado read:', results)
          break;
        case IncluirOutrasPericiasPage.CRUD_CREATE:
          let resultscreate = JSON.parse(atob(resultado.results));
          this.outraPericia.codigo = resultscreate[0].codigo;
          this.salvarExames(this.outraPericia.codigo,this.outraPericia.numguia);
          break;
        case IncluirOutrasPericiasPage.CRUD_UPDATE:
          let resultsupdate = JSON.parse(atob(resultado.results));
          this.outraPericia.codigo = resultsupdate[0].codigo;
          
          this.updateExames(this.outraPericia.codigo,this.outraPericia.numguia);
          break;

        default:
          break;
      }
    });
  }

  salvarExames(CodigoOutraPericia: any,numGuia:any) {
    this.arrayExames.forEach(element => {
      element.codigoOutrasPericias = CodigoOutraPericia;
      element.numguia=numGuia;
      console.log('array gravar:', element)
      this.sendRequest('spOutrasPericias', {
        StatusCRUD: 'CREATE_EXAME',
        formValues: element
      }, (resultado) => { });
    });
    this.arrayExames = [];
    this.goBack();
  }

  updateExames(CodigoOutraPericia: any,numGuia:any) {
    this.sendRequest('spOutrasPericias', {
      StatusCRUD: 'DELETE_EXAMES',
      formValues: { codigoOutrasPericias: CodigoOutraPericia }
    }, (resultado) => {
      this.arrayExames.forEach(element => {
        
        element.codigoOutrasPericias = CodigoOutraPericia;
        element.numguia=numGuia;
        console.log('array gravar:', element)
        this.sendRequest('spOutrasPericias', {
          StatusCRUD: 'CREATE_EXAME',
          formValues: element
        }, (resultado) => { });
      });
      this.arrayExames = [];
      this.goBack();
    });

  }

  readExames() {
    console.log('cod to read exames', this.outraPericia.codigo);
    this.sendRequest('spOutrasPericias', {
      StatusCRUD: 'READ_EXAM_ONE',
      formValues: { codigoOutrasPericias: this.outraPericia.codigo }
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

  /* ======= END CRUD OUTRAS PERICIAS ============================================================== */

  /* ======= SEND REQUEST ============================================================== */
  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD === 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'CREATE_EXAME') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'NOVO_EXAME') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'READ_ONE') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'READ_EXAM_ONE') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
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
    console.log("tipoGuia",this.outraPericia.tipo_guia)
   this.router.navigate(['/menu/outras-pericias', this.outraPericia.numguia,this.outraPericia.tipo_guia]);
    
  }

  /* ======= END SEND REQUEST ============================================================== */

}

/* 9L */
