import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavController, Events, ModalController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import {Md5} from 'ts-md5/dist/md5';
import { environment } from "../../../environments/environment.prod"

@Component({
  selector: 'app-recuperasenha',
  templateUrl: './recuperasenha.page.html',
  styleUrls: ['./recuperasenha.page.scss'],
})
export class RecuperasenhaPage implements OnInit {
  
  @ViewChild('email', { static: true }) iemail; 
  public Email    : String;  
  public Token    : String;
  public logoCliente: String = environment.logoCliente; 
  public AppLogo    : String = environment.logoApp; 
  public appVersion : String = environment.AppVersion;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,    
    
  ) { }

  ngOnInit() {
  }


  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.    
    //console.log(("ionViewWillEnter");    
  }
  
  
  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    //console.log(("ionViewDidEnter");     
    setTimeout(() => {
      this.iemail.setFocus();      
    },150);

  }
  
  ionViewWillLeave() {
    // Disparado quando o roteamento de componentes está prestes a ser animado.    
    //console.log(("ionViewWillLeave");
  }
  
  ionViewDidLeave() {
    // Disparado quando o roteamento de componentes terminou de ser animado.    
    //console.log(("ionViewDidLeave");
    
  }  
  goBack() {
    this.navCtrl.back();
  }
  
  MinhaConta(form: NgForm) {
    // paramStatus: Pesquisar, Gravar, Deletar, Recupera
    form.value.Senha = Md5.hashStr(form.value.Senha);
    form.value.ReSenha = Md5.hashStr(form.value.ReSenha);
    let params = {      
      'StatusCRUD': 'Recupera',
      'formValues': form.value,
      'CodigoUsuarioSistema': 0,
      'Hashkey': ''
    };
    this.Authorizer.QueryStoreProc('MinhaConta', 'spRecuperaSenha', params).then(res => {
      let resultado: any = res[0];
      try {
        if (resultado.success) {          
          this.alertService.showLoader(resultado.message, 1000);
        }
        else {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: 'Minha Conta', pMessage: resultado.message });
          //this.navCtrl.navigateRoot('/login');
        }
      } catch (err) {
        this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: 'Minha Conta', pMessage: 'Nenhum usuário!' });
      }
    });
    
  }



}
