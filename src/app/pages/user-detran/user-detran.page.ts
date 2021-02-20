import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { UserDet } from 'src/app/models/userDet';
import { User } from 'src/app/models/user';
import { NavController, Events, ModalController, AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Page } from 'src/app/models/page';


@Component({
  selector: 'app-user-detran',
  templateUrl: './user-detran.page.html',
  styleUrls: ['./user-detran.page.scss'],
})
export class UserDetranPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static READUNIDADE:string= 'READUNIDADE';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static APP_NAME: string = EnvService.name;

  private APP_NAME: string = this.env.AppName;

  public AppName: String = environment.AppName;

  public nomePesquisar: string = "";

  familia: Object[];

  public CodigoUsuario: any;
  public NomeUsuarioLogado: string;
  public user = new User();
  public userDets: any[];

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public page = new Page();
  public columns = [{ text: 'Código', bold: true }, { text: 'Nome', bold: true }, { text: 'CPF', bold: true }, { text: 'PIM', bold: true }, { text: 'IMEI', bold: true }, { text: 'RG', bold: true }, { text: 'UF', bold: true }, { text: 'Município', bold: true }, { text: 'Código Pessoa', bold: true }, { text: 'Número Lote', bold: true }];

  public userDet = new UserDet();
  public data: any[];
  showTable: boolean;
  public showUnidade: boolean=false;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,
    private router: Router,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();

    //this.CRUDUserDet('READ','');
  }

  save(form: NgForm) {
    // if (this.userDet.codigo) {
    //   //ADD CODIGO TO UPDATE 
    //   form.value.codigo = this.userDet.codigo;
    //   this.CRUDUserDet(UserDetranPage.CRUD_UPDATE, form.value, this.showTable, exportExcel);
    // }
    // else {
    //   this.CRUDUserDet(UserDetranPage.CRUD_CREATE, form.value, this.showTable, exportExcel);
    // }

    this.CRUDUserDet(UserDetranPage.CRUD_CREATE, form.value, this.showTable);
  }

  ionViewDidEnter() {
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    
    if(this.user.perfil=='SUPERVISOR DE UNIDADE'){
      this.showUnidade=true;
      this.user.nomegrupo=localStorage.getItem('unidadeUsuario')
      this.CRUDUserDet('READUNIDADE', {unidade:this.user.nomegrupo}, 'table');
      this.showTable = false;
    }else{
      this.CRUDUserDet('READ', '', 'table');
      this.showTable = false;
    }
    
    
    
  }

  /**
   * Autor: Hatem chaouch 
   * Data: 03/03/2020
   * @param procedure Nome da procedura armazanada no banco de dados
   * @param params JSON do parametros precisados pelo procedure
   * @param next Callback executado depois de executar a request
   */
  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD == 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD == 'READUNIDADE') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD == 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD == 'DELETE') && (this.permissoes.Deletar > 0))
        || ((params.StatusCRUD == 'PESQUISAR') && (this.permissoes.Pesquisar > 0))
        //|| (procedure === 'spUserDetran')
      ) {

        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
          const resultado: any = res[0];
          try {
            if (resultado.success) {
              next(resultado);
              this.alertService.showLoader(resultado.message, 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: resultado.message });
              this.navCtrl.back();
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.AppName, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: this.AppName, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }
  private CRUDUserDet(_statusCRUD, _formValues, _option: any) {
    this.sendRequest('spUserDetran', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.userDets = results.map(function callback(value) {

        let userDet = new UserDet();
        userDet.codigo = value.codigo;
        userDet.pim = value.pim;
        userDet.imei = value.imei;
        userDet.cpf = value.cpf;
        userDet.codigo_pessoa = value.codigo_pessoa;
        userDet.numero_lote = value.numero_lote;
        userDet.nome = value.NOME;
        userDet.rg = value.RG;
        userDet.uf = value.UF;
        userDet.municipio = value.NOME_MUNICIPIO;
        userDet.code_municipio = value.CODIGO_MUNICIPIO;
        userDet.unidade = value.unidade;

        return userDet;
      });

      console.log('this.userDets', this.userDets);

      if (_option == 'table') {
        if (this.userDets.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
          return;
        }
        this.showTable = true;
        // this.showMapScreem = false;
        // this.mapURL = "";
      }

    });
  }

  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    });

    if (permissaoModulo.length === 1) {
      this.permissoes = {
        Route: permissaoModulo[0].Route,
        Pesquisar: permissaoModulo[0].Pesquisar,
        Inserir: permissaoModulo[0].Inserir,
        Editar: permissaoModulo[0].Editar,
        Deletar: permissaoModulo[0].Deletar
      };
    } else {
      console.log('Houve um problema nas permissoes do modulo: ', this.router.url);
    }
  }


  goBack() {
    this.router.navigate(['/menu/options/tabs/main/98']);
  }
  NewUserDet() {
    this.router.navigate(['add-user-detran']);
  }

  // DELETE
  public async delete(id: string, value: string) {

    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você deseja apagar <strong>' + value + '?</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          // handler: (blah) => {
          //   console.log('Confirm Cancel: blah');
          // }
        }, {
          text: 'Sim',
          handler: () => {
            this.CRUDUserDet('DELETE', { 'codigo': id }, '');
            this.CRUDUserDet('READ', '', '');
          }
        }
      ]
    });

    await alert.present();
  }

  public GetTableData(form: NgForm, exportExcel) {

    // if(!form.value.nomePesquisar){
    //   form.value.nomePesquisar = "";
    // }

    this.sendRequest('spUserDetran', {
      StatusCRUD: 'PESQUISAR',
      formValues: { 
        'nomePesquisar': this.nomePesquisar ? this.nomePesquisar : "", 
        'unidade':this.user.nomegrupo ? this.user.nomegrupo:""}
    }, (resultado) => {
      // this.data = JSON.parse(atob(resultado.results));
      // console.log('table data  :', this.data);
      let results = JSON.parse(atob(resultado.results));

      this.userDets = results.map(function callback(value) {

        let userDet = new UserDet();
        userDet.codigo = value.codigo;
        userDet.pim = value.pim;
        userDet.imei = value.imei;
        userDet.cpf = value.cpf;
        userDet.unidade = value.unidade;
        // userDet.codigo_pessoa = value.codigo_pessoa;
        // userDet.numero_lote = value.numero_lote;
        userDet.nome = value.NOME;
        userDet.rg = value.RG;
        userDet.uf = value.UF;
        userDet.municipio = value.NOME_MUNICIPIO;
        userDet.code_municipio = value.CODIGO_MUNICIPIO;

        return userDet;
      });

      if (this.userDets.length == 0) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        return;
      }

      if (exportExcel) {
        let listexcel = JSON.parse(atob(resultado.results));
        console.log(listexcel);

        for(const i in listexcel){
          delete listexcel[i].pim
          delete listexcel[i].imei
          delete listexcel[i].codigo_pessoa
          delete listexcel[i].numero_lote
        }
        this.Authorizer.convertToExcel(listexcel, "usuariosDetran");
      }


    });
  }


}
