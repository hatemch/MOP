import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { environment } from "../../../environments/environment.prod";

import { Cargo } from "../../models/cargo";
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cargos',
  templateUrl: './cargos.page.html',
  styleUrls: ['./cargos.page.scss'],
})
export class CargosPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_DELETE: string = 'DELETE';

  private APP_NAME: string = this.env.AppName;

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public cargos: Array<Cargo> = [];

  constructor(
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();
  }

  //Recommend to use 'ionViewDidEnter' instead of 'ngOnInit'
  ionViewDidEnter() {
    this.CRUDCargos(CargosPage.CRUD_READ, '');
  }

  private CRUDCargos(_statusCRUD, _formValues) {
    this.sendRequest('spCargos', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.cargos = results.map(function callback(value) {
        let cargo = new Cargo();
        cargo.codigo = value.CODIGO;
        cargo.cargo = value.CARGO;
        return cargo;
      });

    });
  }

  async delete(id: string, value: string) {

    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar <strong>' + value + '?</strong>!!!',
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
            this.CRUDCargos(CargosPage.CRUD_DELETE, { 'codigo': id });
          }
        }
      ]
    });

    await alert.present();
  }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/98']);
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
      this.goBack();
    }
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
      if (((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
        || ((params.StatusCRUD === 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'UPDATE') && (this.permissoes.Editar > 0))
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
      this.goBack();
    }
  }

}
