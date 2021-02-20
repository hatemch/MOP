import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment.prod';

//MODELS
import { ConsultaLista } from "../../models/consultaLista";
import { Segmento } from '../../models/segmento';
import { User } from 'src/app/models/user';
import { Grupo } from 'src/app/models/grupo';

@Component({
  selector: 'app-consulta-lista',
  templateUrl: './consulta-lista.page.html',
  styleUrls: ['./consulta-lista.page.scss'],
})
export class ConsultaListaPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  static CRUD_READ: string = 'READ';
  static APP_NAME: String = environment.AppName;
  public showTable: boolean = false;

  public mapURL: any;

  public permissoes = {
    Route: '',
    Pesquisar: 0

  }; // Permissoes do modulo para o usuario logado
  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  public users: Array<User> = [];

  public activeLeyend: boolean = false;

  public user = new User();
  public consultaListas: Array<ConsultaLista> = [];
  public consultaLista = new ConsultaLista();
  public columns = [
    { text: 'Usuário', bold: true },
    { text: 'Segmento', bold: true },
    { text: 'Grupo', bold: true },
    { text: 'Tipo', bold: true },
    { text: 'Data consulta', bold: true },
    { text: 'CPF', bold: true },
    { text: 'Placa', bold: true },
    { text: 'RG', bold: true },
    { text: 'Nome', bold: true }];


  constructor(

    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();
  }

  ionViewDidEnter() {
    this.getSegmentos();
    this.showTable = false;
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.consultaLista.segmento = localStorage.getItem('orgaoUsuario').trim();
      this.CarregaSegmentoGrupos()

    }

  }

  private getSegmentos() {
    this.sendRequest('spSegmentos', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.segmentos = results.map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.segmento.trim();
        segmento.segmento = value.segmento.trim();


        return segmento;
      });

      if (this.segmentos.length > 1) {
        this.segmentos.unshift({ 'codigo': 'TODOS', 'segmento': 'TODOS' });
      }
      console.log('segmentos', this.segmentos);

    });
  }
  CarregaSegmentoGrupos() {
    console.log(this.consultaLista.segmento);
    this.consultarGruposSegmento(this.consultaLista.segmento);
  }
  private consultarGruposSegmento(segmento: string) {
    this.consultaLista.grupo = '';
    this.consultaLista.usuario = '';
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.consultaLista.grupo = localStorage.getItem('codigoUnidade');
      this.user.nomegrupo = localStorage.getItem('unidadeUsuario')
    }
    if (!segmento) {
      this.grupos = [];
      this.users = [];
      return;
    }
    else {
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
        //logic to fill the grupos array with the unidade of the user SUPERVISOR UNIDADE
        if (this.consultaLista.grupo) {
          this.grupos[0].codigo = this.consultaLista.grupo
          this.grupos[0].nome = this.user.nomegrupo;
          this.CarregaSegmentoGrupoUsuarios();
          console.log('grupos', this.grupos);
          return;
        }
        //
        if (this.grupos.length == 0) {
          this.grupos = [];
        } else if (this.grupos.length > 1) {
          let grupo = new Grupo();
          grupo.codigo = 'TODOS';
          grupo.nome = 'TODOS';
          this.grupos.unshift(grupo);
        }
      });
    }
  }
  CarregaSegmentoGrupoUsuarios() {
    this.consultarUsuarioGrupo(this.consultaLista.grupo == 'TODOS' ? '' : this.consultaLista.grupo);
  }
  private consultarUsuarioGrupo(grupo: string) {
    this.consultaLista.usuario = '';
    if (!grupo) {
      this.users = [];
      return;
    }
    else {
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

        if (this.users.length > 1) {
          let userTodos = new User();
          userTodos.codigo = 'TODOS';
          userTodos.nome = 'TODOS';
          this.users.unshift(userTodos);
        }

        console.log('users', this.users);

      });
    }
  }
  private ConsultaLista(_statusCRUD, _formValues, exportExcel) {

    // this.sendRequest('spConsultaLista', {
    this.sendRequest('spConsultaGeo', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.consultaListas = results.map(function callback(value) {
        let consultaLista = new ConsultaLista();
        consultaLista.codigo = value.codigo;
        consultaLista.usuario = value.USUARIO;
        consultaLista.tipo = value.TIPO;
        // consultaLista.dataConsulta = value.DATA_CONSULTA;
        if (value.DATA_CONSULTA.length >= 10) {
          consultaLista.dataConsulta = value.DATA_CONSULTA.substring(8, 10) + '/' +
            value.DATA_CONSULTA.substring(5, 7) + '/' +
            value.DATA_CONSULTA.substring(0, 4) + ' ' +
            value.DATA_CONSULTA.substring(11, 22);
        }
        consultaLista.latitude = value.LATITUDE;
        consultaLista.longitude = value.LONGITUDE;
        consultaLista.cpf = value.CPF;
        consultaLista.placa = value.PLACA;
        consultaLista.rg = value.RG;
        consultaLista.nome = value.NOME;
        consultaLista.mae = value.MAE;
        consultaLista.vulgo = value.VULGO;
        consultaLista.segmento = value.SEGMENTO;
        consultaLista.grupo = value.GRUPO
        return consultaLista;
      });

      console.log("this.consultaListas.length", this.consultaListas.length)
      if (this.consultaListas.length == 0) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        return;
      }
      this.showTable = true;

      if (exportExcel) {
        this.Authorizer.convertToExcel(JSON.parse(atob(resultado.results)), "consultasLista");
      }




    });
  }


  getLista(exportExcel) {

    // Validate all the checks pesquisa
    if (!this.consultaLista.album && !this.consultaLista.antecedentes && !this.consultaLista.condutores && !this.consultaLista.individuo
      && !this.consultaLista.veiculos && !this.consultaLista.veiculoRestricao && !this.consultaLista.todos
    ) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Preencha ao menos um campo do Tipo pesquisa' });
      return;
    }

    this.ConsultaLista(ConsultaListaPage.CRUD_READ, {
      'segmento': this.consultaLista.segmento == 'TODOS' ? '' : this.consultaLista.segmento,
      'grupo': this.consultaLista.grupo == 'TODOS' ? '' : this.consultaLista.grupo,
      'usuario': this.consultaLista.usuario == 'TODOS' ? '' : this.consultaLista.usuario,
      'parametro': this.consultaLista.parametro,
      'dataInicio': this.consultaLista.dataInicio,
      'dataFin': this.consultaLista.dataFin,
      'album': this.consultaLista.todos ? false : this.consultaLista.album,
      'antecedentes': this.consultaLista.todos ? false : this.consultaLista.antecedentes,
      'condutores': this.consultaLista.todos ? false : this.consultaLista.condutores,
      'individuo': this.consultaLista.todos ? false : this.consultaLista.individuo,
      'veiculos': this.consultaLista.todos ? false : this.consultaLista.veiculos,
      'veiculoRestricao': this.consultaLista.todos ? false : this.consultaLista.veiculoRestricao
    }, exportExcel)
    this.activeLeyend = true;

  }
  goBack() {
    this.router.navigate(['/menu/options/tabs/main/93']);
  }
  // NEEDED FUNCTIONS
  private getPermissoesModulo() {
    const permissaoModulo = this.Authorizer.permissoesUsuario.filter(item => {
      return (item.Route === this.router.url);
    })

    if (permissaoModulo.length === 1) {
      this.permissoes = {
        Route: permissaoModulo[0].Route,
        Pesquisar: permissaoModulo[0].Pesquisar

      };
    } else {
      // this.alertService.presentAlert({
      //   pTitle: 'SEM PERMISSÃO', pSubtitle: ModulosPage.APP_NAME, pMessage: 'Houve um problema nas permissoes do modulo: ' + this.router.url
      // });
    }
  }


  /**
     * Autor: Lina Jimenez 
     * Data: 04/12/2019
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
        ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        // || (procedure === 'spConsultaLocalizacao')
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
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: ConsultaListaPage.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: ConsultaListaPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: ConsultaListaPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
      console.log('armando');
    }
  }

  public exportarExcel() {

    // Validate all the checks pesquisa
    if (!this.consultaLista.album && !this.consultaLista.antecedentes && !this.consultaLista.condutores && !this.consultaLista.individuo
      && !this.consultaLista.veiculos && !this.consultaLista.veiculoRestricao && !this.consultaLista.todos
    ) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Preencha ao menos um campo do Tipo pesquisa' });
      return;
    }

    const path = 'consultas_lista/';
    //const publicPath = '/mop/consultasgeo/';
    const nomearquivo = path.substring(0, path.length - 1) + Date.now().toString();

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (this.permissoes.Pesquisar > 0) {

        const _params = {
          StatusCRUD: 'READ',
          formValues: {

            segmento: this.consultaLista.segmento,
            grupo: this.consultaLista.grupo,
            usuario: this.consultaLista.usuario,
            dataInicio: this.consultaLista.dataInicio,
            dataFin: this.consultaLista.dataFin,
            album: this.consultaLista.todos ? false : this.consultaLista.album,
            antecedentes: this.consultaLista.todos ? false : this.consultaLista.antecedentes,
            condutores: this.consultaLista.todos ? false : this.consultaLista.condutores,
            individuo: this.consultaLista.todos ? false : this.consultaLista.individuo,
            veiculos: this.consultaLista.todos ? false : this.consultaLista.veiculos,
            veiculoRestricao: this.consultaLista.todos ? false : this.consultaLista.veiculoRestricao
          },
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProcExportData('ExportarXls', 'spConsultaGeo', _params, path, nomearquivo).then((res: string) => {
          const resultado = res.split(';');
          if (resultado[0] === 'ok') {
            window.open(this.env.API_HOST + this.env.NAME_HOST + path + resultado[1]);
          } else {
            this.alertService.presentAlert({
              pTitle: 'ERRO', pSubtitle: ConsultaListaPage.APP_NAME, pMessage: 'Falha ao fazer o arquivo'
            });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: ConsultaListaPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack();
    }
  }

}
