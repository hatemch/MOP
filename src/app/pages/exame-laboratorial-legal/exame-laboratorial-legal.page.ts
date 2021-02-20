import { Component, OnInit } from '@angular/core';
import { Events, ModalController, NumericValueAccessor } from '@ionic/angular';
import { NgForm } from '@angular/forms';
//import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { environment } from "../../../environments/environment";
import { Router } from '@angular/router';
//MODELS

import { GuiaPericia } from 'src/app/models/guia-pericia';
import { Page } from 'src/app/models/page'
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-exame-laboratorial-legal',
  templateUrl: './exame-laboratorial-legal.page.html',
  styleUrls: ['./exame-laboratorial-legal.page.scss'],
})
export class ExameLaboratorialLegalPage implements OnInit {
  private APP_NAME: string = this.env.AppName;

  static CRUD_READ: string = 'READ';
  static CRUD_DELETE: string = 'DELETE';

  public showTable: boolean = false;








  public gpExameLaboratorialegals: Array<GuiaPericia> = [];
  public gpExameLaboratorialegal = new GuiaPericia();

  public permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado

  public page = new Page();

  public imgLogo = environment.logoconsultainfracaoprint;


  public columns = [{ text: 'Número da Guia', bold: true }, { text: 'Data/Hora', bold: true }];
  public date: Date = new Date();

  constructor(

    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController,
    public modalController: ModalController
  ) { }


  ngOnInit() {
    this.getPermissoesModulo();
    //this.CRUDGuiaPericia();
  }


  ionViewDidEnter() {
    this.gpExameLaboratorialegal = new GuiaPericia();
    this.CRUDGuiaPericia(ExameLaboratorialLegalPage.CRUD_READ);

  }
  // ionViewDidLoad() {


  // }
  // ngAfterContentInit(){

  // }
  // Guia Pericia Exame Medico Legal

  CRUDGuiaPericia(_statusCRUD) {
    this.gpExameLaboratorialegal.tipo_guia = 'GL';

    this.sendRequest('spGuiaPericia', {
      StatusCRUD: _statusCRUD,
      formValues: this.gpExameLaboratorialegal,

    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.gpExameLaboratorialegals = results.map(function callback(value) {
        let gpExameLaboratorialegal = new GuiaPericia();
        gpExameLaboratorialegal.codigo = value.codigo;
        gpExameLaboratorialegal.nome_guia = value.nome_guia;
        gpExameLaboratorialegal.tipo_guia = value.tipo_guia;
        gpExameLaboratorialegal.ano = value.ano;
        gpExameLaboratorialegal.sequencial = value.sequencial;
        gpExameLaboratorialegal.numero_periciando = value.numero_periciando;
        gpExameLaboratorialegal.data_registro = value.data_registro;
        gpExameLaboratorialegal.hora_registro = value.hora_registro;
        gpExameLaboratorialegal.numero_procedimento = value.numero_procedimento;
        gpExameLaboratorialegal.destino_lado = value.destino_lado;
        gpExameLaboratorialegal.situacao = value.situacao;
        gpExameLaboratorialegal.orgao = value.orgao;
        gpExameLaboratorialegal.unidade = value.unidade;
        gpExameLaboratorialegal.sigilosa = value.sigilosa;
        gpExameLaboratorialegal.resgistrado = value.resgistrado;
        gpExameLaboratorialegal.autoridade = value.autoridade;
        gpExameLaboratorialegal.usuario = value.usuario;


        return gpExameLaboratorialegal;
      });
      console.log('Guia Pericia', this.gpExameLaboratorialegals);
    });

  }

  async delete(codigo: string, value: string) {
    this.gpExameLaboratorialegal.codigo = codigo;
    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar Guia com N° guia : <strong>' + value + '?</strong>!!!',
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
            this.CRUDGuiaPericia(ExameLaboratorialLegalPage.CRUD_DELETE);
          }
        }
      ]
    });

    await alert.present();
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
  goBack() {
    this.router.navigate(['/menu/guia-pericia-digital']);
  }
  goToIncluirExamen() {

    this.router.navigate(['/menu/incluir-exame-laboratorial']);

  }
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

  public showDescricao(texto, event) {
    event.target.textContent = texto;
  }

  public hiddeDescricao(texto, event) {
    event.target.textContent = texto;
  }
}
