import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
//SERVICES
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { ValidationsService } from 'src/app/services/validations.service';
//MODELS
import { Segmento } from '../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';
import { Uso } from 'src/app/models/uso';


@Component({
  selector: 'app-uso',
  templateUrl: './uso.page.html',
  styleUrls: ['./uso.page.scss'],
})
export class UsoPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  public showTable: boolean = false;
  public showTablesemuso: boolean = false;
  public ShowUrl: boolean = false;
  public bottomExcelHTML: boolean = false;

  public HidePrice: boolean = false;

  static APP_NAME: string = EnvService.name;
  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public usos: Array<Uso> = [];
  public uso = new Uso();

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];
  public user = new User();
  public data: any[];

  public htmlString: any;
  public fileUrl: any;


  constructor(
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private validations: ValidationsService,
    private router: Router,
    private domSanitizer: DomSanitizer,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();
    this.getSegmentos();
    this.showTable = false;
    this.showTablesemuso = false;
  }
  private getSegmentos() {
    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.segmento;
        segmento.segmento = value.segmento;
        return segmento;
      });

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
      }
      console.log('segmentos', this.segmentos);

    });
  }
  CarregaSegmentoGrupos() {
    console.log(this.uso.segmento);
    this.grupos = [];
    this.uso.Grupo = "";
    this.consultarGruposSegmento(this.uso.segmento);
  }
  private consultarGruposSegmento(segmento: string) {
    if (!segmento) {
      this.grupos = [];
      return;
    }
    else {
      this.sendRequest('spConsultarGruposSegmento', {
        StatusCRUD: 'READ',
        formValues: { 'segmento': segmento }
      }, (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        console.log('grupos', results);

        this.grupos = results.map(function callback(value) {
          let grupo = new Grupo();
          grupo.codigo = value.CODIGO;
          grupo.nome = value.NOME;
          return grupo;
        });

        if (this.grupos.length > 1) {
          let grupo = new Grupo();
          grupo.codigo = 'TODOS';
          grupo.nome = 'TODOS';
          this.grupos.unshift(grupo);
        }
      });
    }
  }


  /*  CarregaSegmentoGrupoUsuarios()
   {
     this.consultarUsuarioGrupo(this.user.grupo);
   }
   private consultarUsuarioGrupo(grupo: string) {
     this.sendRequest('spConsultarUsuarioGrupo', {
       StatusCRUD: 'READ',
       formValues: {'grupo': grupo}
     }, (resultado) => {
       let results = JSON.parse(atob(resultado.results));  
       this.users = results.map(function callback(value) {
         let user = new User();
         user.codigo = value.CODIGO;
         user.nome = value.NOME;
 
         return user;
       });
 
       console.log('users',  this.users  );
 
     });
   } */

  cargarTable(form: NgForm, exportExcel : string) {
    if(form.value.Segmento=="TODOS")form.value.Segmento="";
    if(form.value.Grupo=="TODOS")form.value.Grupo="";
    this.ShowUrl = false;
    this.GetTableData(form, exportExcel);
  }

  htmlLoad(form: NgForm) {
    console.log('archivo excel', form.value.formato);
    this.ShowUrl = true;
    this.exportarHTML(form);
  }
  excelLoad(form: NgForm) {
    console.log('archivo excel', form.value.formato)
    this.exportarExcel(form);
  }

  private GetTableData(form: NgForm, exportExcel : string) {
    this.alertService.loaderPresent();
    this.sendRequest('spUso', {
      StatusCRUD: 'READ',
      formValues: form.value
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.usos = results.map(function callback(value) {
        let uso = new Uso();
        // uso.codigo = value.codigo;
        // uso.usuario = value.NOME;
        uso.data = value.DATA.substring(8, 10) + '/' + value.DATA.substring(5, 7) + '/' + value.DATA.substring(0, 4) + ' ' + value.DATA.substring(11, 19);
        uso.nomeUsuario = value.NomeUsuario;
        uso.segmento = value.SEGMENTO;
        uso.nomeGrupo = value.NOMEGRUPO;
        uso.tipo = value.TIPO;
        if(uso.tipo = "Veiculo"){
          uso.tipo = "Veículo"
        }
        uso.origem = value.ORIGEM;
        uso.imei = value.IMEI;
        return uso;
      });

      
      
      this.bottomExcelHTML = true;
      if (form.value.semuso == true) { this.showTable = false; this.showTablesemuso = true }
      else { this.showTable = true; this.showTablesemuso = false; }
      if (this.usos.length == 0) {
        this.alertService.loaderDismiss();
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        this.bottomExcelHTML = false;
      } else {
        if(exportExcel)
        {
          this.Authorizer.convertToExcel(this.usos, "uso_de_devices");
        }
        this.alertService.loaderDismiss(); 
      }

    });
  }


  public exportarHTML(form: NgForm) {

    const path = 'uso_device/';
    const nomearquivo = 'Uso de Devices';

    this.alertService.loaderPresent();
    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (this.permissoes.Pesquisar > 0) {

        const _params = {
          StatusCRUD: 'READ',
          formValues: form.value,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProcExportHtml('ExportarHTML', 'spUso', _params, path, nomearquivo).then((res: string) => {
          const resultado = res.split(';');
          if (resultado[0] === 'ok') {
            this.htmlString = resultado[1];
            //console.log('html format', this.htmlString)
            // const blob = new Blob([this.htmlString], { type: 'text/html' });
            // this.fileUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
            let date = new Date();
            //Download the file as CSV
            var downloadLink = document.createElement("a");
            var blob = new Blob([this.htmlString], { type: 'text/html' });
            // var blob = new Blob(["\ufeff", csv, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' }]);
            var url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.download =  'uso_de_devices-' + date.toLocaleDateString() + ".html";  //Name the file here
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            this.alertService.loaderDismiss();
          } else {
            this.alertService.presentAlert({
              pTitle: 'ERRO', pSubtitle: UsoPage.APP_NAME, pMessage: 'Falha ao fazer o arquivo'
            });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: UsoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack();
    }
  }


  public exportarExcel(form: NgForm) {

    const path = 'uso_device/';

    const nomearquivo = path.substring(0, path.length - 1) + Date.now().toString();

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (this.permissoes.Pesquisar > 0) {

        const _params = {
          StatusCRUD: 'READ',
          formValues: form.value,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProcExportData('ExportarXls', 'spUso', _params, path, nomearquivo).then((res: string) => {
          const resultado = res.split(';');
          if (resultado[0] === 'ok') {
            window.open(this.env.API_HOST + this.env.NAME_HOST + path + resultado[1]);
          } else {
            this.alertService.presentAlert({
              pTitle: 'ERRO', pSubtitle: UsoPage.APP_NAME, pMessage: 'Falha ao fazer o arquivo'
            });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: UsoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack();
    }
  }

  numberOnlyValidation(event: any) {
    this.validations.numberOnlyValidation(event)
  }

  // NEEDED FUNCTIONS
  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    })

    if (permissaoModulo.length === 1) {
      this.permissoes = {
        Route: permissaoModulo[0].Route,
        Pesquisar: permissaoModulo[0].Pesquisar,
        Inserir: permissaoModulo[0].Inserir,
        Editar: permissaoModulo[0].Editar,
        Deletar: permissaoModulo[0].Deletar
      };
    } else {
      console.log('Houve um problema nas permissoes do modulo: ', this.router.url);
    }
  }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/93']);
  }

  /**
   * Autor: Lina Jimenez 
   * Data: 04/12/2019
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
        ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || (procedure === 'spUso')
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
              this.alertService.showLoader(resultado.message, 500);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: UsoPage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: UsoPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: UsoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }




}