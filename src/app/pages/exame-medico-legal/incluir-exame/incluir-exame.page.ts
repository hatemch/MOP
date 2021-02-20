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
import { BuscarOcorrenciaPage } from '../buscar-ocorrencia/buscar-ocorrencia.page';


@Component({
  selector: 'app-incluir-exame',
  templateUrl: './incluir-exame.page.html',
  styleUrls: ['./incluir-exame.page.scss'],
})
export class IncluirExamePage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  private APP_NAME: string = this.env.AppName;

  public noCompleteForm: boolean = false;


  public subtitle = 'Nova Guia';
  public flagForm: boolean = false;
  public gpExameMedicoLegal = new GuiaPericia();
  public gpExameMedicoLegals: Array<GuiaPericia> = [];
  public guiasAsociadas: Array<any> = [];
  public grupos: Array<Grupo> = [];
  public activateButton = true;
  public usuarioGuiaPericia: Array<any> = [];

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
    private modalCtrl: ModalController,
    private alertController: AlertController,
    ) { }

   ngOnInit() {

    //get dates
    let current_datetime = new Date()
    let formatted_date = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()


    //Harcode parts
    this.gpExameMedicoLegal.tipo_guia = 'GM';
  
    this.gpExameMedicoLegal.data_registro = formatted_date.toString();
    this.CarregaSegmentoGrupos();
    this.ConsultaUsuarioGuiaPericia();

   // await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.gpExameMedicoLegal.codigo = data.codigo;
        if (this.gpExameMedicoLegal.codigo) {
          this.CRUDGuiaPericia(IncluirExamePage.CRUD_READ);
          this.carregaGuiasAsociadas();
          this.activateButton = false;
        }
      });
  }

  goBack() {
    this.router.navigate(['/menu/guia-pericia-digital']);
  }

  /* ===== SAVE NEW/CHANGES =============================================================================== */
  save(form: NgForm) {
    //validation for requered fields that the user have to put
    if(this.gpExameMedicoLegal.numero_procedimento==''||this.gpExameMedicoLegal.numero_procedimento==null)
    {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo N° do Procedimento não pode estar vazio' });
      return;
    }
    if(this.gpExameMedicoLegal.destino_lado==''||this.gpExameMedicoLegal.destino_lado==null)
    {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo Destino do Laudo não pode estar vazio' });
      return;
    }
//----------------------------------------------------------------------------------------------//
    this.gpExameMedicoLegal.ano = this.gpExameMedicoLegal.data_registro.substr(7, 9);
    this.gpExameMedicoLegal.tipo_guia = 'GM';

    this.gpExameMedicoLegal.situacao = 'Rascunho';
    this.gpExameMedicoLegal.unidade = this.usuarioGuiaPericia[0].unidadeRequisante;
    this.gpExameMedicoLegal.orgao = this.usuarioGuiaPericia[0].orgaoRequisante.trim();
    this.gpExameMedicoLegal.resgistrado = this.usuarioGuiaPericia[0].MATRICULA.trim() + '-' + this.usuarioGuiaPericia[0].NOME + '-' + this.usuarioGuiaPericia[0].cargo
    this.gpExameMedicoLegal.nome_guia = this.gpExameMedicoLegal.destino_lado + '-' +
      this.gpExameMedicoLegal.tipo_guia + '-' + this.gpExameMedicoLegal.ano + '-' +
      this.gpExameMedicoLegal.numero_procedimento;
    this.activateButton = false;
   
    //Custom Validation, you can create a function to validate it

    if (this.gpExameMedicoLegal.codigo) {
      //ADD CODIGO TO UPDATE 


      console.log('UPDATE')
      console.log(this.gpExameMedicoLegal.codigo);
      console.log(this.gpExameMedicoLegal.nome_guia);
      this.CRUDGuiaPericia(IncluirExamePage.CRUD_UPDATE);
    }
    else {
      console.log('CREATE')
      this.CRUDGuiaPericia(IncluirExamePage.CRUD_CREATE);
      

    }
  }
  /* ===== END SAVE NEW/CHANGES =============================================================================== */


  /* ===== CRUD MODULE USERS =============================================================================== */
  private CRUDGuiaPericia(_statusCRUD) {

    this.sendRequest('spGuiaPericia', {
      StatusCRUD: _statusCRUD,
      formValues: this.gpExameMedicoLegal
    }, (resultado) => {

      switch (_statusCRUD) {
        case IncluirExamePage.CRUD_CREATE:

          this.gpExameMedicoLegal.codigo = JSON.parse(atob(resultado.results))[0].codigo;
          this.registrarAcaoAuditoria(this.gpExameMedicoLegal,'CREATE')

         // this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.message });

          break;
        case IncluirExamePage.CRUD_READ:


          this.gpExameMedicoLegal.nome_guia = JSON.parse(atob(resultado.results))[0].nome_guia;
          this.gpExameMedicoLegal.tipo_guia = JSON.parse(atob(resultado.results))[0].tipo_guia;
          this.gpExameMedicoLegal.ano = JSON.parse(atob(resultado.results))[0].ano;
          this.gpExameMedicoLegal.sequencial = JSON.parse(atob(resultado.results))[0].sequencial;
          this.gpExameMedicoLegal.numero_periciando = JSON.parse(atob(resultado.results))[0].numero_periciando;
          this.gpExameMedicoLegal.data_registro = JSON.parse(atob(resultado.results))[0].data_registro;
          this.gpExameMedicoLegal.hora_registro = JSON.parse(atob(resultado.results))[0].hora_registro;
          this.gpExameMedicoLegal.numero_procedimento = JSON.parse(atob(resultado.results))[0].numero_procedimento;
          this.gpExameMedicoLegal.destino_lado = JSON.parse(atob(resultado.results))[0].destino_lado;
          this.gpExameMedicoLegal.orgao = JSON.parse(atob(resultado.results))[0].orgao;
          this.gpExameMedicoLegal.unidade = JSON.parse(atob(resultado.results))[0].unidade;
          this.gpExameMedicoLegal.sigilosa = JSON.parse(atob(resultado.results))[0].sigilosa;
          this.gpExameMedicoLegal.resgistrado = JSON.parse(atob(resultado.results))[0].resgistrado;
          this.gpExameMedicoLegal.autoridade = JSON.parse(atob(resultado.results))[0].autoridade;
          this.gpExameMedicoLegal.situacao = JSON.parse(atob(resultado.results))[0].situacao;
          this.gpExameMedicoLegal.usuario = JSON.parse(atob(resultado.results))[0].usuario;



          this.CarregaSegmentoGrupos();
          

          break;
        case IncluirExamePage.CRUD_UPDATE:
          //this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.message });
          this.router.navigate(['/menu/exame-medico-legal']);
          break;

        default:
          break;
      }
    });
  }
  /* ===== END CRUD MODULE USERS =============================================================================== */

  /* ===== READ SEGMENTOS USER ======================================================= */
  CarregaSegmentoGrupos() {

    this.consultarGruposSegmento();
  }

  private consultarGruposSegmento() {

    this.sendRequest('spConsultarGruposSegmento', {
      StatusCRUD: 'READ',
      formValues: { 'segmento': 'Policia Civil' }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      console.log('grupos', results);

      this.grupos = results.map(function callback(value) {
        let grupo = new Grupo();
        grupo.codigo = value.CODIGO;
        grupo.nome = value.NOME;

        return grupo;
      });


      // if (this.user.GRUPO) {
      //   let grupo
      //   grupo = this.user.GRUPO;
      //   this.user.GRUPO = '';
      //   this.user.GRUPO = grupo;
      // }
    });
  }
   /*==== Get the data of the user for the fields of the guia===*/
   private ConsultaUsuarioGuiaPericia() {

    this.sendRequest('spConsultaUsuarioGuiaPericia', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));


      this.usuarioGuiaPericia = results;
      console.log('dataUsuarios', this.usuarioGuiaPericia);

      // if (this.user.GRUPO) {
      //   let grupo
      //   grupo = this.user.GRUPO;
      //   this.user.GRUPO = '';
      //   this.user.GRUPO = grupo;
      // }
    });
  }
  carregaGuiasAsociadas() {
    this.sendRequest('spAsociarGuias', {
      StatusCRUD: 'READ',
      formValues: { codigoGuiaPrincipal: Number(this.gpExameMedicoLegal.codigo) }
    }, (resultado) => {
      this.guiasAsociadas = JSON.parse(atob(resultado.results));
      console.log("Guias Asociadas", this.guiasAsociadas)

    });
  }
  async delete(codigo: string, nome_guia: string) {
    this.gpExameMedicoLegal.codigo = codigo;
    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar Guia com sequencial: <strong>' + nome_guia + '?</strong>',
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
            this.eliminarGuiaAsociada(codigo);
          }
        }
      ]
    });

    await alert.present();
  }
  eliminarGuiaAsociada(codigoGuiaAsociada){
    this.sendRequest('spAsociarGuias', {
      StatusCRUD: 'DELETE',
      formValues: { codigo: Number(codigoGuiaAsociada) }
    }, (resultado) => {
      this.guiasAsociadas = JSON.parse(atob(resultado.results));
      console.log("Guias Asociadas",this.guiasAsociadas)
      
    });
  }
  
  registrarAcaoAuditoria(datosGuia,StatusCRUD) {
    this.sendRequest('spAuditoriaGuiaPericiaDigital', {
      StatusCRUD: StatusCRUD,
      formValues: {
        guiaId: datosGuia.codigo,
        numeroGuia: datosGuia.nome_guia,
        servidorResponsavel: localStorage.getItem("codigoUsuario"),
        motivo: this.gpExameMedicoLegal.motivoCancelamento
      }
    }, (resultado) => {
      if (resultado.success == true) {
        console.log("DataGuia", datosGuia)

      }

      else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Guia naõ excluida' });
      }

    });
  }


  /* ===== GET PERMISSOES =============================================================================== */
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
  /* ===== END GET PERMISSOES =============================================================================== */




  // public compareWithFn(c1: any, c2: any): boolean {
  //   return c1 && c2 ? c1.id === c2.id : c1 === c2;
  // }
  // compareWith = this.compareWithFn;

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
            // if (Array.isArray(resultado)) {
            next(resultado);
            this.alertService.showLoader('Cargando', 1000);
            // } else {
            //   this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.error.Message });
            //   console.log('resultado.error.StackTrace: ', resultado.error.StackTrace);
            // }
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

  async openBuscaOcorrencia() {
    const modal = await this.modalCtrl.create({
      component: BuscarOcorrenciaPage
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    this.gpExameMedicoLegal.unidade = data.unidade;
    this.gpExameMedicoLegal.ano = data.ano;
    this.gpExameMedicoLegal.sequencial = data.sequencial;
  }
  tempMessage(){
    this.alertService.presentAlert({ 
      pTitle: 'ATENÇÃO', 
      pSubtitle: this.APP_NAME, 
      pMessage: 'apenas o perfil “delegado” pode selecionar estecampo' 
    })
    return;
     
  }
  CodependencyMessage(){
    this.alertService.presentAlert({ 
      pTitle: 'ATENÇÃO', 
      pSubtitle: this.APP_NAME, 
      pMessage: 'As informações neste campo serão obtidas com a realização do guia geral' 
    })
    return;
  }
}