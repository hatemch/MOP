import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  AppName = "Mobilidade em Operações Policiais";
  AppNameSigla = "MOP";

  // API_HOST = "http://localhost:"; // LOCALHOST 
  // API_HOST = "http://192.168.1.5"; // IIS  LOCALHOST MARIA

  // API_HOST = "http://192.168.15.15"; // IIS  LOCALHOST LEVEL
  // API_HOST = "http://192.168.15.5"; // IIS  LOCALHOST AGUAS CLARAS
  // API_URL = "/ServiceMopIonic/api"; // LOCALHOST


  //  API_HOST = "http://mop.ssp.ba.gov.br" // SERVERPRD
  // URL_SISTEMA = 'http://mop.ssp.ba.gov.br/';// SERVERPRD

  API_HOST = "http://200.187.30.26" // DEVSERVER
  URL_SISTEMA = 'http://200.187.30.26';// DEVSERVER

  API_URL = "/ServiceMopIonic/api"; // SERVICE
  NAME_HOST = "/ServiceMopIonic/";
  API_URLUserDET="http://mop.ssp.ba.gov.br/ServiceAlertaVeiculo/api/Geral"

  API_HOST_DEBUG = "http://localhost:60313";
  API_URL_DEBUG = "/api";
  DEFINE_ENV = "Dev" // Define: [ Debug, Dev, Homo, Prod ]    

  PATH_WEB = 'd:\\web\\sites\\';  // pasta fisica do servidor web


  constructor() { }
  /**
   * Funcao para encontrar objetos em uma coleccao de objetos
   * Autor: Lina Jimenez
   * Data: 03/12/2019
   * Exemplo: collection = _findWhere(collection, { key1: val1, keyN: valN })
   * @param collection Array no qual vai ser procurado algum item
   * @param arg objeto com os valores de pesquisa
   */
  _findWhere(collection: any[], arg: object | null) {

    function callback(currentValue, index, array) {
      let flag: boolean = true

      for (const key in arg) {
        if (flag) {
          if (currentValue.hasOwnProperty(key)) {
            if (currentValue[key] === null) {
              currentValue[key] = '';
            }

            if (Number(currentValue[key])) {
              currentValue[key] = currentValue[key].toString();
            }
            if (Number(arg[key])) {
              arg[key] = arg[key].toString();
            }
            flag = (currentValue[key].toLowerCase().indexOf(arg[key].toLowerCase()) > -1) ? true : false;

          }
        }
      }

      if (flag) {
        return currentValue
      }
    }

    return collection.filter(callback, arg)

  }

}
