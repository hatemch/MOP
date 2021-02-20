import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController } from '@ionic/angular';
import { IonInfiniteScroll } from '@ionic/angular';
import { NgForm } from '@angular/forms';
//import { FormGroup, FormBuilder, Validators,FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { DevicesmodalPage } from '../devicesmodal/devicesmodal.page'


@Component({
  selector: 'app-devices',
  templateUrl: './devices.page.html',
  styleUrls: ['./devices.page.scss'],
})
export class DevicesPage implements OnInit {


  familia: Object[];

  public CodigoUsuario: any;
  public NomeUsuarioLogado: string;

  public pin : any;
  public imei : any;
  public linha: any;
  

  public segs: any[] = [
    {
      id: 0,
      segmento: 'Todos'
    }
  ];

  public groupsDef: any[] = [
    {
      id: 1,
      nome: 'Todos'
    }
  ];

  public groups: any[] = [
    {
      id: 1,
      nome: 'Todos'
    }
  ];

  public users: any[] = [
    {
      id: 0,
      usuario: 'Todos'
    }
  ];

  public sysos: any[] = [
    {
      id: 1,
      nome: 'Android'
    },
    {
      id: 2,
      nome: 'IOS'
    }
  ];

  public dataReturned: any = 'Dados';

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController
  ) {

    this.familia = [
      {
        nome: 'Vitor',
        sobreNome: 'Borges'
      },
      {
        nome: 'Emerson',
        sobreNome: 'Daniel'
      },
      {
        nome: 'Thiago',
        sobreNome: 'Contre!'
      }
    ];
  }
  
ngOnInit() {

  //console.log((this.familia);
  // this.DataSet = JSON.parse(sessionStorage.SessionUser);      
  //this.setValue(); 
  this.CodigoUsuario = sessionStorage.getItem("SessionCodigoUsuario");
  this.NomeUsuarioLogado = sessionStorage.getItem("SessionNomeUsuario");

}

  
reciverFeedback(respostaFilho) {
  //console.log(('Foi emitido o evento e chegou no pai >>>> ', respostaFilho);
}

ionViewWillEnter() {
  // Disparado quando o roteamento de componentes está prestes a se animar.    
  //console.log(("ionViewWillEnter");
}


ionViewDidEnter() {
  // Disparado quando o roteamento de componentes terminou de ser animado.        
  //console.log(("ionViewDidEnter");
  this.PopulaSeguimento(0);
}

ionViewWillLeave() {
  // Disparado quando o roteamento de componentes está prestes a ser animado.    
  //console.log(("ionViewWillLeave");
}

ionViewDidLeave() {
  // Disparado quando o roteamento de componentes terminou de ser animado.    
  //console.log(("ionViewDidLeave");
}

PopulaSeguimento(item: any) {
  //console.log((item);
  let params = {
    'usuario': sessionStorage.getItem('SessionCodigoUsuario'),
    'todos': '',
    'Hashkey': sessionStorage.getItem("SessionHashkey")
  };

  this.Authorizer.QueryStoreProc('ConsultaSegmentos','', params).then(res => {
    let resultado: any = res;
    try {
      if (resultado.length == 0) {
        //nenhum modulo encontrado
        this.alertService.presentAlert({ pTitle: 'MOP', pSubtitle: 'Menu', pMessage: 'Nenhum segmento encontrado!' });
      } else {
        //mostro os módulos
        //console.log((resultado);
        this.segs = resultado;
      }
    } catch (err) {
      this.alertService.presentAlert({ pTitle: 'MOP', pSubtitle: 'Menu', pMessage: 'Nenhum segmento!' });
    }
  });
}
PopulaGrupos(form: NgForm, event: Events) {
  let params = {
    'usuario': sessionStorage.getItem('SessionCodigoUsuario'),
    'segmento': form.value.Seguimento,
    'nivel': '',
    'grupo': '',
    'todos': '',
    'nome': '',
    'Hashkey': sessionStorage.getItem("SessionHashkey")
  };

  this.Authorizer.QueryStoreProc('ConsultaGrupos','', params).then(res => {
    let resultado: any = res;
    try {
      if (resultado.length == 0) {
        //nenhum modulo encontrado
        this.groups = this.groupsDef;
        this.alertService.presentAlert({ pTitle: 'MOP', pSubtitle: 'Menu', pMessage: 'Nenhum grupo encontrado!' });
      } else {
        //mostro os módulos
        //console.log((resultado);
        this.groups = resultado;
      }
    } catch (err) {
      this.alertService.presentAlert({ pTitle: 'MOP', pSubtitle: '', pMessage: 'Nenhum grupo!' });
    }
  });
}

PopulaUsuarios(form: NgForm, event: Events) {
  //this.grupo = form.value.Seguimento;
  let params = {
    'usuario': sessionStorage.getItem('SessionCodigoUsuario'),
    'segmento': form.value.Seguimento,
    'grupo': form.value.grupo,
    'nome': '',
    'matricula': '',
    'cpf': '',
    'todos': '',
    'Hashkey': sessionStorage.getItem("SessionHashkey")
  };

  this.Authorizer.QueryStoreProc('ConsultaUsuarios', '', params).then(res => {
    let resultado: any = res;
    try {
      if (resultado.length == 0) {
        //nenhum modulo encontrado
        this.alertService.presentAlert({ pTitle: 'MOP', pSubtitle: 'Menu', pMessage: 'Nenhum usuário encontrado!' });
      } else {
        //mostro os módulos
        //console.log((resultado);
        this.users = resultado;
      }
    } catch (err) {
      this.alertService.presentAlert({ pTitle: 'MOP', pSubtitle: 'Menu', pMessage: 'Nenhum usuário!' });
    }
  });
}

async Pesquisar(form: NgForm, event: Events) {
  //console.log((form.value);
  //console.log((event);

  const modal = await this.modalController.create({
    component: DevicesmodalPage,
    componentProps: form.value
  });
  return await modal.present();
}


Adicionar(form: NgForm, event: Events) {
  //console.log((form.value);
  //console.log((event);
  this.alertService.presentAlertCheckbox();
}

Gravar(form: NgForm, event : Events) {
  //form.value.senha = Md5.hashStr(form.value.senha);
  this.Authorizer.Login(form).then(res => {
    ////console.log(("Resultado Json:", res);
    let resultado: any = res[0];
    if (resultado.success == true) {
      this.alertService.showLoader(resultado.message);
    }
  });
}
}
