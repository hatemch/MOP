import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController, AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { Bairros } from 'src/app/models/bairro';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-bairros',
  templateUrl: './bairros.page.html',
  styleUrls: ['./bairros.page.scss'],
})
export class BairrosPage implements OnInit {

  public AppName: String = environment.AppName;


  familia: Object[];

  public CodigoUsuario: any;
  public NomeUsuarioLogado: string;
  public bairro = new Bairros();
  public bairros: any[];

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

  ngOnInit() {
    this.getPermissoesModulo();
  }

  ionViewDidEnter() {
    this.CRUDBairros('READ', '');
  }

  private CRUDBairros(_statusCRUD, _formValues) {
    this.sendRequest('spBairros', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.bairros = results.map(function callback(value) {
        let bairro = new Bairros();

        bairro.codigo = value.codigo;
        bairro.codigo_bairro = value.codigo_bairro;
        bairro.nome_bairro = value.nome_bairro;
        bairro.nome_municipio = value.nome_municipio.toUpperCase();
        bairro.aisp = value.aisp;
        bairro.risp = value.risp;
        bairro.cipm = value.cipm;
        bairro.dt = value.dt;
        // bairro.codigo_municipio = value.codigo_municipio;

        return bairro;
      });
      console.log('this.bairros', this.bairros);
    });
  }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/98']);
  }

  // DELETE 
  public async delete(id: string, value: string) {
    //value = this.bairro.nome_bairro ;
    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você deseja apagar <strong>' + value + '</strong>?',
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
            this.CRUDBairros('DELETE', { 'codigo': id });
          }
        }
      ]
    });

    await alert.present();
    this.CRUDBairros('READ', '');
  }

  NewBairros() {
    this.router.navigate(['modif-bairros']);
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
      // console.log('Houve um problema nas permissoes do modulo: ', this.router.url);
      // this.goBack();
    }
  }

  /**
* Autor: Hatem chaouch 
* Data: 09/03/2020
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
        ((params.StatusCRUD === 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
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

}

