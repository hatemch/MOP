import { Component, OnInit } from "@angular/core";
import { NavController, PopoverController } from "@ionic/angular";
import { AlertService } from "src/app/services/alert.service";
import { AuthService } from "src/app/services/auth.service";
import { EnvService } from "src/app/services/env.service";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../../../environments/environment.prod";

@Component({
  selector: "app-permissoes",
  templateUrl: "./permissoes.page.html",
  styleUrls: ["./permissoes.page.scss"],
})
export class PermissoesPage implements OnInit {
  public APP_NAME: String = environment.AppName;
  public title = "Permissões";
  public subtitle = "";
  public collection: any = [];
  public collectionPerfis: any = [];
  public perfil: any;

  public modelPerfil = {
    codigo: 0,
    nome: "",
    slug: "",
    segmento: "",
  };

  public permissoes = {
    Route: "",
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0,
  }; // Permissoes do modulo para o usuario logado

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private route: ActivatedRoute,
    private popoverController: PopoverController,
    private router: Router
  ) {}

  ngOnInit() {
    this.getPermissoesModulo();
    this.mostrarPerfis();
  }

  mostrarPermissoesDoPerfil(perfil) {
    this.modelPerfil = perfil;
    this.subtitle = this.modelPerfil.nome;
    this.perfil = this.modelPerfil.codigo;
    this.read();
  }

  /**
   * Autor: HATEM CHAOUCH
   * Data: 04/05/2020
   * @param procedure Nome da procedura armazanada no banco de dados
   * @param params JSON do parametros precisados pelo procedure
   * @param next Callback executado depois de executar a request
   */
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
        (params.StatusCRUD === "DELETE" && this.permissoes.Deletar > 0)
      ) {
        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey, // Por defeito sempre está este valor
        };

        this.Authorizer.QueryStoreProc("Executar", procedure, _params).then(
          (res) => {
            const resultado: any = res[0];
            try {
              if (resultado.success) {
                next(resultado);
                // this.alertService.showLoader(resultado.message, 500);
              } else {
                this.alertService.presentAlert({
                  pTitle: "ATENÇÃO",
                  pSubtitle: this.subtitle,
                  pMessage: resultado.message,
                });
                this.navCtrl.back();
              }
            } catch (err) {
              this.alertService.presentAlert({
                pTitle: this.env.AppNameSigla,
                pSubtitle: this.subtitle,
                pMessage: "Erro ao fazer a petição",
              });
            }
          }
        );
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

  read() {
    // Obtendo a informação do banco de dados
    const params = {
      StatusCRUD: "READ",
      formValues: { CodigoUsuarioPerfil: this.modelPerfil.codigo },
    };

    this.sendRequest("spMenuPerfisRules", params, (resultado) => {
      this.collection = JSON.parse(atob(resultado.results));
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  salvarPermissaoPesquisar(item, value) {
    this._salvar(item, value, "Pesquisar");
  }

  salvarPermissaoInserir(item, value) {
    this._salvar(item, value, "Inserir");
  }

  salvarPermissaoEditar(item, value) {
    this._salvar(item, value, "Editar");
  }

  salvarPermissaoDeletar(item, value) {
    this._salvar(item, value, "Deletar");
  }

  private _salvar(item: any, value: boolean, acao: string) {
    let _item = item;
    _item[acao] = value;
    if (parseInt(item.CodigoMenuPefisRules) === 0) {
      // Create
      _item.CodigoUsuarioPerfil = this.modelPerfil.codigo;
      _item.CodigoMenuPefisRules = "";
    }
    const params = {
      StatusCRUD: parseInt(item.CodigoMenuPefisRules) > 0 ? "UPDATE" : "CREATE",
      formValues: _item,
    };

    this.sendRequest("spMenuPerfisRules", params, (resultado) => {});
  }

  mostrarPerfis() {
    const params = {
      StatusCRUD: "READ",
      formValues: "",
    };
    this.sendRequest("spPerfis", params, (resultado) => {
      this.collectionPerfis = JSON.parse(atob(resultado.results));
    });
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
      // this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação' })
      // this.router.navigate(['/menu/options/tabs/main/98']);
    }
  }
}
