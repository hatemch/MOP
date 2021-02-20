import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AlertController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-gestaodoaparelhos',
  templateUrl: './gestaodoaparelhos.page.html',
  styleUrls: ['./gestaodoaparelhos.page.scss'],
})
export class GestaodoaparelhosPage implements OnInit {
  
  private APP_NAME: string = this.env.AppName;
  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0, 
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado
  public data: any[];
  public selected : boolean = false ;
  public nome : string ;
  public matricula : string;
  constructor(
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();

  }
  NewDevice() {
    this.router.navigate(['/menu/cadastro-adm-devices']);
  }

  public GetTableData(form: NgForm) {
    this.selected = true;
    this.sendRequest('spGestaoAparelhos', {
      StatusCRUD: 'READ',
      formValues: form.value
    }, (resultado) => {
      this.data = JSON.parse(atob(resultado.results));
      console.log('table data  :', this.data , this.nome , this.matricula);
      if (this.data.length == 0) {
        this.alertService.presentAlert({
          pTitle: 'ATENÇAO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar'
        });
      }
      else{
        this.nome = JSON.parse(atob(resultado.results))[0].NOME;
        this.matricula = JSON.parse(atob(resultado.results))[0].MATRICULA;
      }
    });
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
        console.log('Houve um problema nas permissoes do modulo: ', this.router.url);
      }
    }
  
    goBack() {
      this.router.navigate(['/menu/options/tabs/main/98']);
    }
 
    private sendRequest(
      procedure: string,
      params: { StatusCRUD: string; formValues: any; },
      next: any) {
  
      if (typeof this.Authorizer.HashKey !== 'undefined') {
        if (((params.StatusCRUD == "CREATE") && (this.permissoes.Inserir > 0))
          || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
          || (procedure === 'spGestaoAparelhos')
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

  


}

