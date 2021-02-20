import { Component, OnInit } from '@angular/core';
import { Events, ModalController, NumericValueAccessor } from '@ionic/angular';
import { NgForm } from '@angular/forms';
//import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { PrintGuiaInfoService } from 'src/app/services/print-guia-info-service.service';
import { environment } from "../../../environments/environment";
import { Router } from '@angular/router';
//MODELS

import { GuiaPericia } from 'src/app/models/guia-pericia';
import { Page } from 'src/app/models/page'
import { AlertController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { OutrasPericias } from 'src/app/models/outra-pericia';

@Component({
  selector: 'app-guia-pericia-digital',
  templateUrl: './guia-pericia-digital.page.html',
  styleUrls: ['./guia-pericia-digital.page.scss'],
})
export class GuiaPericiaDigitalPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  static CRUD_READ: string = 'READ';
  static CRUD_DELETE: string = 'DELETE';
  public usuario = new User();
  public guiaPericiaDigitals: Array<GuiaPericia> = [];
  public guiaPericiaDigital = new GuiaPericia();
  //arrays of the complementary data of the guia for the print fuction
  public showButtons: boolean = true;
  public detalhesFato: Array<any> = [];
  public outrasPericias: Array<OutrasPericias> = [];
  public periciandos: Array<any> = [];
  public localPericia: Array<any> = [];
  public guiasRelacionadas: Array<any> = [];

  //search how to get this info
  public aditamentos: Array<any> = [];
  ////////////////////////////////////

  //-------------------------------------------------------------------//
  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado
  constructor(private alertService: AlertService,
    private env: EnvService,
    private printGuiaInfoService: PrintGuiaInfoService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController,
    public modalController: ModalController) { }

  ngOnInit() {
    this.getPermissoesModulo();

  }
  ionViewDidEnter() {
    this.usuario.perfil = localStorage.getItem('perfilUsuario').trim();
    this.usuario.nomegrupo = localStorage.getItem('unidadeUsuario').trim();
    //this.usuario.perfil = 'PERITO MÉDICO LEGAL'
    if (this.usuario.perfil == 'PERITO MÉDICO LEGAL' || this.usuario.perfil == 'PERITO CRIMINAL') {
      this.showButtons = false;
      this.consultarGuias('', 'READGUIASDPT')
    } else {
      this.showButtons = true;
      this.consultarGuias(this.usuario.nomegrupo, 'READGUIASPC')
    }

  }
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/92']);
  }



  goToExamePericialLaboratorial() {
    this.router.navigate(['/menu/exame-laboratorial-legal']);
  }

  goToconsultarGuia() {
    this.router.navigate(['/menu/buscar-guia-perica']);
  }

  consultarGuias(unidadeUsuario, StatusCRUD) {
    this.sendRequest('spGuiaPericiaDigital', {
      StatusCRUD: StatusCRUD,
      formValues: { unidade: unidadeUsuario }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));


      this.guiaPericiaDigitals = results.map(function callback(value) {
        let guiaPericiaDigital = new GuiaPericia();
        guiaPericiaDigital.codigo = value.codigo;
        guiaPericiaDigital.nome_guia = value.nome_guia;
        guiaPericiaDigital.tipo_guia = value.tipo_guia;
        guiaPericiaDigital.ano = value.ano;
        guiaPericiaDigital.sequencial = value.sequencial;
        guiaPericiaDigital.numero_periciando = value.numero_periciando;
        guiaPericiaDigital.data_registro = value.data_registro;
        guiaPericiaDigital.hora_registro = value.hora_registro;
        guiaPericiaDigital.numero_procedimento = value.numero_procedimento;
        guiaPericiaDigital.destino_lado = value.destino_lado;
        guiaPericiaDigital.situacao = value.situacao;
        guiaPericiaDigital.orgao = value.orgao;
        guiaPericiaDigital.unidade = value.unidade;
        guiaPericiaDigital.sigilosa = value.sigilosa;
        guiaPericiaDigital.resgistrado = value.resgistrado;
        guiaPericiaDigital.autoridade = value.autoridade;
        guiaPericiaDigital.usuario = value.usuario;


        return guiaPericiaDigital;
      });
      console.log('Guia Pericia', this.guiaPericiaDigitals);
    });

  }
  alterarGuia(datosGuia) {

    if (datosGuia.tipo_guia == 'GM') {
      this.registrarAcaoAuditoria(datosGuia, 'UPDATE')
      this.router.navigate(['/menu/incluir-exame-medico', datosGuia.codigo]);
    }

    if (datosGuia.tipo_guia == 'GL') {
      this.registrarAcaoAuditoria(datosGuia, 'UPDATE')
      this.router.navigate(['/menu/incluir-exame-laboratorial', datosGuia.codigo]);
    }
  }
  async delete(datosGuia) {

    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar Guia com sequencial: <strong>' + datosGuia.nome_guia + '?</strong>',
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
            this.exibirCausaExclucaoForm(datosGuia);
            //this.excluirGuia(datosGuia);
          }
        }
      ]
    });

    await alert.present();
  }
  excluirGuia(datosGuia) {
    this.sendRequest('spGuiaPericia', {
      StatusCRUD: 'DELETE',
      formValues: { codigo: Number(datosGuia.codigo), tipo_guia: datosGuia.tipo_guia }
    }, (resultado) => {
      if (resultado.success == true) {
        if (this.usuario.perfil == 'PERITO MÉDICO LEGAL' || this.usuario.perfil == 'PERITO CRIMINAL') {
          this.showButtons = false;
          this.consultarGuias('', 'READGUIASDPT')
        } else {
          this.showButtons = true;
          this.consultarGuias(this.usuario.nomegrupo, 'READGUIASPC')
        }
        console.log("Guias Asociadas", this.guiaPericiaDigitals)

      } else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Guia naõ excluida' });
      }

    });
  }
  registrarAcaoAuditoria(datosGuia, StatusCRUD) {
    this.sendRequest('spAuditoriaGuiaPericiaDigital', {
      StatusCRUD: StatusCRUD,
      formValues: {
        guiaId: datosGuia.codigo,
        numeroGuia: datosGuia.nome_guia,
        servidorResponsavel: localStorage.getItem("codigoUsuario"),
        motivo: this.guiaPericiaDigital.motivoCancelamento
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
  async exibirCausaExclucaoForm(datosGuia) {
    const alert = await this.alertController.create({
      cssClass: 'secondary',
      header: 'Indique a causa da exclusão!',
      inputs: [
        {
          name: 'motivo',
          type: 'text',
        },

      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (inputs) => {
            this.guiaPericiaDigital.motivoCancelamento = inputs.motivo
            if (this.guiaPericiaDigital.motivoCancelamento.trim() == '') {
              this.exibirCausaExclucaoForm(datosGuia);
            } else {
              this.registrarAcaoAuditoria(datosGuia, 'DELETE')
              this.excluirGuia(datosGuia);
            }

          }
        }
      ]
    });

    await alert.present();
  }

  async impresaoGuia(dataGuia) {
    this.consultarDetalhesFato(dataGuia.codigo);
    this.consultarOutrasPericias(dataGuia.codigo);
    this.consultarGuiasAsociadas(dataGuia.codigo);
    this.consultarPericiandos(dataGuia.codigo);
    this.consultarLocalPericia(dataGuia.codigo);
    await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec
    this.printGuiaInfoService.generatePdf(
      this.detalhesFato,
      this.outrasPericias,
      this.guiasRelacionadas,
      this.periciandos,
      this.localPericia,
      dataGuia
    );

  }
  consultarDetalhesFato(numGuia) {
    this.sendRequest('spDetalhesFato', {
      StatusCRUD: 'READ_DETHALE_PRINT',
      formValues: { numguia: numGuia }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.detalhesFato = results;

      console.log('detalhesFato', this.detalhesFato);
    });


  }

  consultarGuiasAsociadas(numGuia) {
    this.sendRequest('spAsociarGuias', {
      StatusCRUD: 'READ',
      formValues: { codigoGuiaPrincipal: numGuia }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.guiasRelacionadas = results;

      console.log('guiasRelacionadas', this.guiasRelacionadas);
    });


  }
  consultarPericiandos(numGuia) {
    this.sendRequest('spPericiandos', {
      StatusCRUD: 'READ',
      formValues: { numguia: numGuia }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.periciandos = results;

      console.log('periciandos', this.periciandos);
    });


  }

  consultarLocalPericia(numGuia) {
    this.sendRequest('spLocalPericia', {
      StatusCRUD: 'READ',
      formValues: { numguia: numGuia }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.localPericia = results;

      console.log('localPericia', this.localPericia);
    });


  }

  consultarOutrasPericias(numGuia) {
    this.sendRequest('spOutrasPericias', {
      StatusCRUD: 'READ',
      formValues: { numguia: numGuia }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      this.outrasPericias = results.map(function callback(value) {
        let outraP = new OutrasPericias();
        outraP.codigo = value.codigo;
        outraP.tipo = value.tipo;
        outraP.nome_tipo = value.nome_tipo;
        outraP.descricao = value.descricao;
        outraP.nome_tipo_local = value.nome_tipo_local;
        outraP.numguia = value.numguia;
        outraP.tipo_local = value.tipo_local;
        outraP.nome_tipo_local = value.nome_tipo_local;
        outraP.examen_requisitado = value.Exames.split(/['<''>']/);
        outraP.nome_examen_requisitado = '';
        return outraP;
      });
      for (let index = 0; index < this.outrasPericias.length; index++) {
        for (var i = 0; i < this.outrasPericias[index].examen_requisitado.length; i++)
          if (this.outrasPericias[index].examen_requisitado[i] == 'div') {
            this.outrasPericias[index].nome_examen_requisitado = this.outrasPericias[index].nome_examen_requisitado + this.outrasPericias[index].examen_requisitado[i + 1] + ' '
          }
      }
      console.log('outrasPericias', this.outrasPericias);
    });

  }

  /* ------------------- PERMISIONS USER -------------------------------------- */
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
  /* ------------------- END PERMISIONS USER -------------------------------------- */

  /* ---------------------------- SENDREQUEST -------------------------------------- */
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
        || ((params.StatusCRUD === 'READGUIASPC') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'READGUIASDPT') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'READ_DETHALE_PRINT') && (this.permissoes.Pesquisar > 0))
        // || (procedure === 'spCargos')
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
  /* ---------------------------- END SENDREQUEST -------------------------------------- */
}
