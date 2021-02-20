import { Component, OnInit } from '@angular/core';
import { Router, RouterEvent } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
//import { DocumentViewer } from '@ionic-native/document-viewer/ngx';
import { environment } from "../../../environments/environment.prod";
//SERVICES 
import { EnvService } from 'src/app/services/env.service';
//MODELS
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss']
})

export class MenuPage implements OnInit {


  //public CodigoUsuarioSistema : string; 
  public CodigoUsuarioSuporte: String;
  public NomeUsuarioSistema: String;

  public AppName: String = environment.AppName;
  private APP_NAME: string = this.env.AppName;
  public AppEmailSuporte = environment.AppEmailSuporte;
  public AppWhatAppSuporte = environment.AppWhatAppSuporte
  public appVersion: String = environment.AppVersion;

  public usuario = new User();

  private selectedPath = '';
  public SideMenu = [];

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  };

  constructor(
    private env: EnvService,
    public plt: Platform,
    //private document: DocumentViewer,      
    private db: Storage,
    private Authorizer: AuthService,
    private alertService: AlertService,
    //private principalPage : PrincipalPage,
    public navCtrl: NavController,
    private router: Router) {
    this.router.events.subscribe((event: RouterEvent) => {
      if (event && event.url) {
        this.selectedPath = event.url;
      }
      /*
      plt.ready().then((source) => {
        //console.log(("platform: " + source);
      });
      */



    });
  }

  itemSelected(item: any) {
    //this.alertService.showLoader("Acessando...: " + item.Name,1000);
    this.Authorizer.CodigoMenuSistemaPai = item.CodigoMenuSistema;
    this.navCtrl.navigateRoot(item.Route);

  }
  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.    
    ////console.log(("ionViewWillEnter");   
    if (!sessionStorage.getItem('HashKey')) {
      this.navCtrl.navigateRoot('/login');
    }

  }

  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    ////console.log(("ionViewDidEnter");    
    if (sessionStorage.getItem('HashKey')) {
      this.CodigoUsuarioSuporte = this.Authorizer.CodigoUsuarioSuporte;
      this.CarragaMenuLateralAPI();
      /*
      this.db.get('LSU').then((LSU) => {
        let SU = JSON.parse(atob(LSU));
        this.CodigoUsuarioSistema = SU[0].CodigoUsuario;
        this.CodigoUsuarioSuporte = SU[0].CodigoUsuarioSuporte;
        this.NomeUsuarioSistema = SU[0].Nome;        
      });
      */
    } else {
      this.navCtrl.navigateRoot('/login');
    }
  }

  ionViewDidLeave() {
    // Disparado quando o roteamento de componentes terminou de ser animado.    
    ////console.log(("ionViewDidLeave");     

  }

  CarragaMenuLateralAPI() {
    // paramStatus: Pesquisando, Editando, Deletando      
    let params = {
      'CodigoUsuarioSistema': this.Authorizer.CodigoUsuarioSistema,
      'Hashkey': this.Authorizer.HashKey
    };
    this.Authorizer.QueryStoreProc('Executar', 'spCarregaMenuLateral', params).then(res => {
      let resultado: any = res[0];
      try {
        if (resultado.success) {
          //this.alertService.showLoader(resultado.message,1000);
          this.SideMenu = JSON.parse(atob(resultado.results));
          this.NomeUsuarioSistema = this.Authorizer.NomeUsuarioSistema;
        }
        else {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: resultado.message });
          this.navCtrl.navigateRoot('/login');
        }
      } catch (err) {
        this.alertService.presentAlert({ pTitle: this.AppName, pSubtitle: 'Minha Conta', pMessage: resultado.message });
        this.navCtrl.navigateRoot('/login');
      }
    });
  }

  ngOnInit() {

    this.CarregaDataUsuarioMenuLateral();
  }

  Sair() {
    sessionStorage.clear();
  }

  /* ===== GET PERMISSOES =============================================================================== */
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
  /* ===== END GET PERMISSOES =============================================================================== */

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
  private CarregaDataUsuarioMenuLateral() {

    this.sendRequest('spCarregaDataUsuarioMenuLateral', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));


      this.usuario.perfil = results[0].perfil;
      this.usuario.nomegrupo = results[0].unidade;
      this.usuario.segmento=results[0].orgaoUsuario;
      this.usuario.grupo=results[0].codigoUnidade;
      this.usuario.codigo=results[0].codigoUsuario;
      this.usuario.matricula=results[0].matriculaUsuario;
      this.usuario.nome=results[0].nomeUsuario;
      localStorage.setItem('perfilUsuario', this.usuario.perfil);
      localStorage.setItem('unidadeUsuario', this.usuario.nomegrupo);
      localStorage.setItem('orgaoUsuario',  this.usuario.segmento);
      localStorage.setItem('codigoUnidade',this.usuario.grupo);
      localStorage.setItem('codigoUsuario',this.usuario.codigo);
      localStorage.setItem('nomeUsuario',this.usuario.nome);
      localStorage.setItem('matriculaUsuario',this.usuario.matricula);
    });
    
  }
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/99']);

  }
  /*
  onCopy(text) {
    this.clipboard.copy(text);
  }
  */

}
