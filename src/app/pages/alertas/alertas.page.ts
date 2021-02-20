import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AlertController, NavController, Events, ModalController } from '@ionic/angular';
import { NgForm } from '@angular/forms';

//MODELS
import { Alerta } from '../../models/alerta';
import { Page } from 'src/app/models/page';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
})
export class AlertasPage implements OnInit {

  // private APP_NAME: string = this.env.AppName;

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static APP_NAME: string = EnvService.name;

  private APP_NAME: string = this.env.AppName;

  public AppName: String = environment.AppName;

  public nomePesquisar: string = "";

  familia: Object[];

  public CodigoUsuario: any;
  public NomeUsuarioLogado: string;

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public page = new Page();
  public columns = [{ text: 'Origem', bold: true }, { text: 'Destino', bold: true }, { text: 'Data do Alerta', bold: true }, { text: 'Tipo', bold: true }, { text: 'Mensagem', bold: true }];

  public alertas: Array<Alerta> = [];
  public selected: boolean = false;

  public alerta = new Alerta();
  public data: any[];
  showTable: boolean;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();

  }

  ionViewDidEnter() {
    // this.CRUDAlertas('READ','','table');
    // this.showTable = false;
  }

  // public CRUDAlertas(_statusCRUD, _formValues, _option: any) {
  //   this.sendRequest('spConsultaAlerta', {
  //     StatusCRUD: _statusCRUD,
  //     formValues: _formValues
  //   }, (resultado) => {

  //     let results = JSON.parse(atob(resultado.results));

  //     this.alertas = results.map(function callback(value) {

  //       let alerta = new Alerta();

  //       // alerta.tipoDestino = value.tipoDestino;
  //       // alerta.dataMensagem = value.dataMensagem;
  //       // alerta.tipo = value.tipo;
  //       // alerta.mensagem = value.mensagem;

  //       switch (value.TIPO_DESTINO) {
  //         case "T":
  //           alerta.tipoDestino = 'Todos';
  //           break;
  //         case 'S':
  //           alerta.tipoDestino = 'Segmento';
  //           break;
  //         case 'G':
  //           alerta.tipoDestino = 'Grupo';
  //           break;
  //         case 'U':
  //           alerta.tipoDestino = 'Usuário';
  //           break;
  //         default:
  //           break;
  //       }

  //       if (value.DATA_MENSAGEM.length >= 10) {
  //         alerta.dataMensagem = value.DATA_MENSAGEM.substring(8, 10) + '/' +
  //           value.DATA_MENSAGEM.substring(5, 7) + '/' +
  //           value.DATA_MENSAGEM.substring(0, 4) + ' ' +
  //           value.DATA_MENSAGEM.substring(11, 22);
  //       }
  //       alerta.tipo = value.TIPO;
  //       if (value.MENSAGEM) {
  //         alerta.mensagem = value.MENSAGEM;
  //         alerta.mensagem = alerta.mensagem.substring(0, 50);
  //       }
  //       return alerta;
  //     });

  //     console.log('this.alertas', this.alertas);

  //     if (_option == 'table') {
  //       if (this.alertas.length == 0) {
  //         this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
  //       }
  //       this.showTable = true;
  //       // this.showMapScreem = false;
  //       // this.mapURL = "";
  //     }

  //   });
  // }

  public GetTableData(form: NgForm) {
    this.selected = true;
    this.sendRequest('spConsultaAlerta', {
      StatusCRUD: 'READ',
      formValues: form.value
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.alertas = results.map(function callback(value) {
        let alerta = new Alerta();
        // alerta.tipoDestino = value.TIPO_DESTINO;
        alerta.usuario_origem = value.USUARIO_ORIGEM

        switch (value.TIPO_DESTINO) {
          case 'T':
            alerta.tipoDestino = 'Todos';
            break;
          case 'S':
            alerta.tipoDestino = 'Segmento : ' + value.SEGMENTO;
            break;
          case 'G':
            alerta.tipoDestino = 'Grupo: ' + value.GRUPO_NOME;
            break;
          case 'U':
            alerta.tipoDestino = 'Usuário: ' + value.USUARIO_NOME;
            break;
          default:
            break;
        }

        // alerta.dataMensagem = value.DATA_MENSAGEM;
        if (value.DATA_MENSAGEM.length >= 10) {
          alerta.dataMensagem = value.DATA_MENSAGEM.substring(8, 10) + '/' +
            value.DATA_MENSAGEM.substring(5, 7) + '/' +
            value.DATA_MENSAGEM.substring(0, 4) + ' ' +
            value.DATA_MENSAGEM.substring(11, 22);
        }
        alerta.tipo = value.TIPO;
        if (value.MENSAGEM) {
          alerta.mensagem = value.MENSAGEM;
          alerta.mensagem = alerta.mensagem.substring(0, 50);
        }

        return alerta;
      });




      console.log('table data  :', this.alertas)
      if (this.alertas.length == 0) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });

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
    this.router.navigate(['/menu/options/tabs/main/93']);
  }
  NewAlerta() {
    this.router.navigate(['add-alerta']);
  }

  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (((params.StatusCRUD == "CREATE") && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
        // || (procedure === 'spConsultaAlerta')
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
