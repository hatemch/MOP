import { Component, OnInit } from '@angular/core';
import { AuthService }  from 'src/app/services/auth.service';

@Component({
  selector: 'app-menuoptions',
  templateUrl: './menuoptions.page.html',
  styleUrls: ['./menuoptions.page.scss'],
})
export class OptionsPage implements OnInit {

  constructor(
    private Authorizer: AuthService
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    // //console.log(("ionViewDidEnter");  
    
  }
  ionViewDidLeave() {
    // Disparado quando o roteamento de componentes terminou de ser animado.    
    // //console.log(("ionViewDidLeave");      
  }

}
