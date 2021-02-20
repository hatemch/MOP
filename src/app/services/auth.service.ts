import { Injectable } from '@angular/core';
import { Platform, NavController } from '@ionic/angular'
//import { Network }      from '@ionic-native/network';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Http, Headers, RequestOptions } from '@angular/http';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from './env.service';
//import { tap }          from 'rxjs/operators';
//import { User }         from '../models/user';
import { NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment.prod';
//import { Base64 } from '@ionic-native/base64/ngx';
import { Storage } from '@ionic/storage';
import { reject } from 'q';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private headers = new Headers();
  private coletionsData: any;
  public isLoggedIn = false;

  public CodigoUsuarioSuporte: string = sessionStorage.getItem('DataUser') ? JSON.parse(atob(sessionStorage.getItem('DataUser')))[0].CodigoUsuarioSuporte : "";
  public CodigoUsuarioSistema: string = sessionStorage.getItem('DataUser') ? JSON.parse(atob(sessionStorage.getItem('DataUser')))[0].CodigoUsuarioSistema : "";
  public NomeUsuarioSistema: string = sessionStorage.getItem('DataUser') ? JSON.parse(atob(sessionStorage.getItem('DataUser')))[0].NomeUsuario : "";
  public Perfil: string = sessionStorage.getItem('DataUser') ? JSON.parse(atob(sessionStorage.getItem('DataUser')))[0].Perfil : "";

  public CodigoMenuSistemaPai: number = 22;
  public SessionIPCliente: string;
  public HashKey: string = sessionStorage.getItem('HashKey') ? sessionStorage.getItem('HashKey') : "";

  public API_HOST: string = this.env.API_HOST;
  public API_URL: string = this.env.API_URL;
  public API_URLUserDET: string = this.env.API_URLUserDET;
  public DEFINE_ENV: string;

  // 13/12/2019, Lina
  // Permissoes do usuário
  public permissoesUsuario: any = sessionStorage.getItem('PermissoesUsuario') ? JSON.parse(atob(sessionStorage.getItem('PermissoesUsuario'))) : [];

  constructor(
    private http: HttpClient,
    private platform: Platform,
    // private network: Network,
    private env: EnvService,
    private alertService: AlertService,
    // private base64: Base64   
    private db: Storage
  ) {

    this.headers.append('Content-Type', 'application/json; charset=utf-8');

    if (this.env.DEFINE_ENV == 'Debug') {
      this.API_HOST = env.API_HOST_DEBUG
      this.API_URL = env.API_URL_DEBUG
    }

  }


  /**
   * Encodes multi-byte Unicode string into utf-8 multiple single-byte characters
   * (BMP / basic multilingual plane only).
   *
   * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars.
   *
   * Can be achieved in JavaScript by unescape(encodeURIComponent(str)),
   * but this approach may be useful in other languages.
   *
   * @param   {string} unicodeString - Unicode string to be encoded as UTF-8.
   * @returns {string} UTF8-encoded string.
   */
  public utf8Encode(unicodeString) {
    if (typeof unicodeString != 'string') throw new TypeError('parameter ‘unicodeString’ is not a string');
    const utf8String = unicodeString.replace(
      /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
      }
    ).replace(
      /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
      }
    );
    return utf8String;
  }

  /**
  * Decodes utf-8 encoded string back into multi-byte Unicode characters.
  *
  * Can be achieved JavaScript by decodeURIComponent(escape(str)),
  * but this approach may be useful in other languages.
  *
  * @param   {string} utf8String - UTF-8 string to be decoded back to Unicode.
  * @returns {string} Decoded Unicode string.
  */
  public utf8Decode(utf8String) {
    if (typeof utf8String != 'string') throw new TypeError('parameter ‘utf8String’ is not a string');
    // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
    const unicodeString = utf8String.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
      function (c) {  // (note parentheses for precedence)
        var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f);
        return String.fromCharCode(cc);
      }
    ).replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
      function (c) {  // (note parentheses for precedence)
        var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
        return String.fromCharCode(cc);
      }
    );
    return unicodeString;
  }

  public convertUtf8ToAscii(str: String) {
    var asciiStr = '';
    var refTable = { // Reference table Unicode vs ASCII
      199: 128, 252: 129, 233: 130, 226: 131, 228: 132, 224: 133, 231: 135, 234: 136, 235: 137, 232: 138,
      239: 139, 238: 140, 236: 141, 196: 142, 201: 144, 244: 147, 246: 148, 242: 149, 251: 150, 249: 151
    };
    for (var i = 0; i < str.length; i++) {
      var ascii = refTable[str.charCodeAt(i)];
      if (ascii != undefined)
        asciiStr += '%' + ascii;
      else
        asciiStr += str[i];
    }
    return asciiStr;
  }

  public ascii_to_hexa(str: String) {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n++) {
      var hex = Number(str.charCodeAt(n)).toString(16);
      arr1.push(hex);
    }
    return arr1.join('');
  }

  convertToExcel(data, fileName) {

    //Convert to CSV
    // const items = data;
    // const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    // const header = Object.keys(items[0]);
    // let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    // csv.unshift(header.join(','));
    // csv = csv.join('\r\n');

    // const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // console.log('csv', csv);

    let date = new Date();
    //Download the file as CSV
    var downloadLink = document.createElement("a");

    var blob = new Blob([excelBuffer], {
      type: EXCEL_TYPE
    });
    // var blob = new Blob(["\ufeff", csv]);
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = fileName + '-' + date.toLocaleDateString() + ".xlsx";  //Name the file here
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

  }

  public UTF8ArrToStr(aBytes: any) {

    var sView = '';

    for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
      nPart = aBytes[nIdx];
      sView += String.fromCharCode(
        nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
          /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
          (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
          : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
            (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
            : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
              (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
              : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
                (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
                : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
                  (nPart - 192 << 6) + aBytes[++nIdx] - 128
                  : /* nPart < 127 ? */ /* one byte */
                  nPart
      );
    }

    return sView;

  }


  Login = async function (form: NgForm) {
    //--------------------------------------------------------------------------------------------    
    // Função Login 
    // Criação / Atualização: 24/07/2019 as 15:35          
    // Por Gilson DeLima    
    //--------------------------------------------------------------------------------------------
    //this.alertService.showLoader("Processando... Aguarde por favor!!!");    


    let json: string = JSON.stringify(form.value);
    json = this.encripta(json);
    // let ParamDataJson = btoa(JSON.stringify(form.value)); // encode string 
    let ParamDataJson = btoa(json); // encode string 
    let strDataJson = atob(ParamDataJson);                // decode string
    let StoreProcName = 'spUsuarioAuthentication'

    const paramUrlAPI = this.API_HOST + this.API_URL + '/authentication?';
    const paramsAPI = 'StoreProcName=' + StoreProcName + '&DataJson=' + ParamDataJson; //+ "&Hashkey="+ParamHashkey;

    const EngineAPI = paramUrlAPI + paramsAPI
    ////console.log((EngineAPI);
    return new Promise((resolve, reject) => {
      this.coletionsData = this.http.get(EngineAPI);
      this.coletionsData.subscribe(
        data => {
          if (data[0].success) {
            let dataUser: any = data[0].results;
            sessionStorage.setItem('HashKey', data[0].hashkey)
            sessionStorage.setItem('DataUser', dataUser)
            let resultado: any = JSON.parse(atob(sessionStorage.getItem('DataUser')))[0]

            // this.HashKey              = data[0].hashkey;
            // let resultado: any        = data[0];
            // this.CodigoUsuarioSuporte = JSON.parse(atob(resultado.results))[0].CodigoUsuarioSuporte;


            this.HashKey = sessionStorage.getItem('HashKey');

            this.CodigoUsuarioSuporte = resultado.CodigoUsuarioSuporte;
            this.CodigoUsuarioSistema = resultado.CodigoUsuarioSistema
            this.NomeUsuarioSistema = resultado.NomeUsuario;
            this.Perfil = resultado.Perfil;
            this.permissoesUsuario = this.consultarPermisoes();

            /*
            this.db.set('LSU', data[0].results);
            this.db.set('HKEY', data[0].hashkey);
            */
          }
          else {
            sessionStorage.setItem('SessionConection', '0');
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: 'autenticação no Sistema', pMessage: data[0].message });
          }
          let ResultsDecode = JSON.parse(this.utf8Decode(JSON.stringify(atob(data[0].results))));
          data[0].results = btoa(ResultsDecode);
          resolve(data);
        },
        (error: any) => {
          this.alertService.presentAlert({ pTitle: 'Atenção', pSubtitle: 'Servidor Indisponível. Tente mais tarde!!!', pMessage: 'Status Error:' + error.status + ' | ' + error.statusText });
          //console.log(("Error: ", error);
        }
      );
    });
  }


  QueryStoreProc = async function (MetodoNameAPI: string, StoreProcName: string, ParamsJson: any) {
    //--------------------------------------------------------------------------------------------    
    // Função Gerenerica de consulta no Service API  
    // Criação / Atualização: 29/07/2019 as 10:42          
    // Por Gilson DeLima    
    //--------------------------------------------------------------------------------------------
    // Params: opcao = ex: ConsultaGrupos, consultaJson = ex: paramsGrupo
    //--------------------------------------------------------------------------------------------
    //this.alertService.showLoader("Processando... Aguarde por favor!!!"); 
    let json: string = JSON.stringify(ParamsJson);
    json = this.encripta(json);
    // let ParamDataJson = btoa(JSON.stringify(ParamsJson)); // encode string 
    let ParamDataJson = btoa(json); // encode string 

    //let strDataJson = atob(ParamDataJson);                // decode string
    ////console.log((strDataJson);              
    //ConsultaMenu
    /*
    let headers = new Headers(
    {
      'Content-Type' : 'application/json'
    });
    let options = new RequestOptions({ headers: headers });
    
    let data = JSON.stringify({
      StoreProcName:StoreProcName,
      DataJson: ParamDataJson      
    });
    
    */

    const paramUrlAPI = this.API_HOST + this.API_URL + '/' + MetodoNameAPI + '?';

    const paramsAPI = 'StoreProcName=' + StoreProcName + '&DataJson=' + ParamDataJson;

    const EngineAPI = paramUrlAPI + paramsAPI;

    const EngineAPIDebug = this.env.API_HOST_DEBUG + this.env.API_URL_DEBUG + '/' + MetodoNameAPI + '?' + paramsAPI;
    //console.log(ParamDataJson)
    //console.log(EngineAPI);    

    /*
    const EngineAPIDebug = this.env.API_HOST_DEBUG + this.env.API_URL_DEBUG + '/' + MetodoNameAPI + '?'+paramsAPI;        
    console.log(EngineAPIDebug)
    */

    this.alertService.presentToast('Processando...');
    return new Promise((resolve, reject) => {
      this.coletionsData = this.http.get(EngineAPI);
      this.coletionsData.subscribe(
        data => {
          let ResultsDecode = JSON.parse(this.utf8Decode(JSON.stringify(atob(data[0].results))));
          data[0].results = btoa(ResultsDecode);
          resolve(data);
        },
        (error: any) => {
          this.alertService.presentAlert({ pTitle: 'Atenção', pSubtitle: 'Servidor ou Método Indisponível. Tente mais tarde!!!', pMessage: 'Status Error:' + error.status + ' | ' + error.statusText });
          //console.log(("Error: ", error);
        }
      );
    });
  }

  QueryStoreProcPost = async function (MetodoNameAPI: string, StoreProcName: string, ParamsJson: any) {
    // --------------------------------------------------------------------------------------------    
    // Função Gerenerica de consulta no Service API
    // Criação / Atualização: 29/07/2019 as 10:42
    // Por Gilson DeLima
    // --------------------------------------------------------------------------------------------
    // Params: opcao = ex: ConsultaGrupos, consultaJson = ex: paramsGrupo
    // --------------------------------------------------------------------------------------------
    // this.alertService.showLoader("Processando... Aguarde por favor!!!");

    let json: string = JSON.stringify(ParamsJson);
    json = this.encripta(json);
    // let ParamDataJson = btoa(JSON.stringify(ParamsJson)); // encode string 
    let ParamDataJson = btoa(json); // encode string 

    // ParamsJson =  this.utf8Encode(JSON.stringify(ParamsJson));
    // ParamsJson = ParamsJson.replace(/\\/g, '');
    // console.log('json:', ParamsJson);
    // const ParamDataJson = btoa(ParamsJson); // encode string


    // let strDataJson = atob(ParamDataJson);                // decode string
    // console.log((strDataJson);
    // ConsultaMenu
    /*
    let headers = new Headers(
    {
      'Content-Type' : 'application/json'
    });
    let options = new RequestOptions({ headers: headers });
    let data = JSON.stringify({
      StoreProcName:StoreProcName,
      DataJson: ParamDataJson
    });
    */

    const paramUrlAPI = this.API_HOST + this.API_URL + '/' + MetodoNameAPI;
    console.log("api:", paramUrlAPI)
    //const paramsAPI = 'StoreProcName=' + StoreProcName + '&DataJson=' + ParamDataJson;

    //const EngineAPI = paramUrlAPI + paramsAPI;

    // let data2 = {
    //   'StoreProcName': StoreProcName,
    //   'DataJson': ParamDataJson
    // };

    const data2 = new FormData();
    data2.append('StoreProcName', StoreProcName);
    data2.append('DataJson', ParamDataJson);

    console.log("data2:", data2);

    //const EngineAPIDebug = this.env.API_HOST_DEBUG + this.env.API_URL_DEBUG + '/' + MetodoNameAPI + '?' + paramsAPI;
    // console.log(ParamDataJson)
    // console.log(EngineAPI);

    /*
    const EngineAPIDebug = this.env.API_HOST_DEBUG + this.env.API_URL_DEBUG + '/' + MetodoNameAPI + '?'+paramsAPI;        
    console.log(EngineAPIDebug)
    */

    // this.alertService.presentToast("Processando...");


    return new Promise(resolve => {
      this.coletionsData = this.http.post(paramUrlAPI, data2);
      this.coletionsData.subscribe(
        data => {
          let ResultsDecode = JSON.parse(this.utf8Decode(JSON.stringify(atob(data[0].results))));
          data[0].results = btoa(ResultsDecode);
          resolve(data);
        },
        (error: any) => {
          this.alertService.presentAlert({
            pTitle: 'Atenção',
            pSubtitle: 'Servidor ou Método Indisponível (' + StoreProcName + '). Tente mais tarde!!!',
            pMessage: 'Status Error:' + error.status + ' | ' + error.statusText
          });
          resolve(error);
        }
      );
    });
  }

  QueryOnline = async function (MetodoNameAPI: string, Params: any) {
    // --------------------------------------------------------------------------------------------    
    // Função Gerenerica de consulta no Service API
    // Criação / Atualização: 29/07/2019 as 10:42
    // Author: A clever, kind peruvian guy.

    // let json: string = JSON.stringify(ParamsJson);
    // json = this.encripta(json);
    // let ParamDataJson = btoa(json); // encode string 

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Authorization': 'my-auth-token'
      })
    };

    const paramUrlAPI = this.API_HOST + this.API_URL + '/' + MetodoNameAPI;
    console.log("api:", paramUrlAPI)

    return new Promise(resolve => {
      this.coletionsData = this.http.post(paramUrlAPI, Params);
      this.coletionsData.subscribe(
        data => {
          // let ResultsDecode = JSON.parse(this.utf8Decode(JSON.stringify(atob(data[0].results))));
          // data[0].results = btoa(ResultsDecode);
          resolve(data);
        },
        (error: any) => {
          this.alertService.presentAlert({
            pTitle: 'Atenção',
            pSubtitle: 'Servidor ou Método Indisponível (' + MetodoNameAPI + '). Tente mais tarde!!!',
            pMessage: 'Status Error:' + error.status + ' | ' + error.statusText
          });
          resolve(error);
        }
      );
    });
  }
  QueryOnlineUserDetran = async function (MetodoNameAPI: string, Params: any) {
    // --------------------------------------------------------------------------------------------    
    // Função Gerenerica de consulta no Service API
    // Criação / Atualização: 29/07/2019 as 10:42
    // Author: A clever, kind peruvian guy.

    // let json: string = JSON.stringify(ParamsJson);
    // json = this.encripta(json);
    // let ParamDataJson = btoa(json); // encode string 

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        // 'Authorization': 'my-auth-token'
      })
    };
    let logado: any = Params.logado;
    logado = this.encripta(Params.logado.toString());
    //let paramLogado = btoa(logado); // encode string 

    let usuario: any = Params.usuario;
    usuario = this.encripta(Params.usuario.toString());
    //let paramUsuario = btoa(usuario); // encode string 
   let Hashkey: any =Params.Hashkey;
   Hashkey = this.encripta(Params.Hashkey);
    // const paramUrlAPI = this.API_HOST + this.API_URL + MetodoNameAPI + '?';
    // const paramsAPI = 'logado=' + logado + '&usuario=' + usuario; //+ "&Hashkey="+ParamHashkey;
    // const getResponseUserDet = paramUrlAPI + paramsAPI;

    const paramUrlAPI = this.API_URLUserDET + '/' + MetodoNameAPI +'?'+'logado='+logado+'&usuario='+usuario+'&hashkey='+Hashkey;
    console.log("api:", paramUrlAPI)

    return new Promise(resolve => {
      this.coletionsData = this.http.get(paramUrlAPI);
      this.coletionsData.subscribe(
        data => {
          // let ResultsDecode = JSON.parse(this.utf8Decode(JSON.stringify(atob(data[0].results))));
          // data[0].results = btoa(ResultsDecode);
          resolve(data);
          console.log('resolve', resolve(data))
        },
        (error: any) => {
          this.alertService.presentAlert({
            pTitle: 'Atenção',
            pSubtitle: 'Servidor ou Método Indisponível (' + MetodoNameAPI + '). Tente mais tarde!!!',
            pMessage: 'Status Error:' + error.status + ' | ' + error.statusText
          });
          resolve(error);
        }
      );
    });
  }


  private consultarPermisoes() {
    const params = {
      CodigoUsuarioSistema: this.CodigoUsuarioSistema,
      CodigoMenuSistemaPai: this.CodigoMenuSistemaPai,
      Hashkey: this.HashKey
    };
    this.QueryStoreProc('Executar', 'spPermissoesPorUsuario', params).then(res => {
      const resultado: any = res[0];
      try {
        if (resultado.success) {
          sessionStorage.setItem('PermissoesUsuario', resultado.results)
          let permissores = JSON.parse(atob(sessionStorage.getItem('PermissoesUsuario')));
          this.permissoesUsuario = permissores;
        } else {
          console.log('Sem permissões');
        }
      } catch (err) {
        console.log('Sem permissões');
      }
    });
  }

  QueryStoreProcExportData = async function (MetodoNameAPI: string, StoreProcName: string, ParamsJson: any, path: any, filename: any) {
    // ----------------------------------------------------
    // Função Gerenerica de consulta no Service API
    // Criação / Atualização: 20/03/2020 02:50
    const ParamDataJson = btoa(JSON.stringify(ParamsJson)); // encode string

    const paramUrlAPI = this.API_HOST + this.API_URL + '/' + MetodoNameAPI + '?';

    const paramsAPI = 'StoreProcName=' + StoreProcName + '&DataJson=' + ParamDataJson + '&path=' + path + '&nomearquivo=' + filename;

    const EngineAPI = paramUrlAPI + paramsAPI;

    const EngineAPIDebug = this.env.API_HOST_DEBUG + this.env.API_URL_DEBUG + '/' + MetodoNameAPI + '?' + paramsAPI;

    this.alertService.presentToast('Processando...');
    return new Promise((resolve) => {
      this.coletionsData = this.http.get(EngineAPI);
      this.coletionsData.subscribe(
        data => {
          // const ResultsDecode  = JSON.parse( this.utf8Decode(JSON.stringify(atob(data[0].results))));
          // data[0].results = btoa(ResultsDecode);
          resolve(data);
        },
        (error: any) => {
          this.alertService.presentAlert({
            pTitle: 'Atenção',
            pSubtitle: 'Servidor ou Método Indisponível. Tente mais tarde!!!',
            pMessage: 'Status Error:' + error.status + ' | ' + error.statusText
          });
        }
      );
    });
  }

  QueryStoreProcExportHtml = async function (MetodoNameAPI: string, StoreProcName: string, ParamsJson: any, path: any, filename: any) {


    const ParamDataJson = btoa(JSON.stringify(ParamsJson)); // encode string

    const paramUrlAPI = this.API_HOST + this.API_URL + '/' + MetodoNameAPI + '?';

    const paramsAPI = 'StoreProcName=' + StoreProcName + '&DataJson=' + ParamDataJson + '&path=' + path + '&nomearquivo=' + filename;

    const EngineAPI = paramUrlAPI + paramsAPI;

    const EngineAPIDebug = this.env.API_HOST_DEBUG + this.env.API_URL_DEBUG + '/' + MetodoNameAPI + '?' + paramsAPI;

    this.alertService.presentToast('Processando...');
    return new Promise((resolve) => {
      this.coletionsData = this.http.get(EngineAPI);
      this.coletionsData.subscribe(
        data => {
          // const ResultsDecode  = JSON.parse( this.utf8Decode(JSON.stringify(atob(data[0].results))));
          // data[0].results = btoa(ResultsDecode);
          resolve(data);
        },
        (error: any) => {
          this.alertService.presentAlert({
            pTitle: 'Atenção',
            pSubtitle: 'Servidor ou Método Indisponível. Tente mais tarde!!!',
            pMessage: 'Status Error:' + error.status + ' | ' + error.statusText
          });
        }
      );
    });
  }


  public encripta(valor: string): string {
    let retorno: string;
    let stexto: string;
    retorno = "";
    try {
      stexto = valor.trim();
    } catch (err) {
      stexto = valor;
    }
    if (stexto == null)
      stexto = "";
    if (stexto == "")
      return stexto;
    while (true) {
      let letra: string;
      let nnumero: number;
      let snumero: string;
      if (stexto.length > 1)
        letra = stexto.substring(0, 1);
      else
        letra = stexto;

      nnumero = letra.toString().charCodeAt(0);
      nnumero += 166;
      snumero = nnumero.toString();
      if (snumero.length < 3)
        snumero = "0" + snumero;
      if (snumero.length < 3)
        snumero = "0" + snumero;

      retorno += snumero;
      if (stexto.length > 1)
        stexto = stexto.substring(1);
      else
        stexto = "";
      if (stexto == "")
        break;
    }
    return retorno;
  }

}