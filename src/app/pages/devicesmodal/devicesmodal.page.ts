import { Component, ViewChild, Input, EventEmitter, OnInit } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';
//import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-devicesmodal',
  templateUrl: './devicesmodal.page.html',
  styleUrls: ['./devicesmodal.page.scss'],
})
export class DevicesmodalPage implements OnInit {

  
  // Data passed in by componentProps
  @Input() firstName: string;
  @Input() lastName: string;
  @Input() middleInitial: string;
  

  //@ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;

  
  dataList:any;

  
  constructor(
    private nav:NavController,
    private modalCtrl:ModalController,
    private navParams: NavParams
  ) { 

    // componentProps can also be accessed at construction time using NavParams
    //console.log((navParams.data);
    
    this.dataList = [];
    
    for (let i = 0; i < 25; i++) { 
      this.dataList.push("Devices: "+this.dataList.length);
    }


  }
  handleInput(event) {
    const query = event.target.value.toLowerCase();
    requestAnimationFrame(() => {
      this.dataList.forEach(item => {
        const shouldShow = item.textContent.toLowerCase().indexOf(query) > -1;
        item.style.display = shouldShow ? 'block' : 'none';
      });
    });
  }

  loadData(event) {    
    setTimeout(() => {
      //console.log(('Done');
      for (let i = 0; i < 10; i++) { 
        this.dataList.push("Devices: "+this.dataList.length);
      }
      event.target.complete();
 
      // App logic to determine if all data is loaded
      // and disable the infinite scroll
      if (this.dataList.length == 1000) {
        event.target.disabled = true;
      }
    }, 500);
  }
 
  /*
  toggleInfiniteScroll() {
    this.infiniteScroll.disabled = !this.infiniteScroll.disabled;
  }
  */

  ngOnInit() {

     
  }
  
  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.    
    //console.log(("ionViewWillEnter");
  }


  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    //console.log(("ionViewDidEnter");    
  
  }

  ionViewWillLeave() {
    // Disparado quando o roteamento de componentes está prestes a ser animado.    
    //console.log(("ionViewWillLeave");
  }

  ionViewDidLeave() {
    // Disparado quando o roteamento de componentes terminou de ser animado.    
    //console.log(("ionViewDidLeave");
  }
  
  closeModal()
  {
    this.modalCtrl.dismiss();
  }

  clickedSearch () {
    
  }


}
