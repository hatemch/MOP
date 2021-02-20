import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { NavController } from '@ionic/angular';
import { Md5 } from 'ts-md5/dist/md5';
import { NgForm } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-trocosenha',
  templateUrl: './trocosenha.page.html',
  styleUrls: ['./trocosenha.page.scss'],
})
export class TrocosenhaPage implements OnInit {

  public AppName: String = this.env.AppName;
  static CRUD_READ: string = 'READ';
  static CRUD_UPDATE: string = 'TROCO_SENHA';
  public user = new User();
  public Login: string;
  public Senha: string;
  public loginDisabled: boolean = true;
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private Authorizer: AuthService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute,
    private env: EnvService
  ) { }

  ngOnInit() {
    if(this.Authorizer.CodigoUsuarioSistema){
      this.CRUDuser(TrocosenhaPage.CRUD_READ, { 'codigo': this.Authorizer.CodigoUsuarioSistema });
    }
  }

  goBack() {
    this.navCtrl.back();
  }

  AlterSenha(form: NgForm) {

    this.Login = form.value.Login;
    this.Senha = form.value.Senha;

    form.value.codigo = this.Authorizer.CodigoUsuarioSistema;
    form.value.senhaTrocada = this.user.senhaTrocada;
    if(!form.value.codigo){
      this.loginDisabled=false;
    }
    
    //Custom Validation, you can create a function to validate it
    if (form.value.SenhaNova) {
      if (form.value.SenhaNova != form.value.ConfSenhaNova) {
        this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.AppName, pMessage: 'As senhas não correspondem' });
        return;
      } else {
        form.value.SenhaNovaMD5 = Md5.hashStr(form.value.SenhaNova);
        this.CRUDuser(TrocosenhaPage.CRUD_UPDATE, form.value);
      }
    }
  }

  private CRUDuser(_statusCRUD, _formValues) {
    this.sendRequest('spUsuarios', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {
      switch (_statusCRUD) {
      case TrocosenhaPage.CRUD_UPDATE:
      this.router.navigate(['/login']);
      break;
      case TrocosenhaPage.CRUD_READ:
        this.user.LOGIN = JSON.parse(atob(resultado.results))[0].LOGIN;
        this.user.SENHA = JSON.parse(atob(resultado.results))[0].SENHA;
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
        ((params.StatusCRUD === 'TROCO_SENHA'))
        || (procedure === 'spUsuarios')
      ) {

        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProcPost('ExecutarPOST', procedure, _params).then(res => {
          // this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
          const resultado: any = res[0];
          try {
            if (resultado.success) {
              next(resultado);
              this.alertService.showLoader(resultado.message, 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: resultado.message });
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
