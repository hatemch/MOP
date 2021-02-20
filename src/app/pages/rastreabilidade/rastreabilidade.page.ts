import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController, NumericValueAccessor } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
//import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { ConsultaInfracaoModalPageModule } from '../consultaInfracaomodal/consultainfracaomodal.module'
import { ConsultaInfracaoModalPage } from '../consultaInfracaomodal/consultainfracaomodal.page';
import { environment } from "../../../environments/environment.prod";
import leaflet from 'leaflet';
import { Rastreabilidade } from "../../models/rastreabilidade";
import { Segmento } from '../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';
import { MapService } from 'src/app/services/map.service';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-rastreabilidade',
  templateUrl: './rastreabilidade.page.html',
  styleUrls: ['./rastreabilidade.page.scss'],
})
export class RastreabilidadePage implements OnInit {

  map: any;
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

  public user = new User();
  public rastreabilidades: Array<Rastreabilidade> = [];
  public rastreabilidade = new Rastreabilidade();


  public dataReturned: any = 'Dados';
  public tiporast: boolean = false;

  public localo: any;
  public center: leaflet.PointTuple;
  private itens: any;

  public Datagrup: any = [];
  // public Datagrup: any[] = [
  //   {
  //     data_posicao: 0,
  //     data_posicao2: 0
  //   }
  // ];

  public QuantidadeInfracoesResult: Number = 0;

  public InfracoesOriginal: any[] = [
    {
      NumeroAuto: 'XXXXXXXX',
      Placa: "XXX-XXXX"
    }
  ];

  constructor(
    private mapService: MapService,
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    private router: Router,
    public modalController: ModalController
  ) {

  }


  ngOnInit() {
    this.getPermissoesModulo();
    this.getSegmentos();
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
  }
  ionViewDidEnter() {
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.rastreabilidade.segmento = localStorage.getItem('orgaoUsuario').trim();
      this.CarregaSegmentoGrupos()

    }
  }

  reciverFeedback(respostaFilho) {
    //console.log(('Foi emitido o evento e chegou no pai >>>> ', respostaFilho);
  }

  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.    
    //console.log(("ionViewWillEnter");
  }

  ionViewWillLeave() {
    // Disparado quando o roteamento de componentes está prestes a ser animado.    
    //console.log(("ionViewWillLeave");
  }

  ionViewDidLeave() {
    // Disparado quando o roteamento de componentes terminou de ser animado.    
    //console.log(("ionViewDidLeave");
  }


  private getSegmentos() {


    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      this.segmentos = [];
      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.segmento.trim();
        segmento.segmento = value.segmento.trim();

        return segmento;

      });


      // if (this.segmentos.length > 1) {
      //   this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
      // }
      console.log('segmentos', this.segmentos);

    });
  }
  CarregaSegmentoGrupos() {
    console.log(this.rastreabilidade.segmento);
    this.rastreabilidade.grupo = '';
    this.rastreabilidade.usuario = '';
    this.rastreabilidade.data_posicao2 = '',
      this.rastreabilidade.horaInicial = '',
      this.rastreabilidade.horaFinal = '',
      this.consultarGruposSegmento(this.rastreabilidade.segmento);
  }

  private consultarGruposSegmento(segmento: string) {
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.rastreabilidade.grupo = localStorage.getItem('codigoUnidade');
      this.user.nomegrupo = localStorage.getItem('unidadeUsuario')
    }
    if (!segmento) {
      this.grupos = [];
      return;
    }
   
    else {
      this.sendRequest('spConsultarGruposSegmento', {
        StatusCRUD: 'READ',
        formValues: { 'segmento': segmento }
      }, (resultado) => {

        let results = JSON.parse(atob(resultado.results));
        console.log("The segmentos ==>", results);

        console.log('grupos', results);

        this.grupos = [];
        this.grupos = results.map(function callback(value) {
          let grupo = new Grupo();
          grupo.codigo = value.CODIGO;
          grupo.nome = value.NOME;

          return grupo;
        });
        //logic to fill the grupos array with the unidade of the user SUPERVISOR UNIDADE
        if (this.rastreabilidade.grupo) {
          this.grupos[0].codigo = this.rastreabilidade.grupo
          this.grupos[0].nome = this.user.nomegrupo;
          this.CarregaSegmentoGrupoUsuarios();
          console.log('grupos', this.grupos);
          return;
        }
        //
        if (this.grupos.length == 0) {
          this.users = [];
        }
        // else if (this.grupos.length > 1) {
        //   let grupo = new Grupo();
        //   grupo.codigo = 'TODOS';
        //   grupo.nome = 'TODOS';
        //   this.grupos.unshift(grupo);
        // }

      });
    }
  }

  CarregaSegmentoGrupoUsuarios() {
    this.rastreabilidade.usuario = '';
    this.rastreabilidade.data_posicao2 = '',
      this.rastreabilidade.horaInicial = '',
      this.rastreabilidade.horaFinal = '',
      this.consultarUsuarioGrupo(this.rastreabilidade.grupo == 'TODOS' ? '' : this.rastreabilidade.grupo);
  }

  private consultarUsuarioGrupo(grupo: string) {
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
        console.log('users', this.users);

        // if (this.segmentos.length > 1) {
        //   let userTodos = new User();
        //   userTodos.codigo = 'TODOS';
        //   userTodos.nome = 'TODOS';
        //   this.users.unshift(userTodos);
        // }

      });
    }
  }

  private getPermissoesModulo() {
    console.log("Iam here");
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    })

    if (permissaoModulo.length === 1) {
      this.permissoes = {
        Route: permissaoModulo[0].Route,
        Pesquisar: permissaoModulo[0].Pesquisar
      };
    } else {
      console.log("Iam here in else");
      // this.alertService.presentAlert({
      //   pTitle: 'SEM PERMISSÃO', pSubtitle: ModulosPage.APP_NAME, pMessage: 'Houve um problema nas permissoes do modulo: ' + this.router.url
      // });
    }
  }

  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || (procedure === 'spCarregaRastreabilidade')
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
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Sem dados a mostrar' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
      console.log('armando');
    }
  }



  CarregaData(form: NgForm, event: Events) {
    if (form.value.usuario == "TODOS") form.value.usuario = '';
    if (!form.value.usuario) { return }
    else {

      let params = {
        'CodigoUsuarioSistema': this.Authorizer.CodigoUsuarioSistema,
        'Hashkey': this.Authorizer.HashKey,
        'CodigoSegumentoGrupo': form.value.usuario
      };

      this.Authorizer.QueryStoreProc('Executar', 'spCarregaData', params).then(res => {
        let resultado: any = res[0];
        try {
          if (resultado.success) {
            //this.alertService.showLoader(resultado.message,1000);
            this.Datagrup = JSON.parse(atob(resultado.results));
            // format date that is showed
            for (let index = 0; index < this.Datagrup.length; index++) {
              this.Datagrup[index].dt_posicao2 = this.Datagrup[index].dt_posicao2.substring(3, 5) + '/' +
                this.Datagrup[index].dt_posicao2.substring(0, 2) + '/' +
                this.Datagrup[index].dt_posicao2.substring(6, 10);
            }
            console.log("The Result Data", this.Datagrup);
            if (this.Datagrup.length == 0) {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Sem dados para o usuário.' });
            }
          }
          else {
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: resultado.message });
            this.navCtrl.navigateRoot('/login');
          }
        } catch (err) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: resultado.message });
          this.navCtrl.navigateRoot('/login');
        }
      });
    }
  }
  CarregaInfracoesUsuario(_statusCRUD, _formValues) {
    console.log("carrega");
    this.sendRequest('spCarregaRastreabilidade', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      console.log("res", results);

      this.rastreabilidades = results.map(function callback(value) {
        let rastreabilidade = new Rastreabilidade();
        rastreabilidade.codigo = value.codigo;
        rastreabilidade.usuario = value.NOME;
        rastreabilidade.data_posicao2 = value.data_posicao.substring(8, 10) + '/' + value.data_posicao.substring(5, 7) + '/' + value.data_posicao.substring(0, 4) + ' ' + value.data_posicao.substring(11, 19);
        rastreabilidade.latitude = value.latitude;
        rastreabilidade.longitude = value.longitude;
        rastreabilidade.pim = value.pim;
        rastreabilidade.imei = value.imei;
        rastreabilidade.versao = value.versao;
        //rastreabilidade.data_posicao2 = value.data_posicao2;
        //rastreabilidade.data_insercao = value.data_insercao.substring(8, 10) + '/' + value.data_insercao.substring(5, 7) + '/' + value.data_insercao.substring(0, 4) + ' ' + value.data_insercao.substring(11, 19);
        rastreabilidade.segmento = value.SEGMENTO;
        rastreabilidade.grupo = value.NomeGrupo;
        return rastreabilidade;
      });

      console.log("this.rastreabilidade.length", this.rastreabilidades.length);

      this.CargarMapa();

    });
  }


  async CargarMapa() {
    let colorMarket: any;
    console.log('rastr', this.rastreabilidades.length);
    if (this.rastreabilidades.length == 0) {
      // if (this.map != undefined || this.map != null) {
      //   console.log("Iam here with map");
      //   this.map.remove();
      // }
      this.mapURL = "";
      this.alertService.loaderDismiss();
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Sem dados a mostrar' });
      return;
    }
    let token = await this.mapService.getToken();
    for (let index = 0; index < this.rastreabilidades.length; index++) {

      this.rastreabilidades[index].grupo ? this.rastreabilidades[index].grupo : this.rastreabilidades[index].grupo = "";
      this.rastreabilidades[index].customMarker =

        '<p><b> Órgão:</b>' + this.rastreabilidades[index].segmento + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Usu&#225rio:</b> ' + this.rastreabilidades[index].usuario + '</p>' +
        '<p ><b>Unidade:</b> ' + this.rastreabilidades[index].grupo + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Data e Hora:</b> ' + this.rastreabilidades[index].data_posicao2 + '</p>' +
        '<p><b>PIM:</b> ' + this.rastreabilidades[index].pim + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Versão:</b> ' + this.rastreabilidades[index].versao + '</p>' +
        '<p><b>Latitude: </b>' + this.rastreabilidades[index].latitude + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Longitude:</b> ' + this.rastreabilidades[index].longitude + '</p>';
      this.rastreabilidades[index].segmento = this.rastreabilidades[index].segmento.trim();
      switch (this.rastreabilidades[index].segmento) {


        case "Bombeiro":
          colorMarket = 'GOLD';

          break;
        case "Policia Federal":
          colorMarket = 'BLUE';

          break;
        case "Policia Rodoviaria":
          colorMarket = 'VIOLET';

          break;

        case "DETRAN":
          colorMarket = 'GOLD';

          break;
        case "Policia Civil":
          colorMarket = 'GREEN';

          break;
        case "Policia Militar":
          colorMarket = 'RED';

          break;
        case "SSP/BA":
          colorMarket = 'BLACK';


          break;
        case "SEMTRAN":
          colorMarket = 'GREEN'
          break;
      }
      let params = {
        'token': token,
        'latitude': this.rastreabilidades[index].latitude,
        'longitude': this.rastreabilidades[index].longitude,
        'marker': this.rastreabilidades[index].customMarker,
        'color': colorMarket,
      }

      // if (index > (this.rastreabilidades.length - 5)) {
      //   await this.mapService.setCoordenates(params);
      // } else {
      //   this.mapService.setCoordenates(params);
      // }


    }
    let params = new HttpParams()
      .set("token", token)

    this.mapURL = this.mapService.getMapaURLMassive(params);

    //LOGIC TO MAP

    if (this.map != undefined || this.map != null) {
      console.log("Iam here with map");
      this.map.remove();
    }

    this.map = leaflet.map('map', {
      center: [this.rastreabilidades[0].latitude, this.rastreabilidades[0].longitude],
      zoom: 14
    });

    leaflet.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attributions: 'MOP',
      maxZoom: 25,
      minZoom: 7
    }).addTo(this.map);

    var pointList: Array<any> = [];

    for (let index = 0; index < this.rastreabilidades.length; index++) {
      if (this.rastreabilidades[index].latitude && this.rastreabilidades[index].longitude) {
        pointList.push(new leaflet.LatLng(this.rastreabilidades[index].latitude, this.rastreabilidades[index].longitude));
      }
    }

    var firstpolyline = new leaflet.Polyline(pointList, {
      color: 'red',
      weight: 2,
      opacity: 1.0,
      smoothFactor: 1
    });
    firstpolyline.addTo(this.map);

    //Create markerts
    let rastreabilidadeLength = this.rastreabilidades.length - 1;

    leaflet.marker([this.rastreabilidades[0].latitude, this.rastreabilidades[0].longitude])
      .bindPopup(this.rastreabilidades[0].customMarker).addTo(this.map);

    leaflet.marker([this.rastreabilidades[rastreabilidadeLength].latitude, this.rastreabilidades[rastreabilidadeLength].longitude])
      .bindPopup(this.rastreabilidades[rastreabilidadeLength].customMarker).addTo(this.map);
    // markerB.bindPopup('FIM :').addTo(this.map);

  }

  goBack() {
    this.navCtrl.back();
  }
  getLocalizacao() {

    if (!this.rastreabilidade.segmento) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Selecione um segmento' });
      return;
    }

    if (!this.rastreabilidade.grupo) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Selecione um grupo' });
      return;
    }

    if (!this.rastreabilidade.usuario) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Selecione um usuário' });
      return;
    }

    if (!this.rastreabilidade.data_posicao2) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: RastreabilidadePage.APP_NAME, pMessage: 'Selecione uma data' });
      return;
    }

    this.alertService.loaderPresent();
    this.CarregaInfracoesUsuario(RastreabilidadePage.CRUD_READ, {
      'segmento': this.rastreabilidade.segmento == 'TODOS' ? '' : this.rastreabilidade.segmento,
      'grupo': this.rastreabilidade.grupo == 'TODOS' ? '' : this.rastreabilidade.grupo,
      'usuario': this.rastreabilidade.usuario == 'TODOS' ? '' : this.rastreabilidade.usuario,
      'DataPosicao': this.rastreabilidade.data_posicao2,
      // 'DataInicial': this.rastreabilidade.dataFinal,
      // 'DataFinal': this.rastreabilidade.dataFinal,
      'HoraInicial': this.rastreabilidade.horaInicial,
      'HoraFinal': this.rastreabilidade.horaFinal
    });


  }


}
