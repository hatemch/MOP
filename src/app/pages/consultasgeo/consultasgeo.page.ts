import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { MapService } from 'src/app/services/map.service';
import { IonicSelectableComponent } from 'ionic-selectable';

//MODELS
import { ConsultaGeo } from "../../models/consultageo";
import { Segmento } from '../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';

@Component({
  selector: 'app-consultasgeo',
  templateUrl: './consultasgeo.page.html',
  styleUrls: ['./consultasgeo.page.scss'],
})
export class ConsultasgeoPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  public tipoPesquisaCheck = [
    { id: 1, nome: 'Album', isChecked: true },
    { id: 2, nome: 'Antecedentes' },
    { id: 3, nome: 'Condutor' },
    { id: 4, nome: 'Individuo' },
    { id: 5, nome: 'Veículo' },
    { id: 6, nome: 'Veículo em restrição' },
    { id: 7, nome: 'Todos' }

  ];
  public activeLeyendAll = false;
  public activeLeyendMarket = false;
  public activeMarker = false;
  public color: string;

  static CRUD_READ: string = 'READ';
  static APP_NAME: String = environment.AppName;

  public mapURL: any;

  public permissoes = {
    Route: '',
    Pesquisar: 0

  }; // Permissoes do modulo para o usuario logado
  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];



  public user = new User();
  public consultaGeos: Array<ConsultaGeo> = [];
  public consultaGeo = new ConsultaGeo();

  constructor(
    private mapService: MapService,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    // private file: File
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();
  }

  ionViewDidEnter() {
    this.getSegmentos();
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.consultaGeo.segmento = localStorage.getItem('orgaoUsuario').trim();
      this.CarregaSegmentoGrupos()

    }
  }

  private getSegmentos() {
    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.segmento.trim();
        segmento.segmento = value.segmento.trim();

        return segmento;
      });

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
      }

      console.log('segmentos', this.segmentos);

    });
  }
  CarregaSegmentoGrupos() {
    console.log(this.consultaGeo.segmento);
    this.consultarGruposSegmento(this.consultaGeo.segmento);
    this.activeMarker = false;
    this.activeLeyendMarket = false;
  }
  private consultarGruposSegmento(segmento: string) {
    this.consultaGeo.grupo = '';
    this.consultaGeo.usuario = '';
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.consultaGeo.grupo = localStorage.getItem('codigoUnidade');
      this.user.nomegrupo = localStorage.getItem('unidadeUsuario')
    }
    if (!segmento) {
      this.grupos = [];
      this.users = [];
      return;
    }
    else {
      this.sendRequest('spConsultarGruposSegmento', {
        StatusCRUD: 'READ',
        formValues: { 'segmento': segmento }
      }, (resultado) => {

        let results = JSON.parse(atob(resultado.results));

        console.log('grupos', results);

        this.grupos = results.map(function callback(value) {
          let grupo = new Grupo();
          grupo.codigo = value.CODIGO;
          grupo.nome = value.NOME;

          return grupo;
        });
        //logic to fill the grupos array with the unidade of the user SUPERVISOR UNIDADE
        if (this.consultaGeo.grupo) {
          this.grupos[0].codigo = this.consultaGeo.grupo
          this.grupos[0].nome = this.user.nomegrupo;
          this.CarregaSegmentoGrupoUsuarios();
          console.log('grupos', this.grupos);
          return;
        }
        //

        if (this.grupos.length == 0) {
          this.grupos = [];
        } else if (this.grupos.length > 1) {
          let grupo = new Grupo();
          grupo.codigo = 'TODOS';
          grupo.nome = 'TODOS';
          this.grupos.unshift(grupo);
        }


      });
    }
  }
  CarregaSegmentoGrupoUsuarios() {
    this.consultarUsuarioGrupo(this.consultaGeo.grupo == 'TODOS' ? '' : this.consultaGeo.grupo);
  }
  private consultarUsuarioGrupo(grupo: string) {
    this.consultaGeo.usuario = '';
    if (!grupo) {
      this.users = [];
      return;
    }
    else {
      this.sendRequest('spConsultarUsuarioGrupo', {
        StatusCRUD: 'READ',
        formValues: { 'grupo': grupo }
      }, (resultado) => {

        let results = JSON.parse(atob(resultado.results));


        this.users = results.map(function callback(value) {
          let user = new User();
          user.codigo = value.CODIGO;
          user.nome = value.NOME;

          return user;
        });

        if (this.users.length > 1) {
          let userTodos = new User();
          userTodos.codigo = 'TODOS';
          userTodos.nome = 'TODOS';
          this.users.unshift(userTodos);
        }

        console.log('users', this.users);
      });
    }
  }
  private ConsultaLocalizacao(_statusCRUD, _formValues, exportExcel) {
    this.sendRequest('spConsultaGeo', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.consultaGeos = results.map(function callback(value) {
        let consultaGeo = new ConsultaGeo();
        consultaGeo.codigo = value.codigo;
        consultaGeo.usuario = value.USUARIO;
        value.TIPO ? consultaGeo.tipo = value.TIPO.trim() : null;
        if (consultaGeo.tipo == "Veiculos") {
          consultaGeo.tipo = "Veículos";
        }
        consultaGeo.data_posicao = value.DATA_CONSULTA;
        consultaGeo.latitude = value.LATITUDE;
        consultaGeo.longitude = value.LONGITUDE;
        consultaGeo.pim = value.PIM;
        consultaGeo.imei = value.IMEI;
        consultaGeo.versao = value.VERSAO;
        consultaGeo.segmento = value.SEGMENTO;
        consultaGeo.grupo = value.GRUPO
        return consultaGeo;
      });

      console.log("this.consultaGeos.length", this.consultaGeos.length)

      if (exportExcel) {
        this.mapURL = "";
        if (this.consultaGeos.length == 0) {
          this.alertService.loaderDismiss();
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
          return;
        }

        this.Authorizer.convertToExcel(JSON.parse(atob(resultado.results)), "consultasGeo");
        this.alertService.loaderDismiss();
      } else {
        this.CargarMapa();
      }

    });
  }

  async CargarMapa() {
    let colorMarket: any;
    if (this.consultaGeos.length == 0) {
      this.mapURL = "";
      this.alertService.loaderDismiss();
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
      return;
    }
    let token = await this.mapService.getToken();
    for (let index = 0; index < this.consultaGeos.length; index++) {
      let customMarkert =

        '<p><b> Órgão:</b>' + this.consultaGeos[index].segmento + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Usu&aacuterio:</b> ' + this.consultaGeos[index].usuario + '</p>' +
        '<p ><b>Unidade:</b> ' + this.consultaGeos[index].grupo + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Tipo consulta:</b> ' + this.consultaGeos[index].tipo + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Data:</b> ' + this.consultaGeos[index].data_posicao + '</p>' +
        // '<p><b>PIM:</b> ' + this.consultaGeos[index].pim + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Vers&#227o:</b> ' + this.consultaGeos[index].versao + '</p>' +
        '<p><b>Latitude: </b>' + this.consultaGeos[index].latitude + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Longitude:</b> ' + this.consultaGeos[index].longitude + '</p>';

      this.consultaGeos[index].segmento = this.consultaGeos[index].segmento.trim();
      this.consultaGeos[index].segmento ? this.consultaGeos[index].segmento.trim() : null;
      switch (this.consultaGeos[index].segmento) {
        case "Bombeiro":
          colorMarket = 'GOLD'
          break;
        case "Policia Federal":
          colorMarket = 'BLUE'
          break;
        case "Policia Rodoviaria":
          colorMarket = 'VIOLET'
          break;

        case "DETRAN":
          colorMarket = 'GOLD'
          break;
        case "Policia Civil":
          colorMarket = 'GREEN'
          break;
        case "Policia Militar":
          colorMarket = 'RED'
          break;
        case "SSP/BA":
          colorMarket = 'BLACK'
          break;
        case "SEMTRAN":
          colorMarket = 'GREEN'
          break;
      }
      let params = {
        'token': token,
        'latitude': this.consultaGeos[index].latitude,
        'longitude': this.consultaGeos[index].longitude,
        'marker': customMarkert,
        'color': colorMarket,

      }

      if (index > (this.consultaGeos.length - 5)) {
        await this.mapService.setCoordenates(params);
      } else {
        this.mapService.setCoordenates(params);
      }


    }
    let params = new HttpParams()
      .set("token", token)

    this.mapURL = this.mapService.getMapaURLMassive(params);

  }
  getLocalizacao(exportExcel) {

    // Validate all the checks pesquisa
    if (!this.consultaGeo.album && !this.consultaGeo.antecedentes && !this.consultaGeo.condutores && !this.consultaGeo.individuo
      && !this.consultaGeo.veiculos && !this.consultaGeo.veiculoRestricao && !this.consultaGeo.todos
    ) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Preencha ao menos um campo do Tipo pesquisa' });
      return;
    }

    // if someone check 'todos' in 'tipo pesquisa' others option are sent empty
    this.alertService.loaderPresent();
    this.ConsultaLocalizacao(ConsultasgeoPage.CRUD_READ, {
      'segmento': this.consultaGeo.segmento == 'TODOS' ? '' : this.consultaGeo.segmento,
      'grupo': this.consultaGeo.grupo == 'TODOS' ? '' : this.consultaGeo.grupo,
      'usuario': this.consultaGeo.usuario == 'TODOS' ? '' : this.consultaGeo.usuario,
      'dataInicio': this.consultaGeo.dataInicio,
      'dataFin': this.consultaGeo.dataFin,
      'album': this.consultaGeo.todos ? '' : this.consultaGeo.album,
      'antecedentes': this.consultaGeo.todos ? '' : this.consultaGeo.antecedentes,
      'condutores': this.consultaGeo.todos ? '' : this.consultaGeo.condutores,
      'individuo': this.consultaGeo.todos ? '' : this.consultaGeo.individuo,
      'veiculos': this.consultaGeo.todos ? '' : this.consultaGeo.veiculos,
      'veiculoRestricao': this.consultaGeo.todos ? '' : this.consultaGeo.veiculoRestricao
    }, exportExcel)
    this.activeMarkets();

  }
  activeMarkets() {
    switch (this.consultaGeo.segmento) {
      case 'TODOS':
        this.activeLeyendAll = true;
        this.activeLeyendMarket = false;
        this.activeMarker = false;
        break;

      case "":
        this.activeLeyendAll = true;
        this.activeLeyendMarket = false;
        this.activeMarker = false;
        break;

      case "Bombeiro":
        this.activeLeyendAll = false;
        this.activeLeyendMarket = true;
        this.activeMarker = true;
        this.color = "warning";
        break;

      case "Policia Federal":
        this.activeLeyendAll = false;
        this.activeLeyendMarket = true;
        this.activeMarker = true;
        this.color = "primary";
        break;

      case "Policia Rodoviaria":
        this.activeLeyendAll = false;
        this.activeLeyendMarket = true;
        this.activeMarker = true;
        this.color = "tertiary";
        break;

      case "DETRAN":
        this.activeLeyendAll = false;
        this.activeLeyendMarket = true;
        this.activeMarker = true;
        this.color = "warning";
        break;

      case "Policia Civil":
        this.activeLeyendAll = false;
        this.activeLeyendMarket = true;
        this.activeMarker = true;
        this.color = "success";

        break;
      case "Policia Militar":
        this.activeLeyendAll = false;
        this.activeLeyendMarket = true;
        this.activeMarker = true;
        this.color = "danger";
        break;

      case "SSP/BA":
        this.activeLeyendAll = false;
        this.activeLeyendMarket = true;
        this.activeMarker = true;
        this.color = "dark";
        break;
    }

  }
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/93']);
  }
  // NEEDED FUNCTIONS
  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    })

    if (permissaoModulo.length === 1) {
      this.permissoes = {
        Route: permissaoModulo[0].Route,
        Pesquisar: permissaoModulo[0].Pesquisar

      };
    } else {
      // this.alertService.presentAlert({
      //   pTitle: 'SEM PERMISSÃO', pSubtitle: ModulosPage.APP_NAME, pMessage: 'Houve um problema nas permissoes do modulo: ' + this.router.url
      // });
    }
  }


  /**
     * Autor: Lina Jimenez 
     * Data: 04/12/2019
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
        ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        // || (procedure === 'spConsultaLocalizacao')
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
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: ConsultasgeoPage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: ConsultasgeoPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: ConsultasgeoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
      console.log('armando');
    }
  }

  public exportarExcel() {

    // Validate all the checks pesquisa
    if (!this.consultaGeo.album && !this.consultaGeo.antecedentes && !this.consultaGeo.condutores && !this.consultaGeo.individuo
      && !this.consultaGeo.veiculos && !this.consultaGeo.veiculoRestricao && !this.consultaGeo.todos
    ) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Preencha ao menos um campo do Tipo pesquisa' });
      return;
    }

    const path = 'consultas_geo/';
    //const publicPath = '/mop/consultasgeo/';
    const nomearquivo = path.substring(0, path.length - 1) + Date.now().toString();

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (this.permissoes.Pesquisar > 0) {

        // if someone check 'todos' in 'tipo pesquisa' others option are sent empty
        const _params = {
          StatusCRUD: 'READ',
          formValues: {
            segmento: this.consultaGeo.segmento,
            grupo: this.consultaGeo.grupo,
            usuario: this.consultaGeo.usuario,
            dataInicio: this.consultaGeo.dataInicio,
            dataFin: this.consultaGeo.dataFin,
            album: this.consultaGeo.todos ? '' : this.consultaGeo.album,
            antecedentes: this.consultaGeo.todos ? '' : this.consultaGeo.antecedentes,
            condutores: this.consultaGeo.todos ? '' : this.consultaGeo.condutores,
            individuo: this.consultaGeo.todos ? '' : this.consultaGeo.individuo,
            veiculos: this.consultaGeo.todos ? '' : this.consultaGeo.veiculos,
            veiculoRestricao: this.consultaGeo.todos ? '' : this.consultaGeo.veiculoRestricao
          },
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProcExportData('ExportarXls', 'spConsultaGeo', _params, path, nomearquivo).then((res: string) => {
          const resultado = res.split(';');
          if (resultado[0] === 'ok') {
            window.open(this.env.API_HOST + this.env.NAME_HOST + path + resultado[1]);
          } else {
            this.alertService.presentAlert({
              pTitle: 'ERRO', pSubtitle: ConsultasgeoPage.APP_NAME, pMessage: 'Falha ao fazer o arquivo'
            });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: ConsultasgeoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack();
    }
  }

}
