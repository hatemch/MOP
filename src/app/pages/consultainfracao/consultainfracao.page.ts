import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController, NumericValueAccessor } from '@ionic/angular';
import { NgForm } from '@angular/forms';
//import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { environment } from "../../../environments/environment";
import { Router } from '@angular/router';
//MODELS
import { Infracao } from '../../models/infracao'
import { Segmento } from '../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';
import { UF } from 'src/app/models/uf';
import { Municipio } from 'src/app/models/municipio';
import { Page } from 'src/app/models/page'
import { Veiculo } from 'src/app/models/veiculo';
//SERVICE
import { MapService } from '../../services/map.service';
import { HttpParams } from '@angular/common/http';
//Libraries
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

//import todo from '../../../assets/imgs'  
// C:\Level33\Conjunto\Mop33Ionic\src\assets\imgs


@Component({
  selector: 'app-consultainfracao',
  templateUrl: './consultainfracao.page.html',
  styleUrls: ['./consultainfracao.page.scss'],
})
export class ConsultaInfracaoPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  static CRUD_READ: string = 'READ';

  public showTable: boolean = false;
  public showMapScreem: boolean = false;

  public disabledata: boolean = true;

  public mapURL: any
  public lengthLocation: any;

  public infracao = new Infracao;
  public user = new User();
  public Infracoes: Array<Infracao> = [];

  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];
  public ufs: Array<Municipio> = [];
  public municipios: Array<Municipio> = [];
  public statusDetran:Array<any>= [
    { id: 1, nome: 'Cancelada' },
    { id: 2, nome: 'Aguardando envio ao detran' },
    { id: 3, nome: 'Enviada ao detran' },
    
  ]

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public page = new Page();

  public imgLogo = environment.logoconsultainfracaoprint;

  //public imgLogo: any;
  public docDefinition: any; //For print all
  public columns = [{ text: 'Auto', bold: true }, { text: 'Código', bold: true }, { text: 'Descrição', bold: true }, { text: 'Data Infração', bold: true }, { text: 'Hora Infração', bold: true }, { text: 'Local', bold: true }, { text: 'Usuário', bold: true }, { text: 'Placa', bold: true }];
  public date: Date = new Date();

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private Eventos: Events,
    private mapService: MapService,
    public modalController: ModalController
  ) { }


  ngOnInit() {
    this.getPermissoesModulo();
    this.getSegmentos();
    this.CarregaMuniciosUF();
    // this.CarregaUFs();
    //   this.getDataUri('../../../assets/imgs/imgconsultainfra.png', function(dataUri) {
    //     // Do whatever you'd like with the Data URI!
    //     this.imgLogo = 'data:image/png;base64,'+ dataUri
    // });

  }

  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.

  }

  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    // if (!this.Authorizer.HashKey) {
    //   this.router.navigate(['/menu/options/tabs/main']);
    // } else {
    //   this.getSegmentos();
    //   this.CarregaUFs();
    // }
    this.showTable = false;
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.infracao.Segmento = localStorage.getItem('orgaoUsuario').trim();
      this.CarregaSegmentoGrupos()

    }
  }
  /* -------------------------- LOAD SELECTS ---------------------------- */
  // SEGMENTO
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

      //FILTER ONLY SEGMENTOS FOR INFRACTION
      this.segmentos = this.segmentos.filter((value) => {
        return value.segmento.trim() == "DETRAN" || value.segmento.trim() == "Policia Militar";
      })

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
      }

      console.log('segmentos', this.segmentos);
    });
  }
  // GRUPOS
  CarregaSegmentoGrupos() {
    this.infracao.Grupo = '';
    this.infracao.usuario = '';
    this.grupos = [];
    this.users = [];
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.infracao.Grupo = localStorage.getItem('codigoUnidade');
      this.user.nomegrupo = localStorage.getItem('unidadeUsuario')
    }
    if (!this.infracao.Segmento || this.infracao.Segmento == "TODOS") { return }
    else {
      this.sendRequest('spConsultarGruposSegmento', {
        StatusCRUD: 'READ',
        formValues: { 'segmento': this.infracao.Segmento }
      }, (resultado) => {

        let results = JSON.parse(atob(resultado.results));

        this.grupos = results.map(function callback(value) {
          let grupo = new Grupo();
          grupo.codigo = value.CODIGO;
          grupo.nome = value.NOME;
          return grupo;
        });
        //logic to fill the grupos array with the unidade of the user SUPERVISOR UNIDADE
        if (this.infracao.Grupo) {
          this.grupos[0].codigo = this.infracao.Grupo
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
          grupo.codigo = 'TODOS'
          grupo.nome = 'TODOS';
          this.grupos.unshift(grupo);
        }
        console.log('grupos', this.grupos);
      });
    }
  }
  // USUARIOS
  CarregaSegmentoGrupoUsuarios() {
    this.infracao.usuario = '';
    this.users = [];
    if (!this.infracao.Grupo || this.infracao.Grupo == "TODOS") { return }
    else {
      this.sendRequest('spConsultarUsuarioGrupo', {
        StatusCRUD: 'READ',
        formValues: { 'grupo': this.infracao.Grupo }
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
          console.log('users', this.users);
        }

      });
    }
  }
  // UF
  CarregaUFs() {
    this.sendRequest('spUFs', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.ufs = results.map(function callback(value) {
        let uf = new UF();
        uf.CodigoBaseUF = value.codigoBaseUF;
        uf.Nome = value.Nome;
        uf.Sigla = value.Sigla;
        return uf;
      });
      console.log('UFS', this.ufs);
    });

  }
  // MUNICIPIOS
  CarregaMuniciosUF() {
    this.municipios = [];
    this.sendRequest('spMunicipiosUser', {
      StatusCRUD: 'READ',
      formValues: { 'UF': "BA" }
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.municipios = results.map(function callback(value) {
        let municipio = new Municipio();
        municipio.codigo = value.codigo;
        municipio.nome = value.nome;
        return municipio;
      });
      if (this.municipios.length > 1) {
        let municipiosTodos = new Municipio();
        municipiosTodos.codigo = 'TODOS';
        municipiosTodos.nome = 'TODOS';
        this.municipios.unshift(municipiosTodos);
        console.log('municipio', this.municipios);
      }
    });
  }

  dataInicio(event) {
    console.log('evento data', event.detail.value)
    if (event.detail.value) { this.disabledata = false }
    else { this.disabledata = true }
  }
  /* -------------------------- END LOAD SELECTS ---------------------------- */
  /* --------------------- LOAD TABLE --------------------------------------- */
  private consultaInfracoes(_statusCRUD, _formValues, _option: any) {

    _formValues.Segmento == "TODOS" ? _formValues.Segmento = '' : null;
    _formValues.Grupo == "TODOS" ? _formValues.Grupo = '' : null;
    _formValues.usuario == "TODOS" ? _formValues.usuario = '' : null;
    _formValues.Municipio == "TODOS" ? _formValues.Municipio = '' : null;

    this.alertService.loaderPresent();
    this.sendRequest('spCarregainfracoes', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.Infracoes = results.map(function callback(value) {
        let infracao = new Infracao();
        infracao.auto = value.NumeroAuto;
        infracao.codigo = value.Codigo;
        infracao.ndetran = value.ndetran;
        infracao.desdobramento_infracao = value.Desdobramento;
        infracao.descricao_infracao = value.Descricao;
        infracao.descricao_infracaoCurta = value.DescricaoCurta;
        // infracao.data_ocorrencia = value.DataInfracao;
        // consultaLista.dataConsulta = value.DATA_CONSULTA;
        if (value.DataInfracao.length >= 10) {
          let month = value.DataInfracao.substring(3, 6);
          switch (month) {
            case 'Jan':
              month = '01';
              break;
            case 'Feb':
              month = '02';
              break;
            case 'Mar':
              month = '03';
              break;
            case 'Apr':
              month = '04';
              break;
            case 'May':
              month = '05';
              break;
            case 'Jun':
              month = '06';
              break;
            case 'Jul':
              month = '07';
              break;
            case 'Aug':
              month = '08';
              break;
            case 'Set':
              month = '09';
              break;
            case 'Oct':
              month = '10';
              break;
            case 'Nov':
              month = '11';
              break;
            case 'Dec':
              month = '12';
              break;

            default:
              month = '00';
              break;
          }
          // value.DataInfracao.substring(11, 22);/

          infracao.data_ocorrencia = value.DataInfracao.substring(8, 10) + '/' + value.DataInfracao.substring(5, 7) + '/' + value.DataInfracao.substring(0, 4);
        }


        infracao.hora_ocorrencia = value.HoraInfracao;
        infracao.local_ocorrencia = value.Local;
        infracao.nome_municipio = value.nome_municipio;
        infracao.usuario = value.Usuario;
        infracao.placa = value.Placa;
        infracao.latitude = value.Latitude;
        infracao.longitude = value.Longitude;
        infracao.pim = value.PIM;
        infracao.imei = value.IMEI;
        //desdobramento_infracao
        //also to print
        infracao.enquadramento = value.Enquadramento;
        infracao.matricula = value.Matricula;
        infracao.marca = value.Marca;
        infracao.especie = value.Especie;
        infracao.renavam = value.Renavam;
        infracao.municipio_veiculo = value.MunicVeiculo;
        infracao.uf_veiculo = value.UfVeiculo;
        infracao.nome_condutor = value.NomeCondutor;
        infracao.cpf_condutor = value.CpfCondutor;
        infracao.cnh_condutor = value.CnhCondutor;
        infracao.condutor_ausente = value.CondutorAusente;
        infracao.nome_municipio = value.MuncInfra;
        infracao.codigo_municipio = value.CodMuncInfra;
        infracao.uf_municipio = value.UfInfra;
        infracao.obs = value.Observacao;
        return infracao;
      });
      console.log('Infracoes', this.Infracoes);
      this.alertService.loaderDismiss();

      if (_option == 'table') {
        if (this.Infracoes.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        }
        this.showTable = true;
        this.showMapScreem = false;
        this.mapURL = "";
      }
      else if (_option == 'map') {
        this.showMapScreem = true;
        this.showMapa(this.Infracoes);
      }
    });
  }

  CarregaInfracoesUsuario(form: NgForm) {
    console.log(form.value);
    if (form.value.Segmento == 'TODOS') { form.value.Segmento = '' }
    if (form.value.DataInicial) {
      if (form.value.DataFinal) {
        this.consultaInfracoes(ConsultaInfracaoPage.CRUD_READ, form.value, 'table')
      } else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Informe a data final!' });
      }
    } else { this.consultaInfracoes(ConsultaInfracaoPage.CRUD_READ, form.value, 'table') }

  }
  /* --------------------- END LOAD TABLE --------------------------------------- */
  /* ------------------------ MAP --------------------------------------- */
  mapa(form: NgForm) {
    console.log(form.value)
    this.showMapScreem = false;
    this.showTable = false;
    this.consultaInfracoes(ConsultaInfracaoPage.CRUD_READ, form.value, 'map');
  }

  async showMapa(location: any) {

    if (this.Infracoes.length == 0) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
      return;
    }
    this.alertService.loaderPresent();
    let token = await this.mapService.getToken();
    if (location.length > 20) {
      this.lengthLocation = 20;
    } else {
      this.lengthLocation = location.length;
    }

    for (let index = 0; index < this.lengthLocation; index++) {

      let params = {
        'token': token,
        'latitude': location[index].latitude,
        'longitude': location[index].longitude,
        'marker': "Usuario: <strong>" + location[index].usuario +
          "</strong><br />Auto: <strong>" + location[index].auto +
          "</strong><br>Placa: <strong>" + location[index].placa +
          "</strong><br />Latitude:<strong>" + location[index].latitude +
          "</strong><br> Longitude:<strong>" + location[index].longitude,
        'color': 'BLUE',

      }
      await this.mapService.setCoordenates(params);
    }

    let params = new HttpParams()
      .set("token", token)
    this.mapURL = this.mapService.getMapaURLMassive(params)
    this.alertService.loaderDismiss();
    this.showMapScreem = true;
    this.showTable = false;
  }

  /* ------------------------ END MAP --------------------------------------- */
  /* ------------------------ PRINT ALL --------------------------------------- */
  // https://davidwalsh.name/convert-image-data-uri-javascript
  //   getDataUri(url, callback) {
  //     var image = new Image();

  //     image.onload = function () {
  //         var canvas = document.createElement('canvas');
  //         canvas.width = 500; // or 'width' if you want a special/scaled size
  //         canvas.height = 500; // or 'height' if you want a special/scaled size

  //         canvas.getContext('2d').drawImage(this, 0, 0);

  //         // Get raw image data
  //         callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

  //         // ... or get as Data URI
  //         callback(canvas.toDataURL('image/png'));
  //     };

  //     image.src = url;
  // }

  imprimirform() {
    var externalDataRetrievedFromServer = this.Infracoes;
    this.docDefinition = {
      info: {
        title: 'Consulta Infrações',
      },
      pageSize: 'A5',
      pageOrientation: 'landscape',
      content: [
        {
          columns: [
            {
              image: this.imgLogo,
              width: 500,
              height: 150,
            }
          ]
        },
        { text: 'Consulta Infrações', style: 'header', alignment: 'center' },
        this.table(externalDataRetrievedFromServer, ['auto', 'codigo', 'descricao_infracao', 'data_ocorrencia', 'hora_ocorrencia', 'local_ocorrencia', 'usuario', 'placa']),
      ],
      styles: {
        header: {
          fontSize: 13,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        subheader: {
          fontSize: 8,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        tableExample: {
          margin: [0, 0, 0, 0]
        },
        tableHeader: {
          bold: true,
          fontSize: 6,
          color: 'black'
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    }
  }

  buildTableBody(data: any, columns: any) {
    console.log("data2:", data);
    console.log("column name2", columns);
    console.log("column name", this.columns);
    var body = [];

    body.push(this.columns);

    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        try {
          dataRow.push(row[column].toString());
        }
        catch {
          dataRow.push("");
        }
      })
      body.push(dataRow);
    });
    console.log("column name finish", body);
    return body;
  }

  table(data: any, columns: any) {
    console.log("data:", data);
    console.log("column namevdata", columns);
    console.log("column name", this.columns);
    return {
      table: {
        headerRows: 1,
        widths: ['13%', '8%', 'auto', 'auto', 'auto', 'auto', 'auto', '10%'],
        body: this.buildTableBody(data, columns)
      }
    };
  }

  showprint(form: any) {
    console.log('todo', form)
    this.consultaInfracoes(ConsultaInfracaoPage.CRUD_READ, form.value, 'print');
    if (this.Infracoes.length == 0) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
      return;
    }
    this.imprimirform();
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
    //console.log("Iam inside printmake", this.docDefinition);
    pdfmake.createPdf(this.docDefinition).open();
    //console.log("I am back here1");
  }

  /* ------------------------ END PRINT ALL --------------------------------------- */
  /* ------------------------ PRINT ONE --------------------------------------- */
  printone(row: any) {
    console.log('one', row)
    let date = (this.date.getDate() > 9 ? this.date.getDate() : "0" + this.date.getDate()) + '/' + (this.date.getMonth() > 8 ? (this.date.getMonth() + 1) : "0" + (this.date.getMonth() + 1)) + '/' + this.date.getFullYear();
    let time = this.date.getHours() + ":" + this.date.getMinutes() + ":" + this.date.getSeconds();
    pdfmake.tableLayouts = {
      myCustomLayout: {
        hLineWidth: function (i, node) { return 0.5; },
        vLineWidth: function (i, node) { return 0.5; },
      }
    };
    this.docDefinition = {
      info: {
        title: 'Consulta Infração',
      },
      content: [
        {
          columns: [
            { text: 'SECRETARIA DA ADMINISTRAÇÃO DETRAN-BA AUTO DE INFRAÇÃO DE TRÂNSITO', bold: true, fontSize: 10 },
            {},
            {
              alignment: 'left',
              table: {
                widths: [60, 5, 60],
                heights: 40,
                alignment: 'left',
                body: [
                  [
                    { border: [true, true, true, true], text: row.auto, fontSize: 9 },
                    { border: [false, false, false, false], text: '' },
                    { border: [true, true, true, true], text: row.desdobramento_infracao, fontSize: 9 }
                  ]
                ]
              }
            },
          ]
        }, '\n',
        { text: 'AUTO GRAVADO VIA SISTEMA DE MOBILIDADE POLICIAL - MOP /SSP-BA', fontSize: 10 }, '\n',
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 500, y2: 0,
            lineWidth: 2, lineColor: '#666'
          }]
        }, '\n',
        { text: 'IDENTIFICAÇÃO DO VEÍCULO', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [40, 90, 50, 100, 50, 100],
            body: [[
              { text: 'Placa: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.placa, border: [true, true, true, true], fontSize: 10 },
              { text: 'Marca/Modelo: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.marca, border: [true, true, true, true], fontSize: 10 },
              { text: 'Especie: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.especie, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [45, 100, 50, 100, 50, 100],
            body: [[
              { text: 'Renavam: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.renavam, border: [true, true, true, true], fontSize: 10 },
              { text: 'Município: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.municipio_veiculo, border: [true, true, true, true], fontSize: 10 },
              { text: 'UF: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.uf_veiculo, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, '\n',
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 500, y2: 0,
            lineWidth: 2, lineColor: '#666'
          }]
        }, '\n',
        { text: 'IDENTIFICAÇÃO DO CONDUTOR / PROPRIETÁRIO', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [40, 180, 40, 100],
            body: [[
              { text: 'Nome: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.nome_condutor, border: [true, true, true, true], fontSize: 10 },
              { text: 'CPF: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.cpf_condutor, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [40, 100, 40, 30],
            body: [[
              { text: 'CNH: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.cnh_condutor, border: [true, true, true, true], fontSize: 10 },
              { text: 'Ausente: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.condutor_ausente, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, '\n',
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 500, y2: 0,
            lineWidth: 2, lineColor: '#666'
          }]
        }, '\n',
        { text: 'DADOS DA INFRAÇÃO', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [35, 450],
            body: [[
              { text: 'Local: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.local_ocorrencia, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [50, 100, 100, 80, 30, 40],
            body: [[
              { text: 'Município: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.nome_municipio, border: [true, true, true, true], fontSize: 10 },
              { text: 'Código Município: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.codigo_municipio, border: [true, true, true, true], fontSize: 10 },
              { text: 'UF: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.uf_municipio, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [40, 100, 40, 50],
            body: [[
              { text: 'Data: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.data_ocorrencia, border: [true, true, true, true], fontSize: 10 },
              { text: 'Hora: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.hora_ocorrencia, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [80, 400],
            body: [[
              { text: 'Enquadramento: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.enquadramento, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [80, 400],
            body: [[
              { text: 'Descrição: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.descricao_infracao, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [80, 400],
            body: [[
              { text: 'Observação: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.obs, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, '\n',
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 500, y2: 0,
            lineWidth: 2, lineColor: '#666'
          }]
        }, '\n',
        { text: 'IDENTIFICAÇÃO DA AUTORIDADE OU AGENTE AUTUADOR', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [60, 150, 60, 150],
            body: [[
              { text: 'Nome: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.usuario, border: [true, true, true, true], fontSize: 10 },
              { text: 'Matricula: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.matricula, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [60, 150, 60, 150],
            body: [[
              { text: 'PIM: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.pim, border: [true, true, true, true], fontSize: 10 },
              { text: 'IMEI: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.imei, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [60, 150, 60, 150],
            body: [[
              { text: 'Longitude: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.longitude, border: [true, true, true, true], fontSize: 10 },
              { text: 'Latitude: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.latitude, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 500, y2: 0,
            lineWidth: 2, lineColor: '#666'
          }]
        }, '\n',
        {
          layout: 'myCustomLayout',
          table: {
            
            widths: [60, 150, 60, 150],
            body: [[
              { text: 'IMPRESSO POR: ', border: [false, false, false, false], fontSize: 10 },
              { text: this.Authorizer.NomeUsuarioSistema, border: [true, true, true, true], fontSize: 10 },
              { text: 'Data / Hora: ', border: [false, false, false, false], fontSize: 10 },
              { text: date + ' ' + time, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        },
      ],
      defaultStyle: {
        color: 'black',
      }
    };

  }
  showprintone(row: any) {

    this.searchrRENAVAM(row);
  }
  /* ------------------------ END PRINT ONE --------------------------------------- */
  public compareWithFn = (o1, o2) => {
    return o1 === o2;
  };
  compareWith = this.compareWithFn;




  /* ------------------- PERMISIONS USER -------------------------------------- */
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
  /* ------------------- END PERMISIONS USER -------------------------------------- */
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/96']);
  }
  /* ---------------------------- SENDREQUEST -------------------------------------- */
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
        // || (procedure === 'spCargos')
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

  /* ---------------------------- END SENDREQUEST -------------------------------------- */

  public showDescricao(texto, event) {
    event.target.textContent = texto;
  }

  public hiddeDescricao(texto, event) {
    event.target.textContent = texto;
  }


  //FUNCTIONS TO GET RENAVAM

  public searchrRENAVAM(row: any) {

    let veiculos: Array<Veiculo> = [];

    const params = new FormData();

    params.append('placa', this.Authorizer.encripta(row.placa ? row.placa.toUpperCase() : ''));

    this.sendRequestOnline('ConsultaVeiculo', params
      , (resultado) => {

        console.log('resultado.results:', resultado);

        veiculos = resultado.map(function callback(value) {
          let veiculo = new Veiculo();

          if (value.codretorno == 0) {
            veiculo.renavam = value.renavam;
            veiculo.municipio = value.municipio;
          }
          return veiculo;
        });

        if (veiculos.length > 0) {
          row.renavam = veiculos[0].renavam;
          row.municipio_veiculo = veiculos[0].municipio;
        }

        this.printone(row);
        pdfmake.vfs = pdfFonts.pdfMake.vfs;
        pdfmake.createPdf(this.docDefinition).open();
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
}
