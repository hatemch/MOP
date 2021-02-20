import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {

  public guiaID: string;

  constructor( private router: Router,
    private activatedRoute: ActivatedRoute 
    ) 
  { }

  async ngOnInit() {

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.guiaID = data.codigo;
        console.log(this.guiaID);
      });

  }

  goToIncluir() {

    this.router.navigate(['/menu/incluir-exame']);

  }

  goToDetalhes() {

    this.router.navigate(['/menu/detalhes']);

  }

  goToPericiandos() {

    this.router.navigate(['/menu/periciandos']);

  }

  
  goToOutros() {

    this.router.navigate(['/menu/outras-pericias']);

  }

  goToLocal() {
    this.router.navigate(['/menu/local-pericia']);
  }

}
