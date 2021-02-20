import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../../environments/environment.prod";
import { AlertController, NavController } from '@ionic/angular';
import { Md5 } from 'ts-md5';
import { IonicSelectableComponent } from 'ionic-selectable';
//SERVICES
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { PagerService } from '../../_services/index';
import { ValidationsService } from "../../services/validations.service";
//MODELS
import { Segmento } from '../../models/segmento';
import { Municipio } from '../../models/municipio'
import { Unidade } from '../../models/unidade'
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';
import { Perfil } from 'src/app/models/perfil';
import { NgForm } from '@angular/forms';
import { Cargo } from 'src/app/models/cargo';
import { Usuarios_pre } from 'src/app/models/usuarios-pre'



@Component({
  selector: 'app-usuarios-pre',
  templateUrl: './usuarios-pre.page.html',
  styleUrls: ['./usuarios-pre.page.scss'],
})
export class UsuariosPrePage implements OnInit {
  
  @ViewChild(IonicSelectableComponent, { static: true }) unidadeComponent: IonicSelectableComponent;
 
  ngAfterViewInit() {
    this.unidadeComponent.placeholder =  this.usuario_pre.Unidade;
  }
 
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';
  static APP_NAME: string = EnvService.name;
  public AppName: String = environment.AppName;

  pagedItems: any[];
  pager: any = {};

  private permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  };// Permissoes do modulo para o usuario logado

  public segmentos: Array<Segmento> = [];
  public municipios: Array<Municipio> = [];
  public unidades: Array<Unidade> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];
  public usuario_pres: Array<Usuarios_pre> = [];
  public usuarios: Array<User> = [];
  public perfil = new Perfil();
  public perfis: Array<Perfil> = [];
  public cargo = new Cargo();
  public cargos: Array<Cargo> = [];

  public usuario_pre = new Usuarios_pre();

  public user = new User();
  public usuario = new User();
  public footerdisable: boolean = false;
  public flag = 1;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private pagerService: PagerService,
    private alertController: AlertController,
    private validations: ValidationsService
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();
    this.getSegmentos();
    this.getMunicipios();
    //this.getUnidade();
    this.getPerfis();
    
  }
  ionViewDidEnter() {
    this.user = new User();
    this.CRUDuser(UsuariosPrePage.CRUD_READ, '');
    
  }

  public compareWithFn = (o1, o2) => {
    return o1 === o2;
  };
  compareWith = this.compareWithFn;

  private getPerfis() {
    this.sendRequest('spPerfis', {
      StatusCRUD: 'READ',
      formValues: this.perfil
    }, (resultado) => {
      this.perfis = JSON.parse(atob(resultado.results));
      console.log('this.perfil', this.perfis);
    });
  }

  private getSegmentos() {
    document.getElementById('editForm').style.display = 'none';
    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.codigo;
        segmento.segmento = value.segmento.trim();

        return segmento;
      });
      console.log('segmentos', this.segmentos);
    });
  }

  private getMunicipios() {
    console.log("Iam here in municipio");
    document.getElementById('editForm').style.display = 'none';
    this.sendRequest('spMunicipiosUser', { // 'spMunicipioUsuarios'
      StatusCRUD: 'READ',
      formValues: { 'UF': "BA" }
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.municipios = results.map(function callback(value) {
        let municipio = new Municipio();
        municipio.codigo = value.codigo;
        municipio.nome = value.nome.toUpperCase(); // value.municipio
        //municipio.unidade = value.unidade;

        return municipio;
      });
      console.log('Municipio', this.municipios);
    });
  }

  // private getUnidade() {
  //   console.log("Iam here in Unidade");
  //   //document.getElementById('editForm').style.display = 'none';
  //   this.sendRequest('spUnidadeUsuarios', {
  //     StatusCRUD: 'READ',
  //     formValues: ''
  //   }, (resultado) => {
  //     let results = JSON.parse(atob(resultado.results));
  //     this.unidades = results.map(function callback(value) {
  //       let unidade = new Unidade();
  //       unidade.codigo = value.codigo;
  //       unidade.unidade = value.unidade;

  //       return unidade;
  //     });
  //     console.log('Unidade', this.unidades);
  //   });
  // }

  // GRUPOS
  CarregaSegmentoGrupos() {
    console.log(this.usuario_pre.Segmento);
    this.consultarGruposSegmento(this.usuario_pre.Segmento);
  }

  private consultarGruposSegmento(segmento: string) {
    this.sendRequest('spConsultarGruposSegmento', {
      StatusCRUD: 'READ',
      formValues: { 'segmento': segmento }
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      console.log('grupos', results);
      this.grupos = results.map(function callback(value) {
        let grupo = new Grupo();
        grupo.codigo = value.CODIGO;
        grupo.nome = value.NOME;

        return grupo;
      });
    });
  }

  CarregaSegmentoGrupoUsuarios() {
    this.consultarUsuarioGrupo(this.user.grupo);
  }

  private consultarUsuarioGrupo(grupo: string) {
    this.sendRequest('spConsultarUsuarioGrupo', {
      StatusCRUD: 'READ',
      formValues: { 'grupo': grupo }
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.users = results.map(function callback(value) {
        let user = new User();
        user.codigo = value.CODIGO;
        user.nome = value.NOME;

        return user;
      });
      console.log('users', this.users);
    });
  }

  CarregaSegmentoGrupoUsuariosPerfis() {
    this.consultarUsuarioGrupoPerfis(this.user.grupo);
  }

  private consultarUsuarioGrupoPerfis(grupo: string) {
    this.sendRequest('spConsultarUsuarioGrupoPerfil', {
      StatusCRUD: 'READ',
      formValues: {
        'grupo': grupo,
      }
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.usuarios = results.map(function callback(value) {
        let usuario = new User();
        usuario.codigo = value.CODIGO;
        usuario.nome = value.NOME;

        return usuario;
      });
      console.log('users', this.users);
    });
  }

  NewUser() {
    this.router.navigate(['cadastro-user']);
  }

  // NEEDED FUNCTIONS
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
    /* document.getElementById('editForm').style.display = 'none';
    document.getElementById('userTable').style.display = 'block';
    document.getElementById('horizontal-list').style.display = 'block';
    this.usuario_pre.codigo = "0";
    this.CRUDuser(UsuariosPrePage.CRUD_READ, '');  */
    if (document.getElementById('userTable').style.display == 'none') {
      this.Cancel();
    } else {
      this.router.navigate(['/menu/options/tabs/main/98']);
    }

  }

  pesquisar(form: NgForm) {

    form.value.CPF = this.validations.convertToNumber(form.value.CPF);
    form.value.Fone = this.validations.convertToNumber(form.value.Fone);

    if ((form.value.Nome == " ") || (form.value.Nome == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Nome inválido" });
      this.flag = 0;
    } else if ((form.value.CPF == " ") || (form.value.CPF == '') || (form.value.CPF.length < 11)) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "CPF inválido" });
      this.flag = 0;
    } else if ((form.value.Fone == " ") || (form.value.Fone == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Telefone inválido" });
      this.flag = 0;
    } else if ((form.value.Matricula == " ") || (form.value.Matricula == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Matricula inválido" });
      this.flag = 0;
    } else if ((form.value.Email == " ") || (form.value.Email == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Email inválido" });
      this.flag = 0;
    } else if ((form.value.Municipio == " ") || (form.value.Municipio == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Municipio inválido" });
      this.flag = 0;
    } else if ((form.value.Segmento == "0 ") || (form.value.Segmento == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Segmento inválido" });
      this.flag = 0;
    } else if ((form.value.Unidade == " ") || (form.value.Unidade == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Unidade inválido" });
      this.flag = 0;
    } else if ((form.value.Sexo == " ") || (form.value.Sexo == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Sexo inválido" });
      this.flag = 0;
    } else if ((form.value.PIM == " ") || (form.value.PIM == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "PIM inválido" });
      this.flag = 0;
    } else if ((form.value.IMEI == " ") || (form.value.IMEI == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "IMEI inválido" });
      this.flag = 0;
    } else {
      this.flag = 1;
    }
    if (this.flag) {
      if (this.usuario_pre.codigo == "0") {
        this.CRUDUserDet(UsuariosPrePage.CRUD_CREATE, form.value);
      }
      else {
        //console.log('Info user(form):', form.value)
        this.CRUDUserDet(UsuariosPrePage.CRUD_UPDATE, form.value);
      }
    }
    else {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Preencha os campos" });
    }

  }

  private CRUDuser(_statusCRUD, _formValues) {
    this.sendRequest('spUsuariosPre', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));

      let i = 0;
      for (i = 0; i < results.length; i++) {
        results[i].cpf = this.validations.parseIDDBtoFormat(results[i].cpf)
      }

      this.usuario_pres = results.map(function callback(value) {
        let usuario_pre = new Usuarios_pre();
        usuario_pre.codigo = value.codigo;
        usuario_pre.CPF = value.cpf;
        usuario_pre.Email = value.email;
        usuario_pre.IMEI = value.imei;
        usuario_pre.Matricula = value.matricula;
        usuario_pre.Municipio = value.municipio.toUpperCase();
        usuario_pre.Nome = value.nome;
        usuario_pre.PIM = value.pim;
        usuario_pre.Segmento = value.segmento.trim();
        usuario_pre.Sexo = value.sexo;
        usuario_pre.status = value.status;
        usuario_pre.Fone = value.telefone;
        usuario_pre.uf = value.uf;
        usuario_pre.Unidade = value.unidade
        return usuario_pre;
      });
    });
  }

  private CRUDUserDet(_statusCRUD, _formValues) {
    this.sendRequest('spUsuariosPre', {
      StatusCRUD: _statusCRUD,
      // codigo: this.usuario_pre.codigo,
      formValues: _formValues
    }, (resultado) => {
      this.usuario_pres = JSON.parse(atob(resultado.results));
      this.Cancel();
      console.log('this.userDets', this.usuario_pres);
    });
  }

  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD == 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD == 'CREATEdevice') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD == 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD == 'DELETE') && (this.permissoes.Deletar > 0))
        || ((params.StatusCRUD == 'PESQUISAR') && (this.permissoes.Pesquisar > 0))
        //|| (procedure === 'spUserDetran')
      ) {

        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          codigo: this.usuario_pre.codigo,
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
              //this.navCtrl.back();
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

 /* --------------------------------- SEND TO FORM ------------------------------------------------------------- */
  edit(id: any) {

    document.getElementById('editForm').style.display = 'block';
    document.getElementById('userTable').style.display = 'none';
    
    //usuario_pre.status = value.status;
    //usuario_pre.uf = value.uf;

    console.log("The edit Information", id);
    this.usuario_pre = id;
    console.log("The Edit Daata", this.usuario_pre);
    this.usuario_pre.codigo = id.codigo;
    this.usuario_pre.PIM = id.PIM;
    this.usuario_pre.IMEI = id.IMEI;
    this.usuario_pre.Nome = id.Nome;
    this.usuario_pre.CPF = id.CPF;
    this.usuario_pre.Fone = id.Fone;
    this.usuario_pre.Matricula = id.Matricula;
    this.usuario_pre.Email = id.Email;
    this.usuario_pre.Municipio = id.Municipio;
    console.log("The value of Municipio ==>", this.usuario_pre.Municipio);
    this.usuario_pre.Segmento = id.Segmento;
    this.usuario_pre.Unidade = id.Unidade;
    this.unidadeComponent.placeholder =  this.usuario_pre.Unidade;
    this.CarregaSegmentoGrupos()
    this.usuario_pre.Sexo = id.Sexo;
  }
   /* --------------------------------- END SEND TO FORM ------------------------------------------------------------- */

  Reset() {
    document.getElementById('editForm').style.display = 'block';
    document.getElementById('userTable').style.display = 'none';

    this.usuario_pre.codigo = "0";
    this.usuario_pre.PIM = " ";
    this.usuario_pre.IMEI = " ";
    this.usuario_pre.Nome = " ";
    this.usuario_pre.CPF = " ";
    this.usuario_pre.Fone = " ";
    this.usuario_pre.Matricula = " ";
    this.usuario_pre.Email = " ";
    this.usuario_pre.Municipio = " ";
    this.usuario_pre.Segmento = " ";
    this.usuario_pre.Unidade = " ";
    this.usuario_pre.Sexo = " ";
  }
 /* --------------------------------- CADASTRO USUARIO ------------------------------------------------------------- */
  async cadastroUserPre(form: NgForm) {
    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você tem certeza de que deseja cadastrar usuário <strong>' + form.value.Nome + '?</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Sim',
          handler: () => {
            this.SaveToUsuarios(form)
          }
        }
      ]
    });
    await alert.present();
  }
  
  private SaveToUsuarios(form: NgForm) {

    form.value.CPF = this.validations.convertToNumber(form.value.CPF);
    form.value.Fone = this.validations.convertToNumber(form.value.Fone);
    form.value.userSenha = Md5.hashStr(form.value.Matricula);
    form.value.userSenhaMD5 = form.value.userSenha;

    if ((form.value.Nome == " ") || (form.value.Nome == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Nome inválido" });
      this.flag = 0;
    } else if ((form.value.CPF == " ") || (form.value.CPF == '') || (form.value.CPF.length < 11)) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "CPF inválido" });
      this.flag = 0;
    } else if ((form.value.Fone == " ") || (form.value.Fone == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Telefone inválido" });
      this.flag = 0;
    } else if ((form.value.Matricula == " ") || (form.value.Matricula == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Matricula inválido" });
      this.flag = 0;
    } else if ((form.value.Email == " ") || (form.value.Email == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Email inválido" });
      this.flag = 0;
    } else if ((form.value.Municipio == " ") || (form.value.Municipio == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Municipio inválido" });
      this.flag = 0;
    } else if ((form.value.Segmento == "0 ") || (form.value.Segmento == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Segmento inválido" });
      this.flag = 0;
    } else if ((form.value.Unidade == " ") || (form.value.Unidade == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Unidade inválido" });
      this.flag = 0;
    } else if ((form.value.Sexo == " ") || (form.value.Sexo == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Sexo inválido" });
      this.flag = 0;
    } else if ((form.value.PIM == " ") || (form.value.PIM == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "PIM inválido" });
      this.flag = 0;
    } else if ((form.value.IMEI == " ") || (form.value.IMEI == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "IMEI inválido" });
      this.flag = 0;
    } else {
      this.flag = 1;
    }
    if (this.flag) {
      console.log('Info user to Save(form):', form.value)
      this.sendRequest('spCadastroUsuariosPre', {
        StatusCRUD: 'CREATE',
        formValues: form.value
      }, (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        this.usuario_pres = results;
        this.Cancel();
        console.log('SaveToUsuarios', this.usuario_pres);
      });
    }
    else {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Preencha os campos" });
    }
  }
 /* --------------------------------- END CADASTRO USUARIO ------------------------------------------------------------- */
  /* --------------------------------- CADASTRO DEVICE ------------------------------------------------------------- */
  async cadastroDevice(form: NgForm){
    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você tem certeza de que deseja cadastrar device do usuário <strong>' + form.value.Nome + '?</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Sim',
          handler: () => {
            this.SaveToDevice(form)
          }
        }
      ]
    });
    await alert.present();
  }

  private SaveToDevice(form: NgForm){

    if ((form.value.Matricula == " ") || (form.value.Matricula == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Matricula inválido" });
      this.flag = 0;
    }   else if ((form.value.Segmento == "0 ") || (form.value.Segmento == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Segmento inválido" });
      this.flag = 0;
    } else if ((form.value.Unidade == " ") || (form.value.Unidade == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Unidade inválido" });
      this.flag = 0;
    }  else if ((form.value.PIM == " ") || (form.value.PIM == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "PIM inválido" });
      this.flag = 0;
    } else if ((form.value.IMEI == " ") || (form.value.IMEI == '')) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "IMEI inválido" });
      this.flag = 0;
    } else {
      this.flag = 1;
    }
    if (this.flag) {
      console.log('Info user to Save(form):', form.value)
      this.sendRequest('spCadastroUsuariosPre', {
        StatusCRUD: 'CREATEdevice',
        formValues: form.value
      }, (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        this.usuario_pres = results;
        this.Cancel();
        console.log('SaveToDevice', this.usuario_pres);
      });
    }
    else {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.AppName, pMessage: "Preencha os campos" });
    }
  }
 /* --------------------------------- END CADASTRO DEVICE ------------------------------------------------------------- */
  Cancel() {
    document.getElementById('editForm').style.display = 'none';
    document.getElementById('userTable').style.display = 'block';
    ;
    this.usuario_pre.codigo = "0";
    this.CRUDuser(UsuariosPrePage.CRUD_READ, '');
  }

  public async delete(id: string, value: string) {
    this.usuario_pre.codigo = id;
    const alert = await this.alertController.create({

      header: 'Confirmar!',
      message: 'Você deseja apagar <strong>' + value + '?</strong>!!!',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',

        }, {
          text: 'Sim',
          handler: () => {
            this.CRUDUserDet('DELETE', { 'codigo': id });
            this.CRUDUserDet('READ', '');
          }
        }
      ]
    });

    await alert.present();
  }

  /* ==================== MASK ====================== */
  formatCPF(valString: any, idComponent: any) {
    this.validations.formatCPF(valString, idComponent)
  }
  formatTelefone(valString: any, idComponent: any) {
    this.validations.formatTelefone(valString, idComponent)
  }
  /* ==================== END MASK ====================== */



}
