import { Component, ViewChild, OnInit } from '@angular/core';
import { Platform, ModalController, NavController } from '@ionic/angular';
import { NgForm } from '@angular/forms';
//import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { environment } from "../../../environments/environment.prod"
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { User } from 'src/app/models/user';

//import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Storage } from '@ionic/storage';
// for install: https://www.npmjs.com/package/ts-md5
import { Md5 } from 'ts-md5/dist/md5';
//Secure Storage
//import { SecureStorage, SecureStorageObject } from '@ionic-native/secure-storage';
import { Network } from '@ionic-native/network';

//import { Facebook, FacebookLoginResponse } from "@ionic-native/facebook";
//import { GooglePlus, GooglePlusOriginal } from '@ionic-native/google-plus';
//import { TwitterConnect } from '@ionic-native/twitter-connect';

//import { GooglePlusOriginal } from '@ionic-native/google-plus';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  static APP_NAME: String = environment.AppName;
  private APP_NAME: string = this.env.AppName;
  @ViewChild('Login', { static: true }) iLogin;
  public CodigoUsuarioSistema: string;
  public NomeUsuarioSistema: String;
  public currentLatitude: any = '';
  public currentLongitude: any = '';
  public storage: any;
  public Login: string;
  public Senha: string;
  public AppName: String = this.env.AppName;
  public current_datetime = new Date()
  public formatted_date = this.current_datetime.getFullYear() + "-" + (this.current_datetime.getMonth() + 1) + "-" +this.current_datetime.getDate()  + " " + this.current_datetime.getHours() + ":" + this.current_datetime.getMinutes() + ":" + this.current_datetime.getSeconds() + "." + this.current_datetime.getMilliseconds()
  public usuario = new User();
  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado
  constructor(
    private platform: Platform
    , private modalController: ModalController
    , private navCtrl: NavController
    , private alertService: AlertService
    , private env: EnvService
    , private Authorizer: AuthService
    , private geolocation: Geolocation
    //,private facebook : Facebook 
    //,private googlePlus : GooglePlus    
    //,googlePlus: GooglePlusOriginal
    , private db: Storage
    //,private secureStorage: SecureStorage
  ) {
    // LSU -> LAST SESSION USER
    /*
    this.db.get('LSU').then((LSU) => {
      let SU = JSON.parse(atob(LSU));
      this.CodigoUsuarioSistema = SU[0].CodigoUsuario;
      this.NomeUsuarioSistema = SU[0].Nome;
      ////console.log(('Olá, ' + SU[0].Nome + '! Você foi a última pessoa a entrar no sistema nesse dispositivo.');      
    });
    */

  }
  /*
  checkConnection() {
    let networkState = "";//navigator.connection.type;

    let states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);
  }
  */

  ngOnInit() {
    //this.checkConnection();

    // Uso a instrução (fetch) para pegar o ip do roteador.
    let ipAPI: any = 'https://api.ipify.org?format=json'
    fetch(ipAPI).then(response => response.json()).then(data =>
      sessionStorage.setItem('SessionIP', data.ip)).catch(() => { }
      )
    // Este método retorna ON/OFF do Serviço onde esta API.
    //this.Authorizer.EngineStatusConection(this.env.API_HOST);  

    // Teste de recuperação de dados

    // Zero a SessionConection 

  }

  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.    
    ////console.log(("ionViewWillEnter");    
  }


  ionViewDidEnter() {
   
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    // //console.log(("ionViewDidEnter");     
    setTimeout(() => {
      this.iLogin.setFocus();
    }, 150);

    sessionStorage.clear();
  }

  ionViewWillLeave() {
    // Disparado quando o roteamento de componentes está prestes a ser animado.    
    ////console.log(("ionViewWillLeave");
  }

  ionViewDidLeave() {
    // Disparado quando o roteamento de componentes terminou de ser animado.    
    ////console.log(("ionViewDidLeave");

  }

  backButtonEvent() {
    this.platform.backButton.subscribe(() => {
      //console.log( ('exit');
      navigator['app'].exitApp();
    })
  }

  /**
   * Recomendado
   */
  /*
  public sigin(): void {

    this.secureStorage.create('userData')
      .then((storage: SecureStorageObject) => {
        this.storage = storage

        //Registra dados
        this.storage.set('email', this.email)
          .then(
          data => //console.log((data), //retorna a chave
          error => //console.log((error)
          );

        //Registra dados
        this.storage.set('password', this.password)
          .then(
          data => //console.log((data), //retorna a chave
          error => this.alertService.presentToast(this.readEmail)
          );

        //Busca dados - email
        this.storage.get('email')
          .then(
          data => { this.readEmail = data; this.alertService.presentToast(this.readEmail); }, //retorna o valor
          error => //console.log(("Não existe dados.")
          );

      });
  }
  */


  AuthLogin(form: NgForm) {
    //this.alertService.showLoader('Carregando... aguarde!!!');
    //this.alertService.presentAlert({pTitle:'MOP',pSubtitle:'Teste',pMessage:'TESTANDO DIALOG'} );
    //this.alertService.presentAlertConfirm({pTitleConfirm: 'MOP', pMessage:'Confirmar procedimento?',pTextBtnCancel:'Não',pTextOkay:'Sim' });
    //this.alertService.presentToast("Mensagem Toast: Logando...");

    //let pwd : any = Md5.hashStr(form.value.password);
    form.value.Senha = Md5.hashStr(form.value.Senha);

    this.Login = form.value.Login;
    this.Senha = form.value.Senha;
    //this.sigin();
    console.log(form);

    this.Authorizer.Login(form).then(res => {
      ////console.log(("Resultado Json:", res);
      let resultado: any = res[0];
      if (resultado.success == true) {

        if (JSON.parse(atob(resultado.results))[0].CodigoUsuarioSuporte) {
          console.log('resultado', JSON.parse(atob(resultado.results)))
          this.consultarStatusUsuario()
          this.getLoc();
          this.alertService.showLoader(resultado.message, 2000);
          this.navCtrl.navigateRoot('/menu/options');
        } else { this.navCtrl.navigateRoot('/trocosenha'); }
     

        //this.Authorizer.CodigoUsuarioSuporte  = JSON.parse(atob(resultado.results))[0].CodigoUsuarioSuporte;
        //this.Authorizer.CodigoUsuarioSistema  = JSON.parse(atob(resultado.results))[0].CodigoUsuarioSistema

        //this.alertService.presentToast(resultado.message);
      }
    });
  }
  public consultarStatusUsuario() {

    this.sendRequest('spCarregaDataUsuarioMenuLateral', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));


      this.usuario.status = results[0].statusUsuario;
      
      if(this.usuario.status=='I'){
       
        
        this.alertService.presentAlert({
          pTitle: this.env.AppNameSigla,
          pSubtitle: this.APP_NAME,
          pMessage: "Usuario Inativo",
        });
        this.navCtrl.navigateRoot('/login');
        
    }
    
  });
  
}
  async getLoc() {


    this.geolocation.getCurrentPosition({ maximumAge: 1000, timeout: 5000, enableHighAccuracy: true }).then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      //alert("r succ"+resp.coords.latitude)
      //alert(JSON.stringify( resp.coords));

      this.currentLatitude = resp.coords.latitude
      this.currentLongitude = resp.coords.longitude
      console.log("currentLatitude", this.currentLatitude)
      console.log("currentLongitude", this.currentLongitude)
      this.sendRequest('spAtualizarLocalicacao', {
        StatusCRUD: 'UPDATE',
        formValues: {
          'latitude': this.currentLatitude.toString(),
          'longitude': this.currentLongitude.toString(),
          'data_posicao': this.formatted_date,
          'data_atualizacao': this.formatted_date
        }
      }, (resultado) => {
        console.log('resultado', JSON.parse(atob(resultado.results)))

      });
    }, er => {
      //alert("error getting location")

    }).catch((error) => {
      alert('Error getting location' + JSON.stringify(error));

    });

  }
  /**
  * Autor: Julio Mejias 
  * Data: 25/02/2020
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
      || (procedure === 'spAtualizarLocalicacao')
    ) {

      const _params = {
        StatusCRUD: params.StatusCRUD,
        formValues: params.formValues,
        CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
        Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
      }
      console.log(_params);

      this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
        const resultado: any = res[0];
        try {
          if (resultado.success) {
            next(resultado);
            this.alertService.showLoader(resultado.message, 1000);
          } else {
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: LoginPage.APP_NAME, pMessage: resultado.message });
          }
        } catch (err) {
          this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: LoginPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
        }
      });
    } else {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: LoginPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
      });
    }
  } 
}


  /*
  doFbLogin() {
    this.alertService.showLoader("Aguarde...", 2000);          
    let permissions = [
      "public_profile",
      "email",
      "user_education_history",
      "user_friends"];
    this.facebook.login(permissions).then((res: FacebookLoginResponse) => {
      this.facebook.api("/me?fields=id,name,email,gender,first_name,last_name,picture.width(720).height(720).as(imageId)", permissions)
        .then(data => {
          //console.log(("fb data--", data);
          let userInfo = {
            id: data.id,
            name: data.name,
            email: data.email,
            imageId: data.imageId.data.url
          };
          
          this.loginService.loginUserViaFacebook(userInfo).subscribe((re: any) => {
            localStorage.setItem("token", "bearer " + re.token);
            //console.log(('api data-', re);
            loader.dismiss();
            this.events.publish("userInfo", {
              name: data.name,
              logo: data.imageId.data.url
            });
            this.showToaster("Login successful!", 3000);
            this.navCtrl.setRoot("HomePage");
          }, error => {
            loader.dismiss();
            //console.log(("Api Error in login via fb1", error);
            this.showToaster(error.message, 3000);
          })
          
        }, error => {
          //loader.dismiss();
          //console.log(("Error in login via fb1", error);
          this.alertService.presentToast(error.message);
        });
    }, error => {
      //loader.dismiss();
      //console.log(("Error in login via fb2", error);
      this.alertService.presentToast(error.message);
    });
  }
*/
  /*
  googleLogin() {
    this.alertService.showLoader("Aguarde...", 2000);            
    this.googlePlus.login({
      'scopes': '',
      'webClientId': '196286087108-9ioopkv6233l85lummmhhiivi3eg8i7q.apps.googleusercontent.com',
      'offline': true
    }).then((success) => {
      //console.log(("you have been successfully logged in by googlePlus!" + JSON.stringify(success));
      const userInfo = {
        imageId: success.imageUrl,
        name: success.displayName,
        googleId: success.userId,
        email: success.email
      };
    }
    
     /* 
      this.loginService.loginUserViaGoogle(userInfo).subscribe((re: any) => {
        //console.log(('api res', re)
        localStorage.setItem("token", "bearer " + re.token);
        loader.dismiss();
        this.events.publish("userInfo", {
          name: success.displayName,
          logo: success.imageUrl
        });
        // localStorage.setItem('user', success.userId);
        this.showToaster("Login successful!", 3000);
        this.navCtrl.setRoot("HomePage");
      }, error => {
        loader.dismiss();
        //console.log(('error1', error);
        this.showToaster(error.message, 3000);
      })
      }, error => {
        loader.dismiss();
        //console.log(('catch error2', error);
        this.showToaster(error.messsage, 3000);
      });
      }
      */
  //)}


}  
