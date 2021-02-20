import { Component, ViewChild, ElementRef, OnInit, Input } from '@angular/core';
import { NavController, Events, ModalController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { Md5 } from 'ts-md5/dist/md5';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  //@ViewChild("Nome") iNome : ElementRef;
  @ViewChild('Nome', { static: true }) iNome;
  private DECIMAL_SEPARATOR=".";
  private GROUP_SEPARATOR=",";
  private pureResult: any;
  private maskedId: any;
  private val: any;
  private v: any;

  public CodigoUsuario: any;
  public NomeUsuarioLogado: string;

  public Nome     : string;
  public SobreNome: string;
  public Email    : string;
  public Celular  : string;
  public IMEI     : string;
  public CPF_CNPJ : String;  
  
  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController

  ) { }

  ngOnInit() {
    //console.log(("Init");
    this.CodigoUsuario = sessionStorage.getItem("SessionCodigoUsuario");
    this.NomeUsuarioLogado = sessionStorage.getItem("SessionNomeUsuario");
  }

  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.    
    //console.log(("ionViewWillEnter");
  }


  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    //console.log(("ionViewDidEnter");
    setTimeout(() => {
      this.iNome.setFocus();
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


  Register(form: NgForm) {
    // paramStatus: Pesquisar, Gravar, Deletar
    form.value.Senha = Md5.hashStr(form.value.Senha);
    form.value.ReSenha = Md5.hashStr(form.value.ReSenha);
    this.Authorizer.QueryStoreProc('Executar','spRegister', form.value ).then(res => {
      let resultado: any = res[0];
      try {
        if (resultado.success) {
          this.Nome = JSON.parse(resultado.results)[0].Nome;
          this.SobreNome = JSON.parse(resultado.results)[0].SobreNome;
          this.Email = JSON.parse(resultado.results)[0].Email;
          this.Celular = JSON.parse(resultado.results)[0].Celular;
          this.IMEI = JSON.parse(resultado.results)[0].IMEI;

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

   

  format(valString) {
    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    this.pureResult = parts;
    if (parts[0].length <= 11) {
      this.maskedId = this.cpf_mask(parts[0]);
      return this.maskedId;
    } else {
      this.maskedId = this.cnpj(parts[0]);
      return this.maskedId;
    }
  };

  unFormat(val) {
    if (!val) {
      return '';
    }
    val = val.replace(/\D/g, '');

    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

  cpf_mask(v) {
    v = v.replace(/\D/g, ''); //Remove tudo o que não é dígito
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); //Coloca um ponto entre o terceiro e o quarto dígitos
    v = v.replace(/(\d{3})(\d)/, '$1.$2'); //Coloca um ponto entre o terceiro e o quarto dígitos
    //de novo (para o segundo bloco de números)
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2'); //Coloca um hífen entre o terceiro e o quarto dígitos
    return v;
  }

  cnpj(v) {
    v = v.replace(/\D/g, ''); //Remove tudo o que não é dígito
    v = v.replace(/^(\d{2})(\d)/, '$1.$2'); //Coloca ponto entre o segundo e o terceiro dígitos
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3'); //Coloca ponto entre o quinto e o sexto dígitos
    v = v.replace(/\.(\d{3})(\d)/, '.$1/$2'); //Coloca uma barra entre o oitavo e o nono dígitos
    v = v.replace(/(\d{4})(\d)/, '$1-$2'); //Coloca um hífen depois do bloco de quatro dígitos
    return v;
}



}