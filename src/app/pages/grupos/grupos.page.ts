import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController, PopoverController, Events, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { parseHostBindings } from '@angular/compiler';
import { Router } from '@angular/router';
import { Grupo } from 'src/app/models/grupo';
import { Comando } from 'src/app/models/comando';
import { Segmento } from 'src/app/models/segmento';

import { environment } from 'src/environments/environment.prod';
import { Page } from 'src/app/models/page';

@Component({
  selector: 'app-grupos',
  templateUrl: './grupos.page.html',
  styleUrls: ['./grupos.page.scss'],
})
export class GruposPage implements OnInit {

  public AppName: String = environment.AppName;


  familia: Object[];

  public CodigoUsuario: any;
  public NomeUsuarioLogado: string;

 // public grupos: any[];

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado


  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,
    private router: Router,
    private alertController: AlertController
  ) { }

  public page = new Page();
  public columns = [{ text: 'Grupo', bold: true }, { text: 'Segmento', bold: true }];

  public grupos: Array<Grupo> = [];
  public selected: boolean = false;

  public grupo = new Grupo();
  public data: any[] ;
  showTable: boolean;

  ngOnInit() {
    this.getPermissoesModulo();
  }
  ionViewDidEnter() {
    this.CRUDGrupos('READ', '', '');
    this.showTable = false;
  }

  private CRUDGrupos(_statusCRUD, _formValues, _option: any) {
    this.sendRequest('spGrupos', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      if (_statusCRUD == 'READ') {
        this.grupos = results.map(function callback(value) {
          let grupo = new Grupo();
          grupo.codigo = value.codigo;
          grupo.nome = value.nome;
          grupo.grupo = value.grupo;
          grupo.nivel = value.nivel;
          grupo.segmento = value.segmento;
          grupo.email = value.email;
          return grupo;
        });
      }
      if (_statusCRUD == 'DELETE') {
        this.CRUDGrupos('READ', '', '');
      }
      console.log('this.grupos', this.grupos);

      if (_option == 'table') {
        if (this.grupos.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: 'Sem dados a mostrar' });
        }
        this.showTable = true;
       // this.showMapScreem = false;
       // this.mapURL = "";
      }

    });
  }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/98']);
  }

  NewGrupo() {
    this.router.navigate(['add-grupo']);
  }

  // DELETE
  public async delete(id: string, value: string) {

    const alert = await this.alertController.create({
      header: 'Confirmar!',
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
          text: 'SIM',
          handler: () => {
            this.CRUDGrupos('DELETE', { 'codigo': id }, '');
          }
        }
      ]
    });

    await alert.present();
  }

  // NEEDED FUNCTIONS

  /**
  * Autor: Hatem chaouch 
  * Data: 03/03/2020
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
        ((params.StatusCRUD == "CREATE") && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD == "READ") && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD == "UPDATE") && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD == "DELETE") && (this.permissoes.Deletar > 0))
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
              this.alertService.showLoader(resultado.message, 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: resultado.message });
              this.navCtrl.back();
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.AppName, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: this.AppName, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }

  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    });

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


  onSort(event){
    console.log(event);
  }

}

