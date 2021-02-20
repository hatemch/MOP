import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';

import { UserDet } from "../../../models/userDet";
import { User } from "../../../models/user";
import { NavController, Events, ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-user-detran',
  templateUrl: './add-user-detran.page.html',
  styleUrls: ['./add-user-detran.page.scss'],
})
export class AddUserDetranPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static APP_NAME: string = EnvService.name;
  private APP_NAME: string = this.env.AppName;

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado


  public userDet = new UserDet();
  public users: Array<User> = [];
  public userDets: any[];
  public disableUser = false;
  alertController: any;


  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private Eventos: Events,
    public modalController: ModalController,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.userDets = [];
    // Getting data from another page
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.userDet.codigo = data.codigo;

        if (this.userDet.codigo) {
          // this.title = 'Editar';
          this.CRUDUserDet(AddUserDetranPage.CRUD_READ, { 'codigo': this.userDet.codigo });
        }
        // else
        // {
        //   this.title = 'Novo';
        // }

      });
    this.getUsers();
  }
  save(form: NgForm) {
    // if (this.userDet.codigo) {
    //   //ADD CODIGO TO UPDATE 
    //   form.value.codigo = this.userDet.codigo;
    //   this.CRUDUserDet(AddUserDetranPage.CRUD_UPDATE, form.value);
    // }
    // else {
    if (!this.userDet.codigo) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddUserDetranPage.APP_NAME, pMessage: "Selecione um usuário." });
      return;
    }

    this.sendRequestOnlineUserDet('ManutencaoUsuarioDetran2', {
      logado: this.Authorizer.CodigoUsuarioSistema ? this.Authorizer.CodigoUsuarioSistema : '',
      usuario: form.value.userDet ? form.value.userDet : '',
      Hashkey: this.Authorizer.HashKey ? this.Authorizer.HashKey : ''
    }
      , (resultado) => {

        console.log('resultado.results:', resultado);
        //this.CRUDUserDet(AddUserDetranPage.CRUD_CREATE, form.value);
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddUserDetranPage.APP_NAME, pMessage: 'Dados salvados com sucesso!!!' });

        this.userDet = new UserDet();
        this.userDets = [];
        this.router.navigate(['/menu/user-detran']);
      });
    //
    // }
  }
  private CRUDUserDet(_statusCRUD, _formValues) {
    this.sendRequest('spUserDetran', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case AddUserDetranPage.CRUD_CREATE:
          this.userDet = new UserDet();
          this.userDets = [];
          this.router.navigate(['/menu/user-detran']);
          break;
        case AddUserDetranPage.CRUD_READ:
          this.userDet.pim = JSON.parse(atob(resultado.results))[0].pim;
          this.userDet.imei = JSON.parse(atob(resultado.results))[0].imei;
          this.userDet.cpf = JSON.parse(atob(resultado.results))[0].cpf;
          this.userDet.codigo_pessoa = JSON.parse(atob(resultado.results))[0].codigo_pessoa;
          this.userDet.numero_lote = JSON.parse(atob(resultado.results))[0].numero_lote;
          this.userDet.nome = JSON.parse(atob(resultado.results))[0].NOME;
          this.userDet.login = JSON.parse(atob(resultado.results))[0].LOGIN;
          break;
        case AddUserDetranPage.CRUD_UPDATE:
          this.router.navigate(['/menu/user-detran']);
          break;

        default:
          break;
      }
    });
  }

  private getUsers() {
    this.sendRequest('spUserDetran', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.users = results.map(function callback(value) {
        let userDet = new UserDet();
        userDet.codigo = value.codigo;
        userDet.login = value.login;
        userDet.nome = value.nome;

        return userDet;
      });
      console.log('users', this.users);
    });
  }
  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    })

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

  /**
 * Autor: Hatem CHAOUCH 
 * Data: 10/03/2020
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
        ((params.StatusCRUD === 'CREATE') && (this.permissoes.Inserir > 0))
        || ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'UPDATE') && (this.permissoes.Editar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
        || (procedure === 'spUserDetran')
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
              this.alertService.showLoader(resultado.message, 500);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddUserDetranPage.APP_NAME, pMessage: resultado.message });
              return;
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: AddUserDetranPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: AddUserDetranPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }

  private sendRequestOnlineUserDet(
    procedure: string,
    params: { logado: any; usuario: any; Hashkey: any },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {

      if (this.permissoes.Pesquisar > 0
        || this.permissoes.Deletar > 0
        || this.permissoes.Inserir > 0
        || this.permissoes.Editar > 0
        // || (params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
      ) {
        this.Authorizer.QueryOnlineUserDetran(procedure, params).then(res => {
          const resultado: any = res;
          try {
            if (resultado[0].success === true) {
              next(resultado[0]);
              this.alertService.showLoader('Cargando', 1000);


            } else {
              //logic to find is the message has an error code number
              if (resultado[0].message.match(/\d+/g)) {

                let numError = resultado[0].message.match(/\d+/g)

                switch (numError[1].toString()) {
                  case '101':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Tipo de Documento Inválido (CPF/CNPJ)' });
                    break;
                  case '150':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Usuario/Senha invalido' });
                    break;
                  case '151':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Operacao nao permitida' });
                    break;
                  case '152':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Usuario nao cadastrado' });
                    break;
                  case '153':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Matricula do Usuario esta suspenso' });
                    break;
                  case '154':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Senha Invalida' });
                    break;
                  case '196':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'INFRAÇÃO DE COMPETÊNCIA MUNICIPAL' });
                    break;
                  case '263':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'CNPJ não preenchido / invalido' });
                    break;
                  case '264':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'CPF não preenchido ou inválido' });
                    break;
                  case '265':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Nome não preenchido / inválido' });
                    break;
                  case '266':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Nome contém caracteres especiais' });
                    break;
                  case '267':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Endereço não preenchido' });
                    break;
                  case '268':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Endereço contém caracteres especiais' });
                    break;
                  case '269':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Número do endereço não informado' });
                    break;
                  case '270':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Município não preenchido ou invalido' });
                    break;
                  case '271':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Bairro do endereço não informado' });
                    break;
                  case '272':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Bairro do endereço contém caracteres especiais' });
                    break;
                  case '273':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Bairro não cadastrado para o município informado' });
                    break;
                  case '274':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'CEP do endereço não informado' });
                    break;
                  case '275':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'DDD não preenchido ou invalido' });
                    break;
                  case '276':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Telefone não preenchido ou invalido' });
                    break;
                  case '277':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'UF do domicilio não preenchido/inválido' });
                    break;
                  case '278':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Complemento contém caracteres especiais' });
                    break;
                  case '279':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Fax invalido' });
                    break;
                  case '280':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Celular invalido' });
                    break;
                  case '281':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Email invalido' });
                    break;
                  case '305':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'RG não preenchido' });
                    break;
                  case '306':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'RG não deve ser informado' });
                    break;
                  case '307':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sexo não preenchido/inválido' });
                    break;
                  case '308 ':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sexo não deve ser informado' });
                    break;
                  case '540':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Pessoa Jurídica é um Credor. Usar outro Método' });
                    break;
                  case '662':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Informe o CPF com 11 digitos' });
                    break;
                  case '663':
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Informe o CNPJ com 14 digitos' });
                    break;
                  default:
                    this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Dados do usuário incompletos' });
                    break;

                }
              } else {
                //if the message does not have error number show the message
                this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado[0].message });
                return;
              }



            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação' })
      }


    } else {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
      });
    }
  }



  goBack() {
    this.router.navigate(['/menu/user-detran']);
  }

  public GetTableData(form: NgForm) {
    if (!form.value.nomePesquisar && !form.value.loginPesquisar) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddUserDetranPage.APP_NAME, pMessage: "Informe um usuário ou um login." });
      this.userDets = [];
      return;
    }
    this.sendRequest('spUserDetran', {
      StatusCRUD: 'PESQUISAR_USUARIO',
      formValues: { 'nomePesq': form.value.nomePesquisar, 'loginPesquisar': form.value.loginPesquisar }
    }, (resultado) => {
      // this.data = JSON.parse(atob(resultado.results));
      // console.log('table data  :', this.data);
      let results = JSON.parse(atob(resultado.results));

      this.userDets = results.map(function callback(value) {

        let userDet = new UserDet();

        userDet.codigo = value.CODIGO;

        userDet.nome = value.NOME;


        return userDet;
      });
      if (this.userDets.length == 0) {
        this.disableUser = true;
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddUserDetranPage.APP_NAME, pMessage: "Sem dados a mostrar." });
      }
    });

  }


}
