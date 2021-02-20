import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController, NumericValueAccessor } from '@ionic/angular';
//import { environment } from "../../../environments/environment.prod";
import { environment } from "../../../environments/environment";
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';
import { IonicSelectableComponent } from 'ionic-selectable';
// Services
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { MapService } from 'src/app/services/map.service';
//Libraries
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
//MODELS
import { ConsultaOcurrencia } from 'src/app/models/consultaOcurrencia';

@Component({
  selector: 'app-consulta-ocorrencias',
  templateUrl: './consulta-ocorrencias.page.html',
  styleUrls: ['./consulta-ocorrencias.page.scss'],
})
export class ConsultaOcorrenciasPage implements OnInit {
  private APP_NAME: string = this.env.AppName;

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  constructor(
    private navCtrl: NavController,
    private Authorizer: AuthService,
    private alertService: AlertService,
    private router: Router,
    private env: EnvService,
    private mapService: MapService,
  ) { }

  public mapURL: any;
  public showMapa: any = false;
  public showTable: any = false;
  public showpictures: any = false;

  public consultaOcurrencias: Array<ConsultaOcurrencia> = [];
  public consulOcurrencia = new ConsultaOcurrencia();

  public pictures: Array<any> = [];

  public tempGetAll: boolean = false;

  public aisp = [];
  public risp = [];
  public cipm = [];
  public dt = [];

  public oneAisp: any = "";
  public oneRisp: any = "";
  public oneCipm: any = "";
  public oneDt: any = "";

  public UFs: any[];
  public MunicipiosUF: any[];
  public Bairros: any[];
  public Usarios: any[];

  public data_fato = [];

  public imgLogo = environment.logoconsultainfracaoprint;
  //public imgLogo: any;
  public docDefinition: any; //For print all
  public columns = [{ text: 'Data fato', style: 'tableHeader' }, { text: 'BO', style: 'tableHeader' }, { text: 'Observações', style: 'tableHeader' }, { text: 'Município', style: 'tableHeader' }, { text: 'Bairro', style: 'tableHeader' }, { text: 'AISP', style: 'tableHeader' }, { text: 'RISP', style: 'tableHeader' }, { text: 'CIPM', style: 'tableHeader' }, { text: 'DT', style: 'tableHeader' }, { text: 'Logradouro', style: 'tableHeader' }, { text: 'Situação', style: 'tableHeader' }, { text: 'Usuário', style: 'tableHeader' }, { text: 'Latitude', style: 'tableHeader' }, { text: 'Longitude', style: 'tableHeader' }];
  public date: Date = new Date();

  ngOnInit() {
    this.getPermissoesModulo();
  }
  ionViewDidEnter() {
    this.GetMunicipios();
    this.GetUsarios();
  }

  private GetUsarios() {
    this.sendRequest('spUsariosOcorrencias', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      this.Usarios = [];
      this.Usarios = JSON.parse(atob(resultado.results));
      this.Usarios.unshift({ 'CODIGO': 'TODOS', 'NOME': 'TODOS' })
      console.log('Usarios :', this.Usarios)
    });
  }

  // private GetUF() {
  //   this.sendRequest('spUFs', {
  //     StatusCRUD: 'READ',
  //     formValues: ''
  //   }, (resultado) => {
  //     this.UFs = JSON.parse(atob(resultado.results));
  //     console.log('ufs :', this.UFs)
  //   });
  // }

  private GetMunicipios() {
    // if (!form.value.UF) { return }
    // else {
    this.consulOcurrencia.CodigoMunicipio = "";
    this.MunicipiosUF = [];
    this.consulOcurrencia.codigo_bairro = "";
    this.consulOcurrencia.aisp = "";
    this.consulOcurrencia.risp = "";
    this.consulOcurrencia.cipm = "";
    this.consulOcurrencia.dt = "";
    this.aisp = [];
    this.risp = [];
    this.cipm = [];
    this.dt = [];
    this.oneAisp = "";
    this.oneRisp = "";
    this.oneCipm = "";
    this.oneDt = "";
    this.sendRequest('spMunicipios', {
      StatusCRUD: 'READ',
      formValues: { 'codigoUF': "29" }
    }, (resultado) => {
      this.MunicipiosUF = JSON.parse(atob(resultado.results));
      if (this.MunicipiosUF.length > 1) { this.MunicipiosUF.unshift({ 'CodigoBaseMunicipio': 'TODOS', 'Nome': 'TODOS' }) };
      this.consulOcurrencia.codigo_bairro = "";
      console.log('ufs :', this.MunicipiosUF)
    });
    //}
  }

  public GetBairros(form: NgForm) {
    //this.Bairros = [];
    this.consulOcurrencia.codigo_bairro = "";
    this.consulOcurrencia.aisp = "";
    this.consulOcurrencia.risp = "";
    this.consulOcurrencia.cipm = "";
    this.consulOcurrencia.dt = "";
    this.aisp = [];
    this.risp = [];
    this.cipm = [];
    this.dt = [];
    this.oneAisp = "";
    this.oneRisp = "";
    this.oneCipm = "";
    this.oneDt = "";
    if(form.value.CodigoMunicipio=='TODOS'){
      form.value.CodigoMunicipio="";
    }
    if (!form.value.CodigoMunicipio) { return }
    else {
      this.sendRequest('spConsultaBairros', {
        StatusCRUD: 'READ',
        formValues: { 'codigoMunicipio': form.value.CodigoMunicipio }
      }, (resultado) => {
        this.Bairros = JSON.parse(atob(resultado.results));

        console.log('Bairros :', this.Bairros)
        if (this.Bairros.length > 1) { this.Bairros.unshift({ 'codigo_bairro': 'TODOS', 'nome_bairro': 'TODOS' }) }

        // Filter to obtain no repeat values of aisp
        // for (let index = 0; index < this.Bairros.length; index++) {
        //   if (index == 0) {
        //     this.aisp.push('TODOS');
        //     this.aisp.push(this.Bairros[index].aisp);
        //   }
        //   else {
        //     if (!this.aisp.includes(this.Bairros[index].aisp)) {
        //       this.aisp.push(this.Bairros[index].aisp);
        //     }
        //   }
        // }

      });
    }
  }

  public compareWithFn = (o1, o2) => {
    return o1 === o2;
  };
  compareWith = this.compareWithFn;

  Getaisp(form: NgForm) {
    if (!form.value.CodigoMunicipio) { return }
    else {
      this.consulOcurrencia.aisp="";
      this.consulOcurrencia.risp = "";
      this.consulOcurrencia.cipm = "";
      this.consulOcurrencia.dt = "";
      this.oneRisp = "";
      this.oneCipm = "";
      this.oneDt = "";
      this.risp = [];
      this.cipm = [];
      this.dt = [];
      this.aisp=[];
      this.sendRequest('spConsultaBairros', {
        StatusCRUD: 'READaisp',
        formValues: { 'codigoMunicipio': form.value.CodigoMunicipio }
      }, (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        this.aisp = results;
        this.aisp.unshift({ 'aisp': 'TODOS' });
      });
    }
  }

  Getrisp(form: NgForm) {
    if (this.tempGetAll == true) { return; }
    if (this.consulOcurrencia.aisp || this.oneAisp) {
      this.consulOcurrencia.risp = "";
      this.consulOcurrencia.cipm = "";
      this.consulOcurrencia.dt = "";
      this.oneRisp = "";
      this.oneCipm = "";
      this.oneDt = "";
      this.risp = [];
      this.cipm = [];
      this.dt = [];
      this.sendRequest('spConsultaBairros', {
        StatusCRUD: 'READrisp',
        formValues: { 'AISP': form.value.AISP }
      }, (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        if (results.length == 1) { this.oneRisp = results[0].risp }
        else { 
          this.risp = JSON.parse(atob(resultado.results));
          this.risp.unshift({ 'risp': 'TODOS' });
        }
      });
    } else { return; }
  }

  Getcipm(form: NgForm) {
    if (this.tempGetAll == true) { return; }
    if (this.consulOcurrencia.risp || this.oneRisp) {
      this.consulOcurrencia.cipm = "";
      this.consulOcurrencia.dt = "";
      this.oneCipm = "";
      this.oneDt = "";
      this.cipm = [];
      this.dt = [];
      this.sendRequest('spConsultaBairros', {
        StatusCRUD: 'READcipm',
        formValues: { 'AISP': form.value.AISP, 'RISP': form.value.RISP }
      }, (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        if (results.length == 1) { this.oneCipm = results[0].cipm }
        else { 
          this.cipm = JSON.parse(atob(resultado.results)); 
          this.cipm.unshift({ 'cipm': 'TODOS' });
        }
      });
    } else { return; }
  }

  Getdt(form: NgForm) {
    if (this.tempGetAll == true) { return; }
    if (this.consulOcurrencia.cipm || this.oneCipm) {
      this.consulOcurrencia.dt = "";
      this.oneDt = "";
      this.dt = [];
      this.sendRequest('spConsultaBairros', {
        StatusCRUD: 'READdt',
        formValues: { 'AISP': form.value.AISP, 'RISP': form.value.RISP, 'CIPM': form.value.CIPM }
      }, (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        if (results.length == 1) { this.oneDt = results[0].dt }
        else { 
          this.dt = JSON.parse(atob(resultado.results)); 
          this.dt.unshift({ 'dt': 'TODOS' });
        }
      });
    } else { return; }
  }

  Getall(form: NgForm) {
    if(!this.consulOcurrencia.codigo_bairro ||!form.value.Bairros ){
    this.consulOcurrencia.aisp = "";
    this.consulOcurrencia.risp = "";
    this.consulOcurrencia.cipm = "";
    this.consulOcurrencia.dt = "";
    this.oneAisp = "";
    this.oneRisp = "";
    this.oneCipm = "";
    this.oneDt = "";
    this.aisp = [];
    this.risp = [];
    this.cipm = [];
    this.dt = [];
    return;
  }
    // if(this.consulOcurrencia.codigo_bairro=="TODOS") this.consulOcurrencia.codigo_bairro="";
    // if(form.value.Bairros=="TODOS") form.value.Bairros="";
  
    if (this.consulOcurrencia.codigo_bairro == "TODOS") { this.oneAisp = ""; this.oneRisp = ""; this.oneCipm = ""; this.oneDt = ""; this.tempGetAll = false; this.Getaisp(form) }
    else {
      this.sendRequest('spConsultaBairros', {
        StatusCRUD: 'READAll',
        formValues: { 'codigo_bairro': form.value.Bairros, 'codigoMunicipio': "" }
      }, (resultado) => {
        // let results = JSON.parse(atob(resultado.results));
        this.tempGetAll = true;
        this.oneAisp = JSON.parse(atob(resultado.results))[0].aisp;
        this.oneRisp = JSON.parse(atob(resultado.results))[0].risp;
        this.oneCipm = JSON.parse(atob(resultado.results))[0].cipm;
        this.oneDt = JSON.parse(atob(resultado.results))[0].dt;
      });
    }
  }

  public GetTableData(form: NgForm, mapa) {
    if (form.value.AISP=="TODOS"){form.value.AISP=""}
    if (form.value.RISP=="TODOS"){form.value.RISP=""}
    if (form.value.CIPM=="TODOS"){form.value.CIPM=""}
    if (form.value.DT=="TODOS"){form.value.DT=""}
    if (form.value.Usarios == 'TODOS'){form.value.Usarios=""}
    if (form.value.CodigoMunicipio == 'TODOS'){form.value.CodigoMunicipio=""}
    if (form.value.Bairros == 'TODOS'){form.value.Bairros=""}
    

    this.alertService.loaderPresent();
    this.sendRequest('spConsultarOcorrencias', {
      StatusCRUD: 'READ',
      formValues: form.value
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));

      this.consultaOcurrencias = results.map(function callback(value) {
        let consultaOcurrencia = new ConsultaOcurrencia();
        consultaOcurrencia.codigo = value.codigo;
        consultaOcurrencia.usuario = value.usuario;
        consultaOcurrencia.bo = value.bo;
        consultaOcurrencia.obs = value.obs;
        consultaOcurrencia.Nome = value.Nome;
        consultaOcurrencia.nome_bairro = value.nome_bairro;
        consultaOcurrencia.aisp = value.aisp;
        consultaOcurrencia.risp = value.risp;
        consultaOcurrencia.cipm = value.cipm;
        consultaOcurrencia.data_fato = value.data_fato.substring(8, 10) + '/' + value.data_fato.substring(5, 7) + '/' + value.data_fato.substring(0, 4);
        consultaOcurrencia.dt = value.dt;
        consultaOcurrencia.tipo_local = value.tipo_local;
        consultaOcurrencia.ponto_referencia = value.ponto_referencia;
        consultaOcurrencia.situacao = value.situacao;
        consultaOcurrencia.nomeusuario = value.nomeusuario;
        consultaOcurrencia.latitude = value.latitude;
        consultaOcurrencia.longitude = value.longitude;
        consultaOcurrencia.logradouro = value.logradouro;
        // for print pdf
        consultaOcurrencia.Datafato = value.Datafato;
        consultaOcurrencia.hora_fato = value.hora_fato;
        consultaOcurrencia.matriculausuario = value.matriculausuario;
        consultaOcurrencia.pim = value.pim;
        consultaOcurrencia.imei = value.imei;
        return consultaOcurrencia;
      });

      if (this.consultaOcurrencias.length == 0) {
        this.alertService.loaderDismiss();
        this.alertService.presentAlert({
          pTitle: 'ATENCÃO', pSubtitle: this.APP_NAME, pMessage: 'Não há dados para apresentar, verifique o filtro de pesquisa'
        });
      }

      if (mapa == 'X') {
        this.showTable = false;
        this.showpictures = false;
        this.CargarMapa();
      }
      else if (mapa != 'X') {
        this.alertService.loaderDismiss();
        this.showTable = true;
        this.showpictures = false;
        console.log('tabla', this.consultaOcurrencias)
        this.showMapa = false;
      }
    });
  }

  /* ------------------------ PRINT TABLE --------------------------------------- */

  pdfprint() {
    var externalDataRetrievedFromServer = this.consultaOcurrencias;
    this.docDefinition = {
      pageSize: 'A5',
      pageOrientation: 'landscape',
      pageMargins: [20, 40, 40, 20],
      footer: {
        columns: [
          'Impresso por ' + this.Authorizer.NomeUsuarioSistema,
        ]
      },
      content: [
        {
          columns: [
            {
              alignment: 'center',
              image: this.imgLogo,
              width: 500,
              height: 150,
            }
          ]
        },
        { text: 'Ocorrências CVLI', style: 'header', alignment: 'center' },
        this.table(externalDataRetrievedFromServer, ['data_fato', 'bo', 'obs', 'Nome', 'nome_bairro', 'aisp', 'risp', 'cipm', 'dt', 'logradouro', 'situacao', 'nomeusuario', 'latitude', 'longitude']),
      ],
      styles: {
        header: {
          fontSize: 13,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 6.5,
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
          dataRow.push({ text: row[column].toString(), fontSize: 6.5 });
        }
        catch {
          dataRow.push("");
        }
      })
      body.push(dataRow);
    });

    // body.push([{ text: "My name is JC", fontSize: 6.5 }]);
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
        widths: ['10%', '7%', '11%', 'auto', '8%', 'auto', '10%', '6%', 'auto', 'auto', 'auto', '9%', '9%', '9%'],
        body: this.buildTableBody(data, columns),
      }
    };
  }

  printtable(form: NgForm, mapa) {
    console.log('todo', form)
    this.GetTableData(form, mapa)
    this.pdfprint();
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
    //console.log("Iam inside printmake", this.docDefinition);
    pdfmake.createPdf(this.docDefinition).open();
    //console.log("I am back here1");
  }

  /* ------------------------ END PRINT TABLE --------------------------------------- */
  /* ------------------------ PRINT ONE --------------------------------------- */
  printone(row: any) {
    console.log('one', row)
    let date = this.date.getDate() + '/' + (this.date.getMonth() + 1) + '/' + this.date.getFullYear();
    let time = this.date.getHours() + ":" + this.date.getMinutes() + ":" + this.date.getSeconds();
    pdfmake.tableLayouts = {
      myCustomLayout: {
        hLineWidth: function (i, node) { return 0.5; },
        vLineWidth: function (i, node) { return 0.5; },
      }
    };
    this.docDefinition = {
      content: [
        { text: 'SECRETARIA DA ADMINISTRAÇÃO DETRAN-BA AUTO DE INFRAÇÃO DE TRÂNSITO', bold: true, fontSize: 10, alignment: 'center' }, '\n',
        { text: 'OCORRÊNCIAS CVLI - MOP /SSP-BA', fontSize: 10, alignment: 'center' }, '\n',
        {
          canvas: [{
            type: 'line',
            x1: 0, y1: 0,
            x2: 500, y2: 0,
            lineWidth: 2, lineColor: '#666'
          }]
        }, '\n',
        { text: 'DADOS OCORRÊNCIA', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [40, 50],
            body: [[
              { text: 'BO: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.bo, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [60, 100, 60, 60],
            body: [[
              { text: 'Data Fato: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.data_fato, border: [true, true, true, true], fontSize: 10 },
              { text: 'Hora Fato: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.hora_fato, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [60, 100, 60, 60],
            body: [[
              { text: 'Municipio: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.Nome, border: [true, true, true, true], fontSize: 10 },
              { text: 'Barrio: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.nome_bairro, border: [true, true, true, true], fontSize: 10 },
            ]]
          }
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [80, 400],
            body: [[
              { text: 'Lograduro: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.logradouro, border: [true, true, true, true], fontSize: 10 },
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
        }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: [80, 100],
            body: [[
              { text: 'Situação: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.situacao, border: [true, true, true, true], fontSize: 10 },
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
              { text: row.nomeusuario, border: [true, true, true, true], fontSize: 10 },
              { text: 'Matricula: ', border: [false, false, false, false], fontSize: 10 },
              { text: row.matriculausuario, border: [true, true, true, true], fontSize: 10 },
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
        { text: 'IMPRESSÃO', bold: true, fontSize: 10 }, ' ',
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
    console.log('todo', row)
    this.printone(row);
    pdfmake.vfs = pdfFonts.pdfMake.vfs;
    pdfmake.createPdf(this.docDefinition).open();
  }
  /* ------------------------ END PRINT ONE --------------------------------------- */


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
        || (params.StatusCRUD === 'READaisp') && (this.permissoes.Pesquisar > 0)
        || (params.StatusCRUD === 'READrisp') && (this.permissoes.Pesquisar > 0)
        || (params.StatusCRUD === 'READcipm') && (this.permissoes.Pesquisar > 0)
        || (params.StatusCRUD === 'READdt') && (this.permissoes.Pesquisar > 0)
        || (params.StatusCRUD === 'READAll') && (this.permissoes.Pesquisar > 0)
        // || (procedure === 'spUF')
        || (procedure === 'spUsariosOcorrencias')
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

  /* ------------------------ CARGAR MAPA ALL --------------------------------------- */
  async CargarMapa() {
    let colorMarket: any;
    if (this.consultaOcurrencias.length == 0) {
      this.mapURL = "";
      return;
    }
    let token = await this.mapService.getToken();
    for (let index = 0; index < this.consultaOcurrencias.length; index++) {
      let customMarkert =

        '<p><b> Ponto de refer&#234ncia:</b>' + this.consultaOcurrencias[index].ponto_referencia + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Situa&#231&#227o:</b> ' + this.consultaOcurrencias[index].situacao + '</p>' +
        '<p ><b>Usu&#225rio:</b> ' + this.consultaOcurrencias[index].nomeusuario + '</p>' +
        '<p style="background-color:#D3D3D3;"><b>Latitude:</b> ' + this.consultaOcurrencias[index].latitude + '</p>' +
        '<p><b>Longitude:</b> ' + this.consultaOcurrencias[index].longitude + '</p>';

      let params = {
        'token': token,
        'latitude': this.consultaOcurrencias[index].latitude,
        'longitude': this.consultaOcurrencias[index].longitude,
        'marker': customMarkert,
        'color': 'RED',
      }

      if (index > (this.consultaOcurrencias.length - 5)) {
        await this.mapService.setCoordenates(params);
      } else {
        this.mapService.setCoordenates(params);
      }


    }
    let params = new HttpParams()
      .set("token", token)

    this.mapURL = this.mapService.getMapaURLMassive(params);
    this.showMapa = true;

    this.alertService.loaderDismiss();

  }
  /* ------------------------ END  CARGAR MAPA ALL --------------------------------------- */
  /* ------------------------ CARGAR MAPA ROW --------------------------------------- */
  async showmapone(row: any) {
    console.log('mapa latitude', row.latitude)
    console.log('mapa longitude', row.longitude)

    let customMarkert =
      '<p><b>Ponto de Refer&#234ncia:</b>' + row.ponto_referencia + '</p>' +
      '<p style="background-color:#D3D3D3;"><b>Situa&#231&#227o:</b> ' + row.situacao + '</p>' +
      '<p ><b>Usu&#225rio:</b> ' + row.nomeusuario + '</p>' +
      '<p style="background-color:#D3D3D3;"><b>Latitude:</b> ' + row.latitude + '</p>' +
      '<p><b>Longitude:</b> ' + row.longitude + '</p>';

    let params = new HttpParams()
      .set("latitude", row.latitude)
      .set("longitude", row.longitude)
      .set("marker", customMarkert)
      .set("color", 'RED')
      .set("massive", "")
      .set("coordenatesList", "")

    this.mapURL = this.mapService.getMapaURL(params);
    this.showMapa = true;
    this.showpictures = false;

  }
  /* ------------------------ END CARGAR MAPA ROW --------------------------------------- */
  /* ------------------------ SHOW PICTURE ROW --------------------------------------- */
  showpic(row: any) {
    console.log('row', row)
    this.showMapa = false;

    this.alertService.loaderPresent();
    this.sendRequest('spConsultarOcorrenciasFotos', {
      StatusCRUD: 'READ',
      formValues: row.codigo
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.pictures = results;
      console.log('ocorrencia fotos', this.pictures)
      if (this.pictures.length == 0) {
        this.alertService.loaderDismiss();
        this.showpictures = false;
        this.alertService.presentAlert({
          pTitle: 'ATENCÃO', pSubtitle: this.APP_NAME, pMessage: 'Não há dados para apresentar, verifique o filtro de pesquisa'
        });
      } else { this.showpictures = true; this.alertService.loaderDismiss(); }
    });

    // if (this.consultaOcurrencias.length == 0) {
    //   this.alertService.presentAlert({
    //     pTitle: 'ATENCÃO', pSubtitle: this.APP_NAME, pMessage: 'Não há dados para apresentar, verifique o filtro de pesquisa'
    //   });
    // }
  }

  fecharfotos() {
    this.showpictures = false;
    this.pictures = [];
  }

  /* ------------------------ END SHOW PICTURE ROW  --------------------------------------- */
}
