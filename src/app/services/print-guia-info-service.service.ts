import { Injectable } from '@angular/core';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { OutrasPericias } from 'src/app/models/outra-pericia';
import { DetalhesFato } from 'src/app/models/detalhes-fato';
import { Periciandos } from 'src/app/models/periciandos';
import { LocalPericia } from 'src/app/models/local-pericia';
import { GuiaPericia } from 'src/app/models/guia-pericia';

import { environment } from "src/environments/environment";
pdfmake.vfs = pdfFonts.pdfMake.vfs
@Injectable({
  providedIn: 'root'
})
export class PrintGuiaInfoService {
  public pdfMake: any;
  public date: Date = new Date();

  public columnsDetalhesFato = [
    { text: 'Naturaleza do fato', bold: true, fontSize: 6, },
    { text: 'Tipificação', bold: true, fontSize: 6, }
  ];

  public columnsPericiandos = [
    { text: 'Nome', bold: true, fontSize: 6, },
    { text: 'Descrição', bold: true, fontSize: 6, },
    { text: 'Informações Complementares', bold: true, fontSize: 6, },
    //{ text: 'Exames Periciais', bold: true, fontSize: 6, },
    { text: 'Exame Externo', bold: true, fontSize: 6, },
    { text: 'Questiações', bold: true, fontSize: 6, }
  ];

  public columnsLocalPericia = [
    { text: 'Tipo Local', bold: true, fontSize: 6, },
    { text: 'Descrição', bold: true, fontSize: 6, }
  ];

  public columnsGuiasRelacionadas = [
    { text: 'Tipo de guia', bold: true, fontSize: 6, },
    { text: 'Número', bold: true, fontSize: 6, },
    { text: 'Data Registro', bold: true, fontSize: 6, }
  ];

  public columnsOutrasPericias = [
    { text: 'Nome', bold: true, fontSize: 6, },
    { text: 'Descrição', bold: true, fontSize: 6 },
    { text: 'Exames Requisitados', bold: true, fontSize: 6 },
    { text: 'Tipo Local', bold: true, fontSize: 6 },
  ];


  public imgLogo = environment.logoconsultainfracaoprint;
  public tipoGuia: string;
  constructor() { }

  async generatePdf(detalhesFato, outrasPericias, guiasAsociadas, periciandos, localPericia, dataGuia) {
    //replacing the null values of  the arrays//  
    this.replaceNullValues(detalhesFato);
    this.replaceNullValues(outrasPericias);
    this.replaceNullValues(guiasAsociadas);
    this.replaceNullValues(periciandos);
    this.replaceNullValues(localPericia);
    this.replaceNullValues(dataGuia);
    /////////////////////////////////////////////////

    //manipulating the data of the arrays to show the information the way the client requiered

    //formating the information of the Data of the guia  arry
    var dataGuiaPrint = dataGuia
    if(dataGuiaPrint.tipo_guia=='GM'){
      dataGuiaPrint.tipo_guia='GUIA DE PERÍCIA EXAME MÉDICO-LEGAL'
    }else{
      dataGuiaPrint.tipo_guia='GUIA PARA EXAME PERICIAL E LABORATORIAL'
    }
    ////////////////////////////////////////////////////////////

    //formating the information of the detalhesFato arry
    var dataDetalhesFatoPrint = detalhesFato.map(function callback(value) {
      let dataDetalhesFato = new DetalhesFato();
      dataDetalhesFato.codigo = value.codigoDetalhe;
      dataDetalhesFato.descricao = value.descricao;
      dataDetalhesFato.natureza_do_fato = value.natureza_do_fato;
      if (dataDetalhesFato.natureza_do_fato.trim() == 'S') {
        dataDetalhesFato.natureza_do_fato = 'Delituosa';
      } else {
        dataDetalhesFato.natureza_do_fato = 'Não Delituosa';
      }
      dataDetalhesFato.tipificacao = value.nomeTipificacao;
      return dataDetalhesFato;
    });
    ////////////////////////////////////////////////////////

    //formating the information of the localPericia arry
    var dataLocalPericiaPrint = localPericia.map(function callback(value) {
      let dataLocalPericia = new LocalPericia();
      dataLocalPericia.nome_tipo_local = value.nome_tipo_local;
      dataLocalPericia.descricao = value.descricao;
      return dataLocalPericia;
    });
    ////////////////////////////////////////////////////////

    //formating the information of the Outras Pericias  arry
    var dataOutrasPericiasPrint = outrasPericias.map(function callback(value) {
      let dataOutrasPericias = new OutrasPericias();
      dataOutrasPericias.descricao = value.descricao;
      dataOutrasPericias.nome_examen_requisitado = value.nome_examen_requisitado;
      dataOutrasPericias.nome_tipo = value.nome_tipo;
      dataOutrasPericias.nome_tipo_local = value.nome_tipo_local;

      return dataOutrasPericias;
    });;
    //////////////////////////////////////////////////////////////////

    //formating the information of the Guias Asociadas  arry
    var dataguiasAsociadasPrint = guiasAsociadas.map(function callback(value) {
      let dataGuiasAsociadas = new GuiaPericia();
      if (value.tipo_guia == 'GM') {
        dataGuiasAsociadas.tipo_guia = 'Guia de Péricia Medico Legal'
      } else {
        dataGuiasAsociadas.tipo_guia = 'Guia para Exame Pericial e Laboratorial'
      }
      dataGuiasAsociadas.nome_guia = value.nome_guia;
      let dataRegistro = value.data_registro.split(' ');
      dataGuiasAsociadas.data_registro = dataRegistro[0];

      return dataGuiasAsociadas;
    });
    /////////////////////////////////////////////////////////////////



    //formating the information of the localPericia arry
    var datapericiandosPrint = periciandos.map(function callback(value) {
      let dataPericiandos = new Periciandos();


      if (value.acidente_trabalho.trim() == 'S') {
        value.acidente_trabalho = 'SIM';
      } else {
        value.acidente_trabalho = 'NÃO';
      }
      if (value.exame_externo.trim() == 'S') {
        value.exame_externo = 'SIM';
      } else {
        value.exame_externo = 'NÃO';
      }

      dataPericiandos.nome = value.nome;
      dataPericiandos.descricaoPrint = 'Nome Social:' + value.nome_social + ',' +
        'Data Nascimento:' + value.data_nacimento + ',' +
        'Sexo:' + value.sexo + ',' +
        'Filiação:' + value.filiacao + ',' +
        'Documentos: ' + '\n' + 'CPF:' + value.cpf + ',' +
        'Nacionalidade:' + value.nacionalidade + ',' +
        'Naturalidade:' + value.naturalidade + ',' +
        'Endereço:' + value.municipio + ',' + value.bairro + ',' + value.cep
      dataPericiandos.informacoesComplementares = 'Causas prováveis:' + value.causas_provavel + ',' +
        'Acidente de Trabalho:' + value.acidente_trabalho
      dataPericiandos.exame_externo = 'Exame Externo:' + value.exame_externo
      dataPericiandos.quesitacoes = value.quesitacoes;
      return dataPericiandos;
    });
    ////////////////////////////////////////////////////////

    ///////////////////////////////////////////////////////////

    //data of the user that generate the document for print
    let usuarioPrint = localStorage.getItem('nomeUsuario') + ' ' + localStorage.getItem('matriculaUsuario')
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    //data of the Numero ocorrencia/procedimento policial 
    let numeroGuia = dataGuia.nome_guia.split("-");
    let numeroPrint = numeroGuia[0] + '-' + numeroGuia[1] + '-' + numeroGuia[2] + '-' + numeroGuia[3]
    let descricaoFato
    if (dataDetalhesFatoPrint.length == 0) {
      descricaoFato = '';
    } else {
      descricaoFato = dataDetalhesFatoPrint[0].descricao;
    }
    let localFato;
    if (dataDetalhesFatoPrint.length == 0) {
      localFato = '';
    } else {
      localFato = dataLocalPericiaPrint[0].nome_tipo_local;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    //get the current time and date for the document
    let date = (this.date.getDate() > 9 ? this.date.getDate() : "0" + this.date.getDate()) + '/' + (this.date.getMonth() > 8 ? (this.date.getMonth() + 1) : "0" + (this.date.getMonth() + 1)) + '/' + this.date.getFullYear();
    let time = this.date.getHours() + ":" + this.date.getMinutes() + ":" + this.date.getSeconds();
    /////////////////////////////////////////////////

    pdfmake.tableLayouts = {
      myCustomLayout: {
        hLineWidth: function (i, node) { return 0.5; },
        vLineWidth: function (i, node) { return 0.5; },
      }
    };
    //definition of the format of the document
    const docDef = {
      footer: function (currentPage, pageCount, pageSize) {
        return [
          {
            canvas: [
              {
                type: 'line',
                x1: 0, y1: 0,
                x2: 1000, y2: 0,
                lineWidth: 1,
                lineColor: '#666'
              }]
          }, '\n',
          { text: 'NÚmero:' + dataGuiaPrint.nome_guia, alignment: 'left', fontSize: 8 },
          { text: currentPage.toString() + ' de ' + pageCount, alignment: 'right', fontSize: 8 },

        ]
      },
      // watermark: 'test watermark',
      info: {
        title: dataGuiaPrint.tipo_guia,
      },

      content: [

        {

          columns: [

            {
              image: this.imgLogo,
              fit: [200, 100]
            },
           
            [
              { text: 'Unidade Emissão: '+dataGuiaPrint.destino_lado, alignment: 'right', fontSize: 8 },
              { text: 'Data Emissão: '+date + ' ás ' + time, alignment: 'right', fontSize: 8 },
              { text: 'Gerado por : '+usuarioPrint, alignment: 'right', fontSize: 8 },
            ],
           
          ]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 500, y2: 0,
              alignment: 'center',
              lineWidth: 1, lineColor: '#666'
            }]
        }, '\n',
        {
          text:  dataGuiaPrint.tipo_guia,
          style: 'header',
          alignment: 'center'
        }, '\n',
        { text: 'GUIA DE PERÍCIA', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {

            widths: ['auto', 'auto'],
            body: [[
              { text: 'Número: ', bold: true,border: [false, false, false, false], fontSize: 8 },
              { text: dataGuiaPrint.nome_guia, border: [false, false, false, false], fontSize: 8, alignment: 'justify' },
              
            ]]
          }
          
        },
        {
          layout: 'myCustomLayout',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [[
              { text: 'Data/Hora Registro: ',bold: true, border: [false, false, false, false], fontSize: 8, alignment: 'justify' },
              { text: dataGuiaPrint.data_registro, border: [false, false, false, false], fontSize: 8, alignment: 'justify' },
              { text: 'Destino Laudo: ', bold: true,border: [false, false, false, false], fontSize: 8 },
              { text: dataGuiaPrint.destino_lado, border: [false, false, false, false], fontSize: 8, alignment: 'justify' },
            ]]
          }
        }, ' ', 
        { text: 'Requisitante', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [[
              { text: 'órgão Requisitante: ',bold: true,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
              { text: dataGuia.orgao, alignment: 'justify',border: [false, false, false, false], fontSize: 8 },
              { text: 'Unidade Requisitante: ',bold: true, alignment: 'justify',border: [false, false, false, false], fontSize: 8 },
              { text: dataGuia.unidade,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
            ]]
          }
        }, 
        {
          layout: 'myCustomLayout',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [[
              { text: 'Autoridade Requisitante: ',bold: true,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
              { text: usuarioPrint, alignment: 'justify',border: [false, false, false, false], fontSize: 8 },
              { text: 'Responsável Registro: ',bold: true,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
              { text: usuarioPrint,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
            ]]
          }
        }, ' ',
        { text: 'Dados da Ocorréncia/ProcedimentoPolicial', bold: true, fontSize: 10 }, ' ',
        {
          layout: 'myCustomLayout',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [[
              { text: 'Número: ',alignment: 'justify',bold: true, border: [false, false, false, false], fontSize: 8 },
              { text: numeroPrint, alignment: 'justify',border: [false, false, false, false], fontSize: 8 },
              { text: 'Data/Hora Fato: ', bold: true,alignment: 'justify',border: [false, false, false, false], fontSize: 8 },
              { text: dataGuiaPrint.data_registro,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
            ]]
          }
        },
        {
          layout: 'myCustomLayout',
          table: {
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: [[
              { text: 'Descrição do fato: ',bold: true,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
              { text: descricaoFato,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
              { text: 'Número do Procedimento: ',bold: true, alignment: 'justify',border: [false, false, false, false], fontSize: 8 },
              { text: dataGuiaPrint.numero_procedimento,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
            ]]
          }
        }, 
        {
          layout: 'myCustomLayout',
          table: {
            widths: ['auto', 'auto'],
            body: [[
              { text: 'Local do fato: ',bold: true,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },
              { text: localFato,alignment: 'justify', border: [false, false, false, false], fontSize: 8 },

            ]]
          }
        }, ' ',
        //table dethales do fato///////////////////////////////////////////////////////////////
        { text: 'Dethales do Fato', style: 'header', alignment: 'justify', fontSize: 8 },
        this.tableDetalhesFato(dataDetalhesFatoPrint, ['natureza_do_fato', 'tipificacao']), 
        ////////////////////////////////////////////////////////////////////////////////////////

        //table Periciandos///////////////////////////////////////////////////////////////////////////////
        { text: 'Periciando', style: 'header', alignment: 'justify', fontSize: 8 },
        this.tablePericiandos(datapericiandosPrint, ['nome', 'descricaoPrint', 'informacoesComplementares', 'exame_externo', 'quesitacoes']), 
        ///////////////////////////////////////////////////////////////////////////////////////////////////

        //table Outras Pericias///////////////////////////////////////////////////////////////////////////////
        { text: 'Outras Pericias', style: 'header', alignment: 'justify', fontSize: 8 },
        this.tableOutrasPericias(dataOutrasPericiasPrint, ['nome_tipo', 'descricao', 'nome_examen_requisitado', 'nome_tipo_local']), 
        ///////////////////////////////////////////////////////////////////////////////////////////////////


        //Table Local Pericia/////////////////////////////////////////////////////////////////////////////
        { text: 'Local de Pericia', style: 'header', alignment: 'justify', fontSize: 8 },
        this.tableLocalPericia(dataLocalPericiaPrint, ['nome_tipo_local', 'descricao']), 
        ////////////////////////////////////////////////////////////////////////////////////////////////////

        //Table Guias Relacionadas/////////////////////////////////////////////////////////////////////////////
        { text: 'Guias Relacionadas', style: 'header', alignment: 'justify', fontSize: 8 },
        this.tableGuiasRelacionadas(dataguiasAsociadasPrint, ['tipo_guia', 'nome_guia', 'data_registro']), 
        ////////////////////////////////////////////////////////////////////////////////////////////////////
        [
          { text: 'Responsável: _______________________', style: 'header', alignment: 'center', fontSize: 8 },
          { text: usuarioPrint,alignment: 'center', fontSize: 8 }
  
        ]
       
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
    };
    pdfmake.createPdf(docDef).open();
  }
  /////////////////////////////////////////////////

  // Construction of the table for detalhes do fato info//
  tableDetalhesFato(data: any, columns: any) {
    console.log("data:", data);
    console.log("column namevdata", columns);
    console.log("column name", this.columnsDetalhesFato);
    return {
      table: {
        alignment: 'center',
        headerRows: 1,
        widths: ['auto', '50%'],
        fontSize: 8,
        body: this.buildTableBodyDetalhesFato(data, columns)
      }
    };
  }

  buildTableBodyDetalhesFato(data: any, columns: any) {
    console.log("data2:", data);
    console.log("column name2", columns);
    console.log("column name", this.columnsDetalhesFato);
    var body = [];

    body.push(this.columnsDetalhesFato);

    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        try {
          //passing the parametres of the push() as an array of objects to allow the custom of the data inside the table
          dataRow.push({ text: row[column].toString(), fontSize: 6 });
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
  /////////////////////////////////////////////////////////////

  // Construction of the table for Periciandos info//
  tablePericiandos(data: any, columns: any) {

    return {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
        fontSize: 8,
        body: this.buildTableBodyPericiandos(data, columns)
      }
    };
  }

  buildTableBodyPericiandos(data: any, columns: any) {

    var body = [];

    body.push(this.columnsPericiandos);

    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        try {
          //passing the parametres of the push() as an array of objects to allow the custom of the data inside the table
          dataRow.push({ text: row[column].toString(), fontSize: 6 });
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
  /////////////////////////////////////////////////////////////

  //Construction of the table for Outras Pericias info 

  tableOutrasPericias(data: any, columns: any) {
    return {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto'],
        body: this.buildTableBodyOutrasPericias(data, columns)
      }
    };
  }

  buildTableBodyOutrasPericias(data: any, columns: any) {

    var body = [];

    body.push(this.columnsOutrasPericias);

    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        try {
          //passing the parametres of the push() as an array of objects to allow the custom of the data inside the table
          dataRow.push({ text: row[column].toString(), fontSize: 6 });
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
  ///////////////////////////////////////////////////////////////////////////////////////

  // Construction of the table for Local de pericia info//
  tableLocalPericia(data: any, columns: any) {

    return {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto'],
        fontSize: 8,
        body: this.buildTableBodyLocalPericia(data, columns)
      }
    };
  }
  buildTableBodyLocalPericia(data: any, columns: any) {

    var body = [];

    body.push(this.columnsLocalPericia);

    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        try {
          //passing the parametres of the push() as an array of objects to allow the custom of the data inside the table
          dataRow.push({ text: row[column].toString(), fontSize: 6 });
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
  /////////////////////////////////////////////////////////////

  //Construction of the table guias Relacionadas 
  tableGuiasRelacionadas(data: any, columns: any) {
    return {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto'],
        body: this.buildTableBodyRelacionadas(data, columns)
      }
    };
  }
  buildTableBodyRelacionadas(data: any, columns: any) {

    var body = [];

    body.push(this.columnsGuiasRelacionadas);

    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        try {
          //passing the parametres of the push() as an array of objects to allow the custom of the data inside the table
          dataRow.push({ text: row[column].toString(), fontSize: 6 });
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
  /////////////////////////////////////////////////////////////////

  //function to clean the data 
  replaceNullValues(data) {
    if (data.lenght = 0) {
      data = '';
      return;
    }
    for (const obj of data) {
      if (typeof obj !== 'object') continue;
      for (let k in obj) {
        if (!obj.hasOwnProperty(k)) continue;
        let v = obj[k];
        if (v === null || v === undefined) {
          obj[k] = '  ';
        }
      }
    }

  }
}


