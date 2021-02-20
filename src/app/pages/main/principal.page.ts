import { Component, OnInit } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { environment } from "../../../environments/environment.prod";
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from '@angular/compiler/src/core';


@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage {

  public permissoes: any // Permissoes todos os modulos para o usuario logado

  public items: any = [];
  public itemsMenu: any = [];
  public menuOption: any;
  public AppName: String = environment.AppName;


  constructor(
    public navCtrl: NavController,
    public ev: Events,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {

  }

  ionViewDidEnter() {
    
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    // Getting data from another page
    if (!sessionStorage.getItem('HashKey')) {
      this.navCtrl.navigateRoot('/login');
    }
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        data.codigo ? this.menuOption = data.codigo : this.menuOption = 99;

        //this.consultarPermisoes();
        this.CarragaMenuPrincipalAPI(this.menuOption);
      }
    )
  }


  public CarragaMenuPrincipalAPI(CodigoMenuGrupo: string) {
    // paramStatus: Pesquisando, Editando, Deletando          
    let params = {
      'CodigoUsuarioSistema': this.Authorizer.CodigoUsuarioSistema,
      'CodigoMenuGrupo': CodigoMenuGrupo,
      'Hashkey': this.Authorizer.HashKey
    };
    this.Authorizer.QueryStoreProc('Executar', 'spCarregaMenuPrincipal', params).then(res => {
      let resultado: any = res[0];
      try {
        if (resultado.success) {
          //this.alertService.showLoader(resultado.message,1000);
          // let results = JSON.parse(atob(resultado.results));

          // for (let i = 0; i < this.permissoes.length; i++) {
          //   for (let j = 0; j < results.length; j++) {
          //     if (results[j].Route == this.permissoes[i].Route) {
          //       if (this.permissoes[i].Pesquisar > 0 || this.permissoes[i].Inserir > 0 || this.permissoes[i].Editar > 0 || this.permissoes[i].Deletar > 0) {
          //         this.itemsMenu.push(results[j]);
          //         this.items.push(results[j]);
          //       }
          //     }
          //   }
          // }
          this.itemsMenu = JSON.parse(atob(resultado.results));
          this.items = JSON.parse(atob(resultado.results));
          //console.log('itemsMenu:', this.items)
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

  getItems(ev: any) {
    //this.CarregaMenuPrincipalStatic();
    this.items = this.itemsMenu;
    const val = ev.target.value;
    if (val && val.trim() != '') {
      this.items = this.items.filter((item) => {
        return (
          (item.Name.toLowerCase().indexOf(val.toLowerCase()) > -1) ||
          (item.Details.toLowerCase().indexOf(val.toLowerCase()) > -1));
      })
    }
  }

  itemSelected(item: any) {
    this.router.navigate([item.Route]);
  }

  private consultarPermisoes() {
    const params = {
      CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema,
      CodigoMenuSistemaPai: this.Authorizer.CodigoMenuSistemaPai,
      Hashkey: this.Authorizer.HashKey
    };
    this.Authorizer.QueryStoreProc('Executar', 'spPermissoesPorUsuario', params).then(res => {
      const resultado: any = res[0];
      try {
        if (resultado.success) {
          this.permissoes = JSON.parse(atob(resultado.results));
          this.CarragaMenuPrincipalAPI(this.menuOption);
        } else {
          console.log('Sem permissões');
        }
      } catch (err) {
        console.log('Sem permissões');
      }
    });
  }

}
