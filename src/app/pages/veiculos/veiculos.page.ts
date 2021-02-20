import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';
import { Veiculo } from 'src/app/models/veiculo';
import { NavController, Events, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-veiculos',
  templateUrl: './veiculos.page.html',
  styleUrls: ['./veiculos.page.scss'],
})
export class VeiculosPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  private APP_NAME: string = this.env.AppName;

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado


  public veiculo = new Veiculo();
  public veiculos: Array<Veiculo> = [];
  public showRestricaoMessage: boolean = false;
  public restricao: string;
  constructor(
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    public modalController: ModalController,
    private router: Router,
    // private activatedRoute: ActivatedRoute
  ) {
    this.getPermissoesModulo();
  }

  ngOnInit() { }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/95']);
  }

  public search(form: NgForm) {

    if (!this.veiculo.placa && !this.veiculo.chassi) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Preencha os campos' });
      return;
    }


    const params = new FormData();

    params.append('placa', this.Authorizer.encripta(this.veiculo.placa ? this.veiculo.placa.toUpperCase() : ''));
    params.append('chassi', this.Authorizer.encripta(this.veiculo.chassi ? this.veiculo.chassi.toUpperCase() : ''));

    // params.append('placa', this.Authorizer.encripta(this.veiculo.placa));
    // params.append('chassi', this.Authorizer.encripta(this.veiculo.chassi));

    this.sendRequestOnline('ConsultaVeiculo', params
      , (resultado) => {

        console.log('resultado.results:', resultado);

        this.veiculos = resultado.map(function callback(value) {
          let veiculo = new Veiculo();

          if (value.codretorno == 0) {
            veiculo.placa = value.placa.toUpperCase();
            veiculo.roubo = value.roubo.trim();
            veiculo.clone = value.clone;
            veiculo.marca = value.marca;
            veiculo.renavam = value.renavam;
            veiculo.chassi = value.chassi;
            veiculo.cor = value.cor;
            veiculo.anomodelo = value.anomodelo;
            veiculo.anofabricacao = value.anofabricacao;
            veiculo.categoria = value.categoria;
            veiculo.combustivel = value.combustivel;
            veiculo.especie = value.especie;
            veiculo.tipo = value.tipo;
            veiculo.nomeproprietario = value.nomeproprietario;
            veiculo.base = value.base;
            veiculo.motor = value.motor;
            veiculo.municipio = value.municipio;
            veiculo.uf = value.ufveiculo;
            veiculo.restricao1 = value.restricao1;
            veiculo.restricaofinanceira = value.restricaofinanceira;
            if(veiculo.restricaofinanceira.trim()=='S'){
              veiculo.restricaofinanceira='SIM'
            }else{
              veiculo.restricaofinanceira='NÃO'
            }

            veiculo.restricaoadministrativa = value.restricaoadministrativa;
            if(veiculo.restricaoadministrativa.trim()=='S'){
              veiculo.restricaoadministrativa='SIM'
            }else{
              veiculo.restricaoadministrativa='NÃO'
            }

            veiculo.restricaojuridica = value.restricaojuridica;
            if(veiculo.restricaojuridica.trim()=='S'){
              veiculo.restricaojuridica='SIM'
            }else{
              veiculo.restricaojuridica='NÃO'
            }

            veiculo.ultimoipva = value.ultimoipva;
            veiculo.isentoipva = value.isentoipva;
            if(veiculo.isentoipva.trim()=='S'){
              veiculo.isentoipva='SIM'
            }else{
              veiculo.isentoipva='NÃO'
            }
            veiculo.totalipva = 'R$'+value.totalipva;
            veiculo.dpvatatual = value.dpvatatual
            veiculo.valormulta = 'R$'+value.valormulta;
            veiculo.totalicenca = value.licencaatual;
            veiculo.dpvatanterior = value.dpvatanterior;
            veiculo.ipvaanterior = value.ipvaanterior;
            veiculo.licencaanterior = value.licencaanterior;
            veiculo.multatramitacao = 'R$'+value.multatramitacao;

            veiculo.telefonePropietario = value.telefonePropietario;
            
            veiculo.dataRouboFurto = value.dataRouboFurto;
            

            veiculo.dataDevolucao = value.dataDevolucao;
            
            


          }
          return veiculo;
        });
        if (this.veiculos[0].roubo.trim() == 'SIM') {
          this.showRestricaoMessage = true;
         
            this.restricao='ROUBO/FURTO!'
          
        }else{
          this.showRestricaoMessage = false;
        }
        if (this.veiculos.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        }

        if (!this.veiculos[0].placa) {
          this.veiculos = [];
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
          return;
        }

        //Assign placa searched
        this.veiculos[0].placa = this.veiculo.placa.toUpperCase();

        // console.log('this.veiculos:', this.veiculos);

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
