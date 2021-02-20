import { Component } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Time } from '@angular/common';
import { timer } from 'rxjs';
import { delay } from 'rxjs/operators';
import { SplashPage } from './/pages/splash/splash.page';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  

  public _APP = {
    "VersionEngineAPI": "1.1.5",
    "Version": "1.0.0",
    "HostDevAPI": "http://192.168.1.3:8081",
    "HostDevLevelAPI": "http://192.168.15.10:8081",
    "HostHomoAPI": "http://200.196.251.212:8081",
    "HostProdAPI": "http://200.196.251.212:8081"
    
  };

 
  constructor(
    private platform: Platform,
    //private splashScreen: SplashScreen,
    private statusBar: StatusBar,   
    private modalController : ModalController
  ) {
    this.initializeApp();
    //this.showLoader();
  }    

  
  
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      //this.splashScreen.hide(); 
      this.SplashModal();          
    });

  }

  async SplashModal() {    
    const modal = await this.modalController.create({
      component: SplashPage,
      componentProps: {Titulo:"Teste"}
    });
    return await modal.present();
  }

  async delay(ms: number) {
    await new Promise(resolve => setTimeout(()=>resolve(), ms)).then(()=>{
      return //console.log(("fired");
    });
  }

  sleep = function(time : number) {
    return new Promise((resolve)=>setTimeout(resolve, time));
  }

}