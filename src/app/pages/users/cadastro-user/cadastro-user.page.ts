import { Component, OnInit } from "@angular/core";
import { NavController, AlertController } from "@ionic/angular";
import { Router, ActivatedRoute } from "@angular/router";
import { EnvService } from "src/app/services/env.service";
import { AuthService } from "src/app/services/auth.service";
import { AlertService } from "src/app/services/alert.service";
import { User } from "src/app/models/user";
import { Cargo } from "src/app/models/cargo";
import { Municipio } from "src/app/models/municipio";
import { Segmento } from "src/app/models/segmento";
import { Grupo } from "src/app/models/grupo";
import { NgForm } from "@angular/forms";
import { Perfil } from "src/app/models/perfil";
import { UsersPage } from "../users.page";
import { UF } from "src/app/models/uf";
import { Md5 } from "ts-md5";
import { ValidationsService } from "src/app/services/validations.service";
import { IonicSelectableComponent } from "ionic-selectable";

@Component({
  selector: "app-cadastro-user",
  templateUrl: "./cadastro-user.page.html",
  styleUrls: ["./cadastro-user.page.scss"],
})
export class CadastroUserPage implements OnInit {
  static CRUD_READ: string = "READ";
  static CRUD_CREATE: string = "CREATE";
  static CRUD_UPDATE: string = "UPDATE";
  private APP_NAME: string = this.env.AppName;

  public noCompleteForm: boolean = false;
  public showStatus: boolean = false;
  //public noName: boolean = false;
  //public noCPF: boolean = false;
  //public noRG: boolean = false;
  //public noFone: boolean = false;
  //public noCargo: boolean = false;
  //public noMunicipio: boolean = false;
  //public noSexo: boolean = false;
  //public noEmail: boolean = false;
  //public noMatricula: boolean = false;
  //public noLogin: boolean = false;
  //public noSegmento: boolean = false;
  //public noPerfil: boolean = false;
  //public noStatus: boolean = false;
  //public noSenha: boolean = false;

  public subtitle = "Users";
  public loginDisabled: boolean = false;
  public flagForm: boolean = false;
  public user = new User();
  public users: Array<User> = [];
  public usuarios: Array<User> = [];
  public cargo = new Cargo();
  public cargos: Array<Cargo> = [];
  public municipio = new Municipio();
  public municipios: Array<Municipio> = [];
  public segmento = new Segmento();
  public segmentos: Array<Segmento> = [];
  public perfil = new Perfil();
  public perfis: Array<Perfil> = [];
  public UF = new UF();
  public UFs: Array<UF> = [];


  public grupos: Array<Grupo> = [];

  private grupoTEMP: string = "";
  public randomPassword: string = "";

  private permissoes = {
    Route: "",
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1,
  };

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private authService: AuthService,
    private validations: ValidationsService,
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController
  ) { }

  async ngOnInit() {
    this.getMunicipios();
    this.getSegmentos();
    this.getCargos();
    this.getPerfis();

    await new Promise((resolve) => setTimeout(resolve, 2000)); // 3 sec

    this.activatedRoute.params.subscribe((data) => {
      //"data" carries all the parameters
      this.user.CODIGO = data.codigo;
      if (this.user.CODIGO) {
        this.loginDisabled = true;
        this.CRUDuser(CadastroUserPage.CRUD_READ, { codigo: this.user.CODIGO });
      }
    });
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.user.SEGMENTO = localStorage.getItem('orgaoUsuario').trim();
      this.user.PERFIL='U';
      this.user.STATUS="A";
      this.showStatus=true;
      this.CarregaSegmentoGrupos()

    }
  }
  private getPerfis() {
    this.sendRequest(
      "spPerfis",
      {
        StatusCRUD: "READ",
        formValues: this.perfil,
      },
      (resultado) => {
        this.perfis = JSON.parse(atob(resultado.results));
        console.log("perfis", this.perfis);
        // if (this.user.PERFIL) {
        //   let perfilTemp
        //   perfilTemp = this.user.PERFIL;
        //   this.user.PERFIL = '';
        //   this.user.PERFIL = perfilTemp;
        // }
      }
    );
  }

  private getCargos() {
    this.sendRequest(
      "spCargos",
      {
        StatusCRUD: "READ",
        formValues: this.cargo,
      },
      (resultado) => {
        let results = JSON.parse(atob(resultado.results));

        this.cargos = results.map(function callback(value) {
          let cargo = new Cargo();
          cargo.codigo = value.CODIGO;
          cargo.cargo = value.CARGO;
          return cargo;
        });

        // if (this.user.CARGO) {
        //   let cargoTemp
        //   cargoTemp = this.user.CARGO;
        //   this.user.CARGO = '';
        //   this.user.CARGO = cargoTemp;
        // }
      }
    );
  }

  /*   private getUFs() {
      this.sendRequest('spUFs', {
        StatusCRUD: 'READ',
        formValues: ''
  
      }, (resultado) => {
  
        this.UFs = JSON.parse(atob(resultado.results));
        console.log('UFs', this.UFs);
      });
    } */

  private getSegmentos() {
    this.sendRequest(
      "spSegmentos",
      {
        StatusCRUD: "READ",
        formValues: this.segmento,
      },
      (resultado) => {
        let results = JSON.parse(atob(resultado.results));
        this.segmentos = results.map(function callback(value) {
          let segmento = new Segmento();
          let segmentolength: any;

          segmento.codigo = value.codigo;
          segmento.segmento = value.segmento.trim();

          // bairro.codigo_municipio = value.codigo_municipio;

          return segmento;
        });

        console.log("this.segmento", this.segmentos);

        // if (this.user.SEGMENTO) {
        //   let segmentoTemp
        //   segmentoTemp = this.user.SEGMENTO;
        //   this.user.SEGMENTO = '';
        //   this.user.SEGMENTO = segmentoTemp;
        // }
      }
    );
  }

  changeLogin(form: NgForm) {
    this.user.LOGIN = form.value.userMatricula;
  }

  save(form: NgForm) {
    //Custom Validation, you can create a function to validate it
    if (!form.value.userName) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }

    if (!form.value.userCPF) {
      this.noCompleteForm = true;
    } else if (form.value.userCPF.length < 14) {
      this.noCompleteForm = true;
      this.alertService.presentAlert({
        pTitle: this.env.AppNameSigla,
        pSubtitle: this.APP_NAME,
        pMessage: "CPF inválido",
      });
      return;
    } else {
      this.noCompleteForm = false;
    }

    // if (!form.value.userRG) {
    //   this.noCompleteForm = true;
    // } else if (form.value.userRG.length < 11) {
    //   this.noCompleteForm = true;
    //   this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'RG inválido' });
    //   // this.alertService.presentToast('RG inválido');
    //   return;
    // } else { this.noCompleteForm = false; }

    if (!form.value.userFone) {
      this.noCompleteForm = true;
    } else if (form.value.userFone.length < 10) {
      this.noCompleteForm = true;
      this.alertService.presentAlert({
        pTitle: this.env.AppNameSigla,
        pSubtitle: this.APP_NAME,
        pMessage: "Fone inválido",
      });
      // this.alertService.presentToast('Fone inválido');
      return;
    } else {
      this.noCompleteForm = false;
    }

    if (!form.value.userCargo) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userMunicipio) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userSexo) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userEmail) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userMatricula) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userLogin) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userSegmento) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userPerfil) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }
    if (!form.value.userStatus) {
      this.noCompleteForm = true;
    } else {
      this.noCompleteForm = false;
    }

    if (this.ValidateEmail(form.value.userEmail) == false) {
      this.alertService.presentAlert({
        pTitle: this.env.AppNameSigla,
        pSubtitle: this.APP_NAME,
        pMessage: "Por favor, digite um e-mail válido",
      });
      return;
    }
    if (this.user.GRUPO == "") {
      this.noCompleteForm = true;
      this.alertService.presentAlert({
        pTitle: this.env.AppNameSigla,
        pSubtitle: this.APP_NAME,
        pMessage: "Grupo inválido",
      });
      return;
    }

    if (this.user.ALERTASBOOL) {
      this.user.ALERTAS = "S";
    } else {
      this.user.ALERTAS = "N";
    }
    form.value.userAlertas = this.user.ALERTAS;

    if (this.user.INFOSEGBOOL) {
      this.user.INFOSEG = "S";
    } else {
      this.user.INFOSEG = "N";
    }
    form.value.userInfoseg = this.user.INFOSEG;

    if (this.user.CODIGO) {
      //ADD CODIGO TO UPDATE

      if (form.value.userSenha) {
        if (form.value.userSenha != form.value.userConfirmSenha) {
          this.alertService.presentAlert({
            pTitle: this.env.AppNameSigla,
            pSubtitle: this.APP_NAME,
            pMessage: "As senhas não correspondem",
          });
          // this.alertService.presentToast('As senhas não correspondem');
          return;
        }

        form.value.userSenha = Md5.hashStr(form.value.userSenha);
        form.value.userSenhaMD5 = form.value.userSenha;
      }

      form.value.codigo = this.user.CODIGO;
      if (this.noCompleteForm) {
        return;
      } else {
        form.value.userCPF = this.validations.convertCPFtoNumber(
          form.value.userCPF
        );
        form.value.userRG = this.validations.convertCPFtoNumber(
          form.value.userRG
        );
        console.log("UPDATE");
        console.log(form.value);
        this.CRUDuser(CadastroUserPage.CRUD_UPDATE, form.value);
      }
    } else {
      // if (!form.value.userSenha) {
      //   this.alertService.presentToast('o campo do Senha está vazio');
      //   return;
      // }

      // if (form.value.userSenha != form.value.userConfirmSenha) {
      //   this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'As senhas não correspondem' });
      //   return;
      // }

      // form.value.userSenha = Md5.hashStr(form.value.userSenha);
      // form.value.userSenhaMD5 = form.value.userSenha;
      // this.randomPassword = Math.random().toString(36).substring(7);
      form.value.senhaTrocada = true;
      this.randomPassword = this.generateRandomPassword();
      form.value.userSenha = Md5.hashStr(this.randomPassword);
      form.value.userSenhaMD5 = form.value.userSenha;

      if (this.noCompleteForm) {
        return;
      } else {
        form.value.userCPF = this.validations.convertCPFtoNumber(
          form.value.userCPF
        );
        form.value.userRG = this.validations.convertCPFtoNumber(
          form.value.userRG
        );
        console.log("CREATE");
        this.CRUDuser(CadastroUserPage.CRUD_CREATE, form.value);
      }
    }
  }

  private CRUDuser(_statusCRUD, _formValues) {
    this.sendRequest(
      "spUsuarios",
      {
        StatusCRUD: _statusCRUD,
        formValues: _formValues,
      },
      (resultado) => {
        switch (_statusCRUD) {
          case CadastroUserPage.CRUD_CREATE:
            this.router.navigate(["/menu/users"]);
            this.sendEmail(_formValues);
            break;
          case CadastroUserPage.CRUD_READ:
            this.user.NOME = JSON.parse(atob(resultado.results))[0].NOME;
            this.user.CPF = JSON.parse(atob(resultado.results))[0].CPF;
            this.user.RG = JSON.parse(atob(resultado.results))[0].RG;
            this.user.CARGO = JSON.parse(atob(resultado.results))[0].CARGO;
            this.user.TELEFONE = JSON.parse(
              atob(resultado.results)
            )[0].TELEFONE;
            this.user.CODIGO_MUNICIPIO = JSON.parse(
              atob(resultado.results)
            )[0].CODIGO_MUNICIPIO;
            this.user.SEXO = JSON.parse(atob(resultado.results))[0].SEXO;
            this.user.EMAIL = JSON.parse(atob(resultado.results))[0].EMAIL;
            this.user.MATRICULA = JSON.parse(
              atob(resultado.results)
            )[0].MATRICULA;
            this.user.LOGIN = JSON.parse(atob(resultado.results))[0].LOGIN;
            if (JSON.parse(atob(resultado.results))[0].SEGMENTO) {
              this.user.SEGMENTO = JSON.parse(
                atob(resultado.results)
              )[0].SEGMENTO.trim();
            }
            if (JSON.parse(atob(resultado.results))[0].GRUPO) {
              // this.grupoTEMP = String(JSON.parse(atob(resultado.results))[0].GRUPO).trim();
              this.grupoTEMP = JSON.parse(atob(resultado.results))[0].GRUPO;
              // this.user.GRUPO = String(JSON.parse(atob(resultado.results))[0].GRUPO).trim();
            }
            if (JSON.parse(atob(resultado.results))[0].PERFIL) {
              this.user.PERFIL = JSON.parse(
                atob(resultado.results)
              )[0].PERFIL.trim();
            }
            if (JSON.parse(atob(resultado.results))[0].INFOSEG == "S") {
              this.user.INFOSEGBOOL = true;
            }
            if (JSON.parse(atob(resultado.results))[0].ALTERAR == "S") {
              this.user.ALERTASBOOL = true;
            }

            this.CarregaSegmentoGrupos();

            this.user.STATUS = JSON.parse(atob(resultado.results))[0].STATUS;
            break;
          case CadastroUserPage.CRUD_UPDATE:
            this.router.navigate(["/menu/users"]);
            break;

          default:
            break;
        }
      }
    );
  }
  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter((item) => {
      return item.Route === this.router.url;
    });

    if (permissaoModulo.length === 1) {
      this.permissoes = {
        Route: permissaoModulo[0].Route,
        Pesquisar: permissaoModulo[0].Pesquisar,
        Inserir: permissaoModulo[0].Inserir,
        Editar: permissaoModulo[0].Editar,
        Deletar: permissaoModulo[0].Deletar,
      };
    } else {
      console.log(
        "Houve um problema nas permissoes do modulo: ",
        this.router.url
      );
    }
  }
  getMunicipios() {
    this.consultarUFMunicipio(this.user.UF);
  }

  private consultarUFMunicipio(uf: string) {
    this.sendRequest(
      "spMunicipiosUser",
      {
        StatusCRUD: "READ",
        formValues: { UF: "BA" },
      },
      (resultado) => {
        let results = JSON.parse(atob(resultado.results));

        this.municipios = results.map(function callback(value) {
          let municipio = new Municipio();
          municipio.codigo = value.codigo;
          municipio.nome = value.nome;

          return municipio;
        });
      }
    );
  }

  goBack() {
    this.navCtrl.back();
  }

  // public compareWithFn(c1: any, c2: any): boolean {
  //   return c1 && c2 ? c1.id === c2.id : c1 === c2;
  // }
  // compareWith = this.compareWithFn;

  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any },
    next: any
  ) {
    if (typeof this.Authorizer.HashKey !== "undefined") {
      if (
        (params.StatusCRUD === "CREATE" && this.permissoes.Inserir > 0) ||
        (params.StatusCRUD === "READ" && this.permissoes.Pesquisar > 0) ||
        (params.StatusCRUD === "UPDATE" && this.permissoes.Editar > 0) ||
        (params.StatusCRUD === "DELETE" && this.permissoes.Deletar > 0) ||
        procedure === "spUsuarios"
      ) {
        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey, // Por defeito sempre está este valor
        };

        this.Authorizer.QueryStoreProcPost(
          "ExecutarPOST",
          procedure,
          _params
        ).then((res) => {
          // this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
          const resultado: any = res[0];
          try {
            if (resultado.success) {
              next(resultado);
              this.alertService.showLoader(resultado.message, 1000);
            } else {
              this.alertService.presentAlert({
                pTitle: "ATENÇÃO",
                pSubtitle: this.APP_NAME,
                pMessage: resultado.message,
              });
            }
          } catch (err) {
            this.alertService.presentAlert({
              pTitle: this.env.AppNameSigla,
              pSubtitle: this.APP_NAME,
              pMessage: "Erro ao fazer a petição",
            });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: "SEM PERMISSÃO",
          pSubtitle: this.APP_NAME,
          pMessage: "Você não tem permissão para esta ação",
        });
      }
    } else {
      this.goBack();
    }
  }

  CarregaSegmentoGrupos() {
    console.log("segmentolength", this.user.SEGMENTO.length);
    console.log("segmento", this.user.SEGMENTO);
    this.consultarGruposSegmento(this.user.SEGMENTO);
  }

  private consultarGruposSegmento(segmento: string) {
    this.user.GRUPO = "";
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.user.GRUPO = localStorage.getItem('codigoUnidade');
      this.user.nomegrupo = localStorage.getItem('unidadeUsuario')
    }
    if (!segmento) {
      this.grupos = [];
      return;
    }
    else {
      this.sendRequest(
        "spConsultarGruposSegmento",
        {
          StatusCRUD: "READ",
          formValues: { segmento: segmento },
        },
        (resultado) => {
          let results = JSON.parse(atob(resultado.results));

          console.log("grupos", results);

          this.grupos = results.map(function callback(value) {
            let grupo = new Grupo();
            grupo.codigo = value.CODIGO;
            grupo.nome = value.NOME;

            return grupo;
          });
          //logic to fill the grupos array with the unidade of the user SUPERVISOR UNIDADE
        if(this.user.GRUPO){
          this.grupos[0].codigo=this.user.GRUPO
          this.grupos[0].nome=this.user.nomegrupo;
          console.log('grupos',this.grupos);
          return;
        }
        //

          this.user.GRUPO = this.grupoTEMP;
          this.grupoTEMP = "";

          // if (this.user.GRUPO) {
          //   let grupo
          //   grupo = this.user.GRUPO;
          //   this.user.GRUPO = '';
          //   this.user.GRUPO = grupo;
          // }
        }
      );
    }
  }
  isNumber(value: string | number): boolean {
    return value != null && value !== "" && !isNaN(Number(value.toString()));
  }
  formatCPF(valString: any, idComponent: any) {
    this.validations.formatCPF(valString, idComponent);
  }
  formatTelefone(valString: any, idComponent: any) {
    this.validations.formatTelefone(valString, idComponent);
  }

  formatRG(valString: any, idComponent: any) {
    this.validations.formatRG(valString, idComponent);
  }

  sendEmail(_formValues) {
    const params = new FormData();

    // params.append('usuario', this.Authorizer.encripta(_formValues.userMatricula));
    // params.append('senha', this.Authorizer.encripta(this.randomPassword));
    // params.append('email', this.Authorizer.encripta(_formValues.userEmail));
    // params.append('sistema', this.Authorizer.encripta(this.env.URL_SISTEMA));

    let body =
      "Seu acesso ao portal MOP foi criado com sucesso. Para acessar utilize os dados abaixo.<br>" +
      "Usuário: " +
      _formValues.userMatricula +
      "<br>" +
      "Senha: " +
      this.randomPassword +
      "<br>" +
      "<a href = '" +
      this.env.URL_SISTEMA +
      "' > Nosso sistema </a>";

    params.append("email", this.Authorizer.encripta(_formValues.userEmail));
    params.append("body", this.Authorizer.encripta(body));

    this.randomPassword = "";
    this.sendRequestOnline("SendEmail", params, (resultado) => {
      // console.log('resultado.results:', resultado);

      if (resultado == "ok") {
        this.alertService.presentAlert({
          pTitle: "ATENÇÃO",
          pSubtitle: this.APP_NAME,
          pMessage: "A senha foi enviada para o e-mail do usuário",
        });
        return;
      } else {
        this.alertService.presentAlert({
          pTitle: "ATENÇÃO",
          pSubtitle: this.APP_NAME,
          pMessage: resultado,
        });
      }
    });
  }

  private sendRequestOnline(procedure: string, params: any, next: any) {
    if (typeof this.Authorizer.HashKey !== "undefined") {
      if (
        this.permissoes.Pesquisar > 0 ||
        this.permissoes.Deletar > 0 ||
        this.permissoes.Inserir > 0 ||
        this.permissoes.Editar > 0
        // || (params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
      ) {
        this.Authorizer.QueryOnline(procedure, params).then((res) => {
          const resultado: any = res;
          try {
            // if (Array.isArray(resultado)) {
            next(resultado);
            this.alertService.showLoader("Cargando", 1000);
            // } else {
            //   this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.error.Message });
            //   console.log('resultado.error.StackTrace: ', resultado.error.StackTrace);
            // }
          } catch (err) {
            this.alertService.presentAlert({
              pTitle: this.env.AppNameSigla,
              pSubtitle: this.APP_NAME,
              pMessage: "Erro ao fazer a petição",
            });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: "ATENÇÃO",
          pSubtitle: this.APP_NAME,
          pMessage: "Você não tem permissão para esta ação",
        });
      }
    } else {
      this.alertService.presentAlert({
        pTitle: "SEM PERMISSÃO",
        pSubtitle: this.APP_NAME,
        pMessage: "Você não tem permissão para esta ação",
      });
    }
  }

  /* ===== RESET PASSWORD =================================================================================== */
  async AlertresetSenha() {
    const alert = await this.alertCtrl.create({
      header: "Resetar Senha",
      message: "Tem certeza de que deseja resetar a senha?",
      buttons: [
        {
          text: "Não",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: "Sim",
          handler: () => {
            this.resetSenha();
          },
        },
      ],
    });
    await alert.present();
  }

  resetSenha() {
    this.user.senhaTrocada = true;
    this.randomPassword = this.generateRandomPassword();

    console.log("user model:", this.user);
    let novaSenhaMD5: any = Md5.hashStr(this.randomPassword);

    this.CRUDuser("TROCO_SENHA", {
      codigo: this.user.CODIGO,
      SenhaNova: this.randomPassword,
      SenhaNovaMD5: novaSenhaMD5,
      senhaTrocada: this.user.senhaTrocada,
    });

    const params = new FormData();
    /*
        params.append('usuario', this.Authorizer.encripta(this.user.MATRICULA));
        params.append('senha', this.Authorizer.encripta(this.user.EMAIL));
        params.append('email', this.Authorizer.encripta(this.user.EMAIL));
        params.append('sistema', this.Authorizer.encripta(this.env.URL_SISTEMA));
      */
    let body = `Seu acesso ao portal MOP foi alterado com sucesso. Para acessar utilize os dados abaixo.<br>
      <strong>Usuário:</strong> ${this.user.MATRICULA} <br>
      <strong>Senha:</strong> ${this.randomPassword} <br>
      link de acesso: <a href='${this.env.URL_SISTEMA}' > Nosso sistema </a>`;

    params.append("email", this.Authorizer.encripta(this.user.EMAIL));
    params.append("body", this.Authorizer.encripta(body));

    this.randomPassword = "";
    this.sendRequestOnline("SendEmail", params, (resultado) => {
      if (resultado == "ok") {
        this.alertService.presentAlert({
          pTitle: "ATENÇÃO",
          pSubtitle: this.APP_NAME,
          pMessage: "A nova senha foi enviada para o e-mail do usuário",
        });
        return;
      } else {
        this.alertService.presentAlert({
          pTitle: "ATENÇÃO",
          pSubtitle: this.APP_NAME,
          pMessage: resultado,
        });
      }
    });
  }
  /* ===== END RESET PASSWORD =============================================================================== */
  generateRandomPassword() {
    let randomPassword: any = "";
    let passwordLength = 6;
    let charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (let index = 0; index < passwordLength; ++index) {
      randomPassword += charset.charAt(
        Math.floor(Math.random() * charset.length)
      );
    }
    console.log("randomPass", randomPassword);
    return randomPassword;
  }
  ValidateEmail(mail) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
      return true;
    } else {
      return false;
    }
  }
}
