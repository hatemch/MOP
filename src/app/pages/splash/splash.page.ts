import { Component, OnInit } from '@angular/core';
import { NavController,ModalController } from '@ionic/angular';
import { environment } from "../../../environments/environment.prod"

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  public logoCliente: String = environment.logoCliente; 
  public logoApp    : String = environment.logoApp; 
  public appVersion : String = environment.AppVersion;

  constructor(
    private nav:NavController,
    private modalCtrl:ModalController    
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.closeModal();
    }, 4000);
  }

  closeModal()
  {
    this.modalCtrl.dismiss();
  }

}
