import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ValidationsService } from 'src/app/services/validations.service';
import { NgForm } from '@angular/forms';

//MODEL
import { Antecedentes } from "../../models/antecedentes";

@Component({
  selector: 'app-antecedentes',
  templateUrl: './antecedentes.page.html',
  styleUrls: ['./antecedentes.page.scss'],
})
export class AntecedentesPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  public antecedente = new Antecedentes();
  public antecedentes: Array<Antecedentes> = [];

  public columns = [{ text: 'RG', bold: true },
  { text: 'Nome', bold: true },
  { text: 'Nascimento', bold: true },
  { text: 'Obito', bold: true },
  { text: 'Mãe', bold: true },
  { text: 'Pai', bold: true },
  { text: 'Inquerito', bold: true },
  { text: 'Processo', bold: true },
  { text: 'Mandado', bold: true },
  { text: 'Jecrim', bold: true },
  { text: 'Termo', bold: true },
  ];

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  constructor(private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController,
    private validations: ValidationsService) { }

  ngOnInit() {
    this.getPermissoesModulo();
  }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/95']);
  }

  public search(form: NgForm) {

     // Validate all the fields
     if (!form.value.rg && !form.value.nome) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Preencha ao menos um campo' });
      return;
    }

    // Validate RF
    if (form.value.rg) {
      if (!this.validations.validateRG(form.value.rg)) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'RG inválido' });
        return;
      }
    }

    const params = new FormData();

    params.append('rg', this.Authorizer.encripta(this.antecedente.rg));
    params.append('nome', this.Authorizer.encripta(this.antecedente.nome));

    this.sendRequestOnline('ConsultaAntecedentes', params
      , (resultado) => {

        console.log('resultado.results:', resultado);

        this.antecedentes = resultado.map(function callback(value) {

          if (value.codigo == 0) {
            let antecedente = new Antecedentes();
            antecedente.rg = value.rg;
            antecedente.nome = value.nome;
            antecedente.nascimento = value.nascimento;
            antecedente.obito = value.obito;
            antecedente.mae = value.mae;
            antecedente.pai = value.pai;
            antecedente.inquerito = value.inquerito;
            antecedente.processo = value.processo;
            antecedente.mandado = value.mandado;
            antecedente.jecrim = value.jecrim;
            antecedente.termo = value.termo;
            return antecedente;
          }

        });

        if (this.antecedentes.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        }

        console.log('this.antecedente:', this.antecedente);

      });
  }

  //NEEDE FUNCTIONS
  private sendRequestOnline(
    procedure: string,
    params: any,
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {

      if (this.permissoes.Pesquisar > 0
        || this.permissoes.Deletar > 0
        || this.permissoes.Inserir > 0
        || this.permissoes.Editar > 0
        // || (params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
      ) {
        this.Authorizer.QueryOnline(procedure, params).then(res => {
          const resultado: any = res;
          try {
            if (Array.isArray(resultado)) {
              next(resultado);
              this.alertService.showLoader('Cargando', 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.error.Message });
              console.log('resultado.error.StackTrace: ', resultado.error.StackTrace);
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação' })
      }


    } else {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
      });
    }
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
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação' })

    }
  }


}
