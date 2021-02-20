import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';
import { Segmento } from 'src/app/models/segmento';
import { Grupo } from 'src/app/models/grupo';
import { User } from 'src/app/models/user';
import { Device } from '@ionic-native/device/ngx';
import { AdmDevice } from 'src/app/models/adm-device';
import { AlertService } from 'src/app/services/alert.service';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-cadastro-adm-devices',
  templateUrl: './cadastro-adm-devices.page.html',
  styleUrls: ['./cadastro-adm-devices.page.scss'],
})
export class CadastroAdmDevicesPage implements OnInit {
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';
  private APP_NAME: string = this.env.AppName;


  public permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];
  public user = new User();
  public device = new AdmDevice();
  public devices: Array<AdmDevice> = [];
  public segmento = new Segmento();
  public grupo = new Grupo();

  //variable to load selects
  private grupoTemp: string = '';
  private usuarioTemp: string = '';

  constructor( private navCtrl: NavController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute) { }

  async ngOnInit() {
    this.getSegmentos();

    await new Promise(resolve => setTimeout(resolve, 500)); // 3 sec
    
    this.activatedRoute.params.subscribe(
      data => {

        //"data" carries all the parameters
        this.device.codigo = data.codigo;

        if (this.device.codigo) {
          this.CRUDdevice(CadastroAdmDevicesPage.CRUD_READ, { 'codigo': this.device.codigo });
        }

      });
  }
  
  private getSegmentos() {
    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.codigo;
        segmento.segmento = value.segmento;

        return segmento;
      });


      console.log('segmentos',this.segmentos);

    });
  }
  
  CarregaSegmentoGrupos()
  {
    console.log(this.device.segmento);
    this.consultarGruposSegmento(this.device.segmento);
  }

  private consultarGruposSegmento(segmento: string) {
    this.sendRequest('spConsultarGruposSegmento', {
      StatusCRUD: 'READ',
      formValues: {'segmento': segmento}
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      console.log('grupos',results);

      this.grupos = results.map(function callback(value) {
        let grupo = new Grupo();
        grupo.codigo = value.CODIGO;
        grupo.nome = value.NOME;

        return grupo;
      });

      this.device.grupo = this.grupoTemp;
      this.CarregaSegmentoGrupoUsuarios();
    });
  }
  CarregaSegmentoGrupoUsuarios()
  {
    this.consultarUsuarioGrupo(this.device.grupo);
  }

  private consultarUsuarioGrupo(grupo: string) {
    if(this.device.grupo){
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
      this.device.usuario = this.usuarioTemp;

    });
  }
}
save(form: NgForm) {

  //Custom Validation, you can create a function to validate it
  if (!form.value.deviceImei
    || !form.value.devicePim
    || !form.value.deviceSegmento
    || !form.value.deviceGrupo
    || !form.value.deviceUsuario
    || !form.value.deviceSistema  
   ) {
    console.log('form: ', form.value);
    this.alertService.presentToast('Preencha os campos');
    return;
  }
  
  if (this.device.particularMostrar) {
    this.device.particular = "S";
  } else { this.device.particular = "N"; }
  form.value.deviceParticular = this.device.particular;

  let deviceDateTime = new Date()
  console.log('DATE', deviceDateTime);
   form.value.deviceDateTime = deviceDateTime;
  if (this.device.codigo) {
    //ADD CODIGO TO UPDATE 
    form.value.codigo = this.device.codigo;
    this.CRUDdevice(CadastroAdmDevicesPage.CRUD_UPDATE, form.value);
  }
  else {
    this.CRUDdevice(CadastroAdmDevicesPage.CRUD_CREATE, form.value);
  }

}
private CRUDdevice(_statusCRUD, _formValues) {
  this.sendRequest('spAdmDevices', {
    StatusCRUD: _statusCRUD,
    formValues: _formValues
  }, (resultado) => {

    switch (_statusCRUD) {
      case CadastroAdmDevicesPage.CRUD_CREATE:
        // this.router.navigate(['/menu/adm-devices']);
        this.navCtrl.back();
        break;
      case CadastroAdmDevicesPage.CRUD_READ:
        this.device.imei = JSON.parse(atob(resultado.results))[0].IMEI;
        this.device.pim = JSON.parse(atob(resultado.results))[0].PIM;
        this.device.linha = JSON.parse(atob(resultado.results))[0].LINHA;

        if (JSON.parse(atob(resultado.results))[0].SEGMENTO) {
          this.device.segmento = JSON.parse(atob(resultado.results))[0].SEGMENTO.trim();
        }
        if (JSON.parse(atob(resultado.results))[0].GRUPO) {
          this.grupoTemp = JSON.parse(atob(resultado.results))[0].GRUPO; // it will be load after its parent data loads
          // this.device.grupo = String(JSON.parse(atob(resultado.results))[0].GRUPO).trim();
        }
        if (JSON.parse(atob(resultado.results))[0].USUARIO) {
          this.usuarioTemp =  JSON.parse(atob(resultado.results))[0].USUARIO // it will be load after its parent data loads
          // this.device.usuario = String(JSON.parse(atob(resultado.results))[0].USUARIO).trim();
        }
        if (JSON.parse(atob(resultado.results))[0].SISTEMA) {
          this.device.sistema = JSON.parse(atob(resultado.results))[0].SISTEMA;
        }
        if (JSON.parse(atob(resultado.results))[0].PARTICULAR =='S') {
          this.device.particularMostrar = true;
        }

        this.CarregaSegmentoGrupos();
        
        break;
      case CadastroAdmDevicesPage.CRUD_UPDATE:
        // this.router.navigate(['/menu/adm-devices']);
        this.navCtrl.back();
        break;

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
        || (procedure === 'spAdmDevices')
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
  goBack() {
    this.navCtrl.back();
  }
  

}
