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

@Component({
  selector: 'app-incluir-exame-laboratorial',
  templateUrl: './incluir-exame-laboratorial.page.html',
  styleUrls: ['./incluir-exame-laboratorial.page.scss'],
})
export class IncluirExameLaboratorialPage implements OnInit {
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  private APP_NAME: string = this.env.AppName;

  public noCompleteForm: boolean = false;


  public subtitle = 'Nova Guia';
  public flagForm: boolean = false;
  public gpExameLaboratorialLegal = new GuiaPericia();
  public gpExameLaboratorialLegals: Array<GuiaPericia> = [];
  public activateButton = true;
  public usuarioGuiaPericia: Array<any> = [];
  public guiasAsociadas: Array<any> = [];



  public grupos: Array<Grupo> = [];


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
    private modalCtrl: ModalController,
    private authService: AuthService,
    private validations: ValidationsService,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute) { }

  async ngOnInit() {
    let current_datetime = new Date()
    let formatted_date = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()

    this.gpExameLaboratorialLegal.tipo_guia = 'GL';

    this.gpExameLaboratorialLegal.data_registro = formatted_date.toString();
    this.CarregaSegmentoGrupos();
    this.ConsultaUsuarioGuiaPericia();



    await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.gpExameLaboratorialLegal.codigo = data.codigo;
        if (this.gpExameLaboratorialLegal.codigo) {
          this.CRUDGuiaPericia(IncluirExameLaboratorialPage.CRUD_READ);
          this.carregaGuiasAsociadas();
          this.activateButton = false;
        }
      });

  }

  goBack() {
    this.router.navigate(['/menu/guia-pericia-digital']);
  
  }
  goToPericiandos() {
    this.router.navigate(['/menu/periciandos', this.gpExameLaboratorialLegal.codigo]);

  }
  async openBuscaOcorrencia() {
    const modal = await this.modalCtrl.create({
      component: BuscarOcorrenciaPage
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();

    this.gpExameLaboratorialLegal.unidade = data.unidade;
    this.gpExameLaboratorialLegal.ano = data.ano;
    this.gpExameLaboratorialLegal.sequencial = data.sequencial;
  }
  /* ===== SAVE NEW/CHANGES =============================================================================== */
  save(form: NgForm) {
     //validation for requered fields that the user have to put
     if(this.gpExameLaboratorialLegal.numero_procedimento==''||this.gpExameLaboratorialLegal.numero_procedimento==null)
     {
       this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo N° do Procedimento não pode estar vazio' });
       return;
     }
     if(this.gpExameLaboratorialLegal.destino_lado==''||this.gpExameLaboratorialLegal.destino_lado==null)
     {
       this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo Destino do Laudo não pode estar vazio' });
       return;
     }
 //----------------------------------------------------------------------------------------------//
    this.gpExameLaboratorialLegal.sequencial = ' ';
    this.gpExameLaboratorialLegal.ano = this.gpExameLaboratorialLegal.data_registro.substring(7, 9);
    this.gpExameLaboratorialLegal.tipo_guia = 'GL';
    this.gpExameLaboratorialLegal.situacao = 'Rascunho';
    this.gpExameLaboratorialLegal.unidade = this.usuarioGuiaPericia[0].unidadeRequisante;
    this.gpExameLaboratorialLegal.orgao = this.usuarioGuiaPericia[0].orgaoRequisante.trim();
    this.gpExameLaboratorialLegal.resgistrado = this.usuarioGuiaPericia[0].MATRICULA.trim() + '-' + this.usuarioGuiaPericia[0].NOME + '-' + this.usuarioGuiaPericia[0].cargo
    this.gpExameLaboratorialLegal.nome_guia = this.gpExameLaboratorialLegal.destino_lado + '-' +
      this.gpExameLaboratorialLegal.tipo_guia + '-' + this.gpExameLaboratorialLegal.ano + '-' +
      this.gpExameLaboratorialLegal.numero_procedimento;
    this.activateButton = false;
   
    //Custom Validation, you can create a function to validate it

    if (this.gpExameLaboratorialLegal.codigo) {
      //ADD CODIGO TO UPDATE 


      console.log('UPDATE')
      console.log(this.gpExameLaboratorialLegal.codigo);
      console.log(this.gpExameLaboratorialLegal.nome_guia);
      this.CRUDGuiaPericia(IncluirExameLaboratorialPage.CRUD_UPDATE);
    }
    else {
      console.log('CREATE')
      this.CRUDGuiaPericia(IncluirExameLaboratorialPage.CRUD_CREATE);
      

    }
  }
  /* ===== END SAVE NEW/CHANGES =============================================================================== */


  /* ===== CRUD MODULE USERS =============================================================================== */
  private CRUDGuiaPericia(_statusCRUD) {

    this.sendRequest('spGuiaPericia', {
      StatusCRUD: _statusCRUD,
      formValues: this.gpExameLaboratorialLegal
    }, (resultado) => {

      switch (_statusCRUD) {
        case IncluirExameLaboratorialPage.CRUD_CREATE:
          // this.router.navigate(['/menu/exame-laboratorial-legal']);
          this.gpExameLaboratorialLegal.codigo = JSON.parse(atob(resultado.results))[0].codigo;
          console.log('data guia', this.gpExameLaboratorialLegal.codigo)
          this.registrarAcaoAuditoria(this.gpExameLaboratorialLegal,'CREATE')


          break;
        case IncluirExameLaboratorialPage.CRUD_READ:


          this.gpExameLaboratorialLegal.nome_guia = JSON.parse(atob(resultado.results))[0].nome_guia;
          this.gpExameLaboratorialLegal.tipo_guia = JSON.parse(atob(resultado.results))[0].tipo_guia;
          this.gpExameLaboratorialLegal.ano = JSON.parse(atob(resultado.results))[0].ano;
          this.gpExameLaboratorialLegal.sequencial = JSON.parse(atob(resultado.results))[0].sequencial;
          this.gpExameLaboratorialLegal.numero_periciando = JSON.parse(atob(resultado.results))[0].numero_periciando;
          this.gpExameLaboratorialLegal.data_registro = JSON.parse(atob(resultado.results))[0].data_registro;
          this.gpExameLaboratorialLegal.hora_registro = JSON.parse(atob(resultado.results))[0].hora_registro;
          this.gpExameLaboratorialLegal.numero_procedimento = JSON.parse(atob(resultado.results))[0].numero_procedimento;
          this.gpExameLaboratorialLegal.destino_lado = JSON.parse(atob(resultado.results))[0].destino_lado;
          this.gpExameLaboratorialLegal.orgao = JSON.parse(atob(resultado.results))[0].orgao;
          this.gpExameLaboratorialLegal.unidade = JSON.parse(atob(resultado.results))[0].unidade;
          this.gpExameLaboratorialLegal.sigilosa = JSON.parse(atob(resultado.results))[0].sigilosa;
          this.gpExameLaboratorialLegal.resgistrado = JSON.parse(atob(resultado.results))[0].resgistrado;
          this.gpExameLaboratorialLegal.autoridade = JSON.parse(atob(resultado.results))[0].autoridade;
          this.gpExameLaboratorialLegal.situacao = JSON.parse(atob(resultado.results))[0].situacao;
          this.gpExameLaboratorialLegal.usuario = JSON.parse(atob(resultado.results))[0].usuario;



          this.CarregaSegmentoGrupos();
          

          break;
        case IncluirExameLaboratorialPage.CRUD_UPDATE:
          this.router.navigate(['/menu/exame-laboratorial-legal']);
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
  /* ===== END READ SEGMENTOS USER ======================================================= */

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
      formValues: { codigoGuiaPrincipal: Number(this.gpExameLaboratorialLegal.codigo) }
    }, (resultado) => {
      this.guiasAsociadas = JSON.parse(atob(resultado.results));
      console.log("Guias Asociadas", this.guiasAsociadas)

    });
  }
  async delete(codigo: string, nome_guia: string) {
    this.gpExameLaboratorialLegal.codigo = codigo;
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
        motivo: this.gpExameLaboratorialLegal.motivoCancelamento
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
  goObjetosPericia() {
    this.router.navigate(['/menu/objetos-pericia', this.gpExameLaboratorialLegal.codigo]);
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