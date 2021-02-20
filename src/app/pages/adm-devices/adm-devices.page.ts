import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { NgForm } from '@angular/forms';
import { Segmento } from 'src/app/models/segmento';
import { Grupo } from 'src/app/models/grupo';
import { User } from 'src/app/models/user';
import { AdmDevice } from 'src/app/models/adm-device';

@Component({
  selector: 'app-adm-devices',
  templateUrl: './adm-devices.page.html',
  styleUrls: ['./adm-devices.page.scss'],
})
export class AdmDevicesPage implements OnInit {
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';
  static APP_NAME: string = EnvService.name;
  private APP_NAME: string = this.env.AppName;


  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];
  public user = new User();
  public device = new AdmDevice();
  public devices: Array<AdmDevice> = [];
  public segmento = new Segmento();
  public grupo = new Grupo();
  public showTable: boolean = false;
  public columns = [{ text: 'PIM', bold: true }, { text: 'IMEI', bold: true }, { text: 'Segmento', bold: true }, { text: 'Grupo', bold: true }, { text: 'Propietário', bold: true }, { text: 'Linha', bold: true }, { text: 'Opções', bold: true }];
  

  constructor(

    private navCtrl: NavController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private alertController: AlertController,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute


  ) {
    
  }

  ngOnInit() {
    this.getPermissoesModulo();
  }

  //Recommend to use 'ionViewDidEnter' instead of 'ngOnInit'
  ionViewDidEnter() {
    this.devices= [];
    this.showTable = false;
    this.device.pim = "";
    this.device.imei = "";
  }

  pesquisar(form: NgForm) {

    this.CRUDdevice(AdmDevicesPage.CRUD_READ, form.value);
    // this.device.pim = "";
    // this.device.imei = "";
  }

  private CRUDdevice(_statusCRUD, _formValues) {
    this.sendRequest('spAdmDevices', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case AdmDevicesPage.CRUD_CREATE:
          this.router.navigate(['/menu/adm-devices']);
          break;
        case AdmDevicesPage.CRUD_READ:
          let results = JSON.parse(atob(resultado.results));

          this.devices = results.map(function callback(value) {
            let device = new AdmDevice();
            device.codigo = value.CODIGO;
            device.pim = value.PIM;
            device.imei = value.IMEI;
            device.linha = value.LINHA;
            device.segmento = value.SEGMENTO;
            device.grupo = value.NOMEGRUPO;
            device.usuario = value.NOMEUSUARIO;
            device.sistema = value.SISTEMA;
            device.particular = value.PARTICULAR;
            return device;

          });
          if (this.devices.length == 0) {
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
          }
          this.showTable = true;
          break;
        case AdmDevicesPage.CRUD_UPDATE:
          this.router.navigate(['/menu/adm-devices']);
          break;
          case AdmDevicesPage.CRUD_DELETE:
            this.CRUDdevice(AdmDevicesPage.CRUD_READ, "");
        default:
          break;
      }


    });
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
        // || (procedure === 'spAdmDevices')
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
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AdmDevicesPage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: AdmDevicesPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: AdmDevicesPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }
  async delete(id: string, value: string, form: NgForm) {


    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você deseja Apagar o device com IMEI:  <strong>' + value + '?</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',

        }, {
          text: 'SIM',
          handler: () => {
            this.CRUDdevice(AdmDevicesPage.CRUD_DELETE, { 'codigo': id });
            this.pesquisar(form); //to refresh and see the deleted item
          }
        }
      ]
    });

    await alert.present();
  }

  NewDevice() {
    this.router.navigate(['menu/cadastro-adm-devices']);
  }
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/98']);
  }

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


}
