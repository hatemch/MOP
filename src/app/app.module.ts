import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { SplashPageModule} from './pages/splash/splash.module';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage';
import { DevicesmodalPageModule } from './pages/devicesmodal/devicesmodal.module';
import { ConsultaInfracaoModalPageModule } from './pages/consultaInfracaomodal/consultainfracaomodal.module';

import { WebView } from '@ionic-native/ionic-webview/ngx';

import { Camera } from '@ionic-native/camera/ngx';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { IonicSelectableModule } from 'ionic-selectable';

import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { GalleryPageModule } from './pages/gallery/gallery.module';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [   
    BrowserModule, IonicSelectableModule, HttpClientModule, IonicModule.forRoot(), 
    IonicStorageModule.forRoot(), AppRoutingModule, SplashPageModule, 
    DevicesmodalPageModule, ConsultaInfracaoModalPageModule , GalleryPageModule
  ],  
    
  providers: [   
    Geolocation,
    StatusBar,
    SplashScreen,
    //SplashPage,
 
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },  
            
    WebView, Camera, Printer, Device   
  ],
  
  bootstrap: [AppComponent],

})
export class AppModule {}
