import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from "rxjs/operators";


//MODELS

//SERVICE
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class MapService {

  public mapServiceURL: any = environment.mapServiceURL;

  public mapURL: any = this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapServiceURL);

  constructor(
    private domSanitizer: DomSanitizer,
    private http: HttpClient,
  ) { }

  async getToken() {
    return this.http.get(this.mapServiceURL + '/getToken').toPromise().then((response: any) => {
      if (response.status) {
        console.info(response.message);
        return response.result;
      } else {
        console.error('error');
        return;
      }
    });
  }

  async setCoordenates(coordenates: any) {
    coordenates.marker ? coordenates.marker = btoa(coordenates.marker) : "";
    return this.http.post(this.mapServiceURL + '/setCoordenates', coordenates).toPromise().then((response: any) => {
      if (response.status) {
        console.info(response.message);
      } else {
        console.error(response.message);
      }
    })
  }

  // getmapa(option:any, infostring: any, _value:any){
    
  //   let params = new HttpParams()
  //   .set("token", _value)
  
  //   if(option=='1'){ // One Value
  //     this.mapURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapServiceURL + infostring + _value);
  //   } else if(option=='2'){ //Massive Values
  //     this.mapURL = this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapServiceURL + infostring + params);
  //   }
  //   return this.mapURL;
  // }


  getMapaURL(params: any){
    
    return this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapServiceURL + '?' + params);
  }

  getMapaURLMassive(params: any){
    
    return this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapServiceURL + '/showMassiveMap?' + params);
  }

  getMapaUrlRandom(){
    return this.domSanitizer.bypassSecurityTrustResourceUrl(this.mapServiceURL);
  }
}

