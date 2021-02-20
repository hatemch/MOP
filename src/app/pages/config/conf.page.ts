import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { environment } from "../../../environments/environment.prod"
//import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { Device } from '@ionic-native/device/ngx';


@Component({
  selector: 'app-conf',
  templateUrl: './conf.page.html',
  styleUrls: ['./conf.page.scss'],
})
export class confPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private device: Device,
   // private printer: Printer    
  ) { }

ngOnInit() {  
  //print();

}

ionViewWillEnter() {
  // Disparado quando o roteamento de componentes está prestes a se animar.    
  ////console.log(("ionViewWillEnter");    
}


ionViewDidEnter() {
  // Disparado quando o roteamento de componentes terminou de ser animado.        
 // //console.log(("ionViewDidEnter");   
 //console.log(('Device UUID is...: ' + this.device.uuid);  
 //this.printer.isAvailable().then(this.onSuccess, this.onError);
  

}

ionViewWillLeave() {
  // Disparado quando o roteamento de componentes está prestes a ser animado.    
  ////console.log(("ionViewWillLeave");
}

ionViewDidLeave() {
  // Disparado quando o roteamento de componentes terminou de ser animado.    
  ////console.log(("ionViewDidLeave");
  
} 

print() {
  //this.platform.ready().then(() => {
  // if(this.platform.is('cordova')){
  //this.printer.isAvailable().then(this.onSuccess, this.onError);
}

onSuccess() {    
  /*
  let options: PrintOptions = {
    name: 'MyDocument',
    //printerId: 'printer007',
    duplex: true,
    landscape: true,
    grayscale: true
  }
   //console.log(('Sucess Load Printer!!!')
   */
};
    
    
onError(){
    alert('Error : printing is unavailable on your device ');
} 




goBack() {
  this.navCtrl.back();
}

}
