import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { MapService } from 'src/app/services/map.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Geolocation } from '@ionic-native/geolocation/ngx';

//MODELS
import { Localizacao } from "../../models/localizacao";
import { Segmento } from '../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';

@Component({
  selector: 'app-localizacao',
  templateUrl: './localizacao.page.html',
  styleUrls: ['./localizacao.page.scss'],
})
export class LocalizacaoPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static APP_NAME: String = environment.AppName;
  // static APP_NAME: string = EnvService.name;

  public mapURL: any;

  public permissoes = {
    Route: '',
    Pesquisar: 0

  }; // Permissoes do modulo para o usuario logado

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];

  public activeLeyendAll: boolean = false;
  public activeLeyendMarket: boolean = false;
  public activeMarket: boolean = false;
  public activeMarketSSPBA: boolean = false;
  public color = '';
  public current_datetime = new Date()
  //change the getDate() for getMonth() only for dev
  // public hour = this.current_datetime.getFullYear()+ "-" + (this.current_datetime.getMonth() + 1) + "-" +  this.current_datetime.getDate() + " " +  (this.current_datetime.getHours()-1) + ":" + this.current_datetime.getMinutes() + ":" + this.current_datetime.getSeconds() + "." + this.current_datetime.getMilliseconds()
  // public maxHour =  this.current_datetime.getFullYear()+ "-" + (this.current_datetime.getMonth() + 1)  + "-" + this.current_datetime.getDate() + " " +  this.current_datetime.getHours() + ":" + this.current_datetime.getMinutes() + ":" + this.current_datetime.getSeconds() + "." + this.current_datetime.getMilliseconds()

  public hour = this.current_datetime.getFullYear() + "-" + this.current_datetime.getDate() + "-" + (this.current_datetime.getMonth() + 1) + " " + (this.current_datetime.getHours() - 1) + ":" + this.current_datetime.getMinutes() + ":" + this.current_datetime.getSeconds() + "." + this.current_datetime.getMilliseconds()
  public maxHour = this.current_datetime.getFullYear() + "-" + this.current_datetime.getDate() + "-" + (this.current_datetime.getMonth() + 1) + " " + this.current_datetime.getHours() + ":" + this.current_datetime.getMinutes() + ":" + this.current_datetime.getSeconds() + "." + this.current_datetime.getMilliseconds()

  public formatHourColorMarket = this.current_datetime.getDate() + "/" + (this.current_datetime.getMonth() + 1) + "/" + this.current_datetime.getFullYear() + " " + (this.current_datetime.getHours() - 1) + ":" + this.current_datetime.getMinutes() + ":" + this.current_datetime.getSeconds()
  public formatMaxHourColorMarket = this.current_datetime.getDate() + "/" + (this.current_datetime.getMonth() + 1) + "/" + this.current_datetime.getFullYear() + " " + (this.current_datetime.getHours()) + ":" + this.current_datetime.getMinutes() + ":" + this.current_datetime.getSeconds()



  public user = new User();
  public localizacaos: Array<Localizacao> = [];
  public localizacao = new Localizacao();
  public currentLatitude: any = '';
  public currentLongitude: any = '';

  constructor(
    private mapService: MapService,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,

  ) { }





  async CargarMapa() {

    this.formatHourColorMarket = this.formatHourColorMarket.substring(3, 5) + '/' +
      this.formatHourColorMarket.substring(0, 2) + '/' +
      this.formatHourColorMarket.substring(6, 10) + ' ' +
      this.formatHourColorMarket.substring(11, 19);

    this.formatMaxHourColorMarket = this.formatMaxHourColorMarket.substring(3, 5) + '/' +
      this.formatMaxHourColorMarket.substring(0, 2) + '/' +
      this.formatMaxHourColorMarket.substring(6, 10) + ' ' +
      this.formatMaxHourColorMarket.substring(11, 19);

    let colorMarket: any;
    if (this.localizacaos.length == 0) {
      this.mapURL = "";
      this.alertService.loaderDismiss();
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: LocalizacaoPage.APP_NAME, pMessage: 'Sem dados a mostrar' });
      return;
    }
    let token = await this.mapService.getToken();
    for (let index = 0; index < this.localizacaos.length; index++) {

      this.localizacaos[index].grupo ? this.localizacaos[index].grupo : this.localizacaos[index].grupo = "";
      let customMarkert =

        '<p><b> Órgão:</b>' + this.localizacaos[index].segmento + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Usu&#225rio:</b> ' + this.localizacaos[index].usuario + '</p>' +
        '<p ><b>Unidade:</b> ' + this.localizacaos[index].grupo + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Data:</b> ' + this.localizacaos[index].data_atualizacao + '</p>' +
        '<p><b>PIM:</b> ' + this.localizacaos[index].pim + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Versão:</b> ' + this.localizacaos[index].versao + '</p>' +
        '<p><b>Latitude: </b>' + this.localizacaos[index].latitude + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Longitude:</b> ' + this.localizacaos[index].longitude + '</p>';
      this.localizacaos[index].segmento = this.localizacaos[index].segmento.trim();
      this.localizacaos[index].data_atualizacao = this.localizacaos[index].data_atualizacao.substring(3, 5) + '/' +
        this.localizacaos[index].data_atualizacao.substring(0, 2) + '/' +
        this.localizacaos[index].data_atualizacao.substring(6, 10) + ' ' +
        this.localizacaos[index].data_atualizacao.substring(11, 19);




      if (Date.parse(this.localizacaos[index].data_atualizacao) > Date.parse(this.formatHourColorMarket) && Date.parse(this.localizacaos[index].data_atualizacao) < Date.parse(this.formatMaxHourColorMarket)) {
        colorMarket = 'GREEN'
      }
      else {
        colorMarket = 'RED'
      }
      // switch (this.localizacaos[index].segmento) {


      //   case "Bombeiro":
      //     colorMarket = 'GOLD';

      //     break;
      //   case "Policia Federal":
      //     colorMarket = 'BLUE';

      //     break;
      //   case "Policia Rodoviaria":
      //     colorMarket = 'VIOLET';

      //     break;

      //   case "DETRAN":
      //     colorMarket = 'GOLD';

      //     break;
      //   case "Policia Civil":
      //     colorMarket = 'GREEN';

      //     break;
      //   case "Policia Militar":
      //     colorMarket = 'RED';

      //     break;
      //   case "SSP/BA":
      //     colorMarket = 'BLACK';


      //     break;
      //   case "SEMTRAN":
      //     colorMarket = 'GREEN'
      //     break;
      // }
      let params = {
        'token': token,
        'latitude': this.localizacaos[index].latitude,
        'longitude': this.localizacaos[index].longitude,
        'marker': customMarkert,
        'color': colorMarket,

      }

      if (index > (this.localizacaos.length - 5)) {
        await this.mapService.setCoordenates(params);
      } else {
        this.mapService.setCoordenates(params);
      }


    }
    let params = new HttpParams()
      .set("token", token)

    this.mapURL = this.mapService.getMapaURLMassive(params);

  }

  ngOnInit() {
    this.getPermissoesModulo();
    this.getSegmentos();
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
   
  }
  ionViewDidEnter() {
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.localizacao.segmento = localStorage.getItem('orgaoUsuario').trim();
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
      this.localizacao.segmento = '';
      console.log('segmentos', this.segmentos);

    });

  }
  CarregaSegmentoGrupos() {
    this.activeLeyendMarket = false;
    this.activeMarket = false;
    console.log(this.localizacao.segmento);
    this.consultarGruposSegmento(this.localizacao.segmento);
    // this.activeMarkers();
  }

  private consultarGruposSegmento(segmento: string) {
    
    this.localizacao.grupo = '';
    this.localizacao.usuario = '';
    this.grupos = [];
    this.users = [];
    if(this.user.perfil=='SUPERVISOR DE UNIDADE'){
      this.localizacao.grupo=localStorage.getItem('codigoUnidade');
      this.user.nomegrupo=localStorage.getItem('unidadeUsuario')
    }
    if (!segmento) {
      this.grupos = [];
      return
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
        if (this.localizacao.grupo) {
          this.grupos[0].codigo = this.localizacao.grupo
          this.grupos[0].nome = this.user.nomegrupo;
          this.CarregaSegmentoGrupoUsuarios();
          console.log('grupos', this.grupos);
          return;
        }
        //
        if (this.grupos.length == 0) {
          this.users = [];
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

    this.consultarUsuarioGrupo(this.localizacao.grupo == 'TODOS' ? '' : this.localizacao.grupo);
  }

  private consultarUsuarioGrupo(grupo: string) {
    this.localizacao.usuario = '';
    this.users = [];
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
          user.CODIGO = value.CODIGO;
          user.NOME = value.NOME;

          return user;
        });

        console.log('users', this.users);

        if (this.users.length > 1) {
          let userTodos = new User();
          userTodos.CODIGO = 'TODOS';
          userTodos.NOME = 'TODOS';
          this.users.unshift(userTodos);
        }

      });
    }
  }


  private ConsultaLocalizacao(_statusCRUD, _formValues) {
    this.sendRequest('spConsultaLocalizacao', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.localizacaos = results.map(function callback(value) {
        let localizacao = new Localizacao();
        localizacao.codigo = value.codigo;
        localizacao.usuario = value.USUARIO;
        localizacao.data_posicao = value.data_posicao;
        localizacao.data_atualizacao = value.data_atualizacao.substring(8, 10) + '/' + value.data_atualizacao.substring(5, 7) + '/' + value.data_atualizacao.substring(0, 4) + ' ' + value.data_atualizacao.substring(11, 19);
        localizacao.latitude = value.latitude;
        localizacao.longitude = value.longitude;
        localizacao.pim = value.pim;
        localizacao.imei = value.imei;
        localizacao.versao = value.versao;
        localizacao.dataExpiracaoSesao = value.dataExpiracaoSesao;

        //localizacao.data_insercao = value.data_insercao.substring(8, 10) + '/' + value.data_insercao.substring(5, 7) + '/' + value.data_insercao.substring(0, 4) + ' ' + value.data_insercao.substring(11, 19);
        localizacao.segmento = value.SEGMENTO;
        localizacao.grupo = value.GRUPO
        return localizacao;
      });

      console.log("this.localizacaos.length", this.localizacaos.length)

      this.CargarMapa();

    });
  }
  getLocalizacao() {

    this.alertService.loaderPresent();

    this.ConsultaLocalizacao(LocalizacaoPage.CRUD_READ, {
      'segmento': this.localizacao.segmento == 'TODOS' ? '' : this.localizacao.segmento,
      'grupo': this.localizacao.grupo == 'TODOS' ? '' : this.localizacao.grupo,
      'usuario': this.localizacao.usuario == 'TODOS' ? '' : this.localizacao.usuario,
      'agenteOnline': this.localizacao.agenteOnline == false ? '' : this.localizacao.agenteOnline,
      'agenteOffline': this.localizacao.agenteOffline == false ? '' : this.localizacao.agenteOffline,
      'horaBase': this.hour,
      'horaTope': this.maxHour


    })

    this.activeMarkers();

  }
  activeMarkers() {
    this.activeLeyendAll = true;
    // switch (this.localizacao.segmento) {
    //   case 'TODOS':

    //     this.activeLeyendAll = true;
    //     this.activeLeyendMarket = false;
    //     break;
    //   case '':

    //     this.activeLeyendAll = true;
    //     this.activeLeyendMarket = false;
    //     break;
    //   case "Bombeiro":
    //     this.activeMarket = true;
    //     this.color = "warning"
    //     this.activeLeyendAll = false;
    //     this.activeLeyendMarket = true;

    //     break;
    //   case "Policia Federal":
    //     this.activeMarket = true;
    //     this.color = "primary"
    //     this.activeLeyendAll = false;
    //     this.activeLeyendMarket = true;

    //     break;
    //   case "Policia Rodoviaria":
    //     this.activeMarket = true;
    //     this.color = "tertiary"
    //     this.activeLeyendAll = false;
    //     this.activeLeyendMarket = true;

    //     break;
    //   case "DETRAN":
    //     this.activeMarket = true;
    //     this.color = "warning"
    //     this.activeLeyendAll = false;
    //     this.activeLeyendMarket = true;

    //     break;
    //   case "Policia Civil":
    //     this.activeMarket = true;
    //     this.color = "success"
    //     this.activeLeyendAll = false;
    //     this.activeLeyendMarket = true;

    //     break;
    //   case "Policia Militar":
    //     this.activeMarket = true;
    //     this.color = "danger"
    //     this.activeLeyendAll = false;
    //     this.activeLeyendMarket = true;

    //     break;
    //   case "SSP/BA":
    //     this.activeMarket = true;
    //     this.color = "dark"
    //     this.activeLeyendAll = false;
    //     this.activeLeyendMarket = true;

    //     break;

    // }
  }
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/97']);
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
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: LocalizacaoPage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: LocalizacaoPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: LocalizacaoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
      console.log('armando');
    }
  }

}
