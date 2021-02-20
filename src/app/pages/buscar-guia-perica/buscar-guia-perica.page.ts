import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

//Services
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';

//Models
import { GuiaPericia } from 'src/app/models/guia-pericia';
import { Infracao } from 'src/app/models/infracao';
import { Segmento } from 'src/app/models/segmento';
import { Grupo } from 'src/app/models/grupo';
import { User } from 'src/app/models/user';
import { Municipio } from 'src/app/models/municipio';

@Component({
  selector: 'app-buscar-guia-perica',
  templateUrl: './buscar-guia-perica.page.html',
  styleUrls: ['./buscar-guia-perica.page.scss'],
})
export class BuscarGuiaPericaPage implements OnInit {
  private APP_NAME: string = this.env.AppName;

  private CRUD_READ = 'READ';

  public showTable = false;
  public showButtonReenviar = false;
  public showChecks = true;
  public selectBack = false;

  public gpMedicoLegal = new GuiaPericia();
  public gpMedicoLegals: Array<GuiaPericia> = [];
  public guiasAsociadas: Array<any> = [];
  public disabledata = true;

  public infracao = new Infracao();
  public Infracoes: Array<Infracao> = [];


  public grupos: Array<Grupo> = [];




  public permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado

  public date: Date = new Date();

  public quantGuiasSelecionadas = 0;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController,
    private activatedRoute: ActivatedRoute
  ) { }


  ngOnInit() {
    //get dates
    let current_datetime = new Date()
    let formatted_date = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()

    this.getPermissoesModulo();
    this.CarregaoGrupos();

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.gpMedicoLegal.tipo_guia = data.tipoGuia;
        this.gpMedicoLegal.codigo = data.codigo;
        if (this.gpMedicoLegal.codigo) {
          //this.CRUDGuiaPericia(IncluirExamePage.CRUD_READ);
        }
        if (!this.gpMedicoLegal.tipo_guia) {
          this.selectBack = true;
        }
        if (this.gpMedicoLegal.tipo_guia) {
          this.selectBack = false;
        }
      });

  }

  ionViewWillEnter() {
    // Disparado quando o roteamento de componentes está prestes a se animar.
  }

  ionViewDidEnter() {
    // Disparado quando o roteamento de componentes terminou de ser animado.        
    // if (!this.Authorizer.HashKey) {
    //   this.router.navigate(['/menu/options/tabs/main']);
    // } else {
    //   this.getSegmentos();
    //   this.CarregaUFs();
    // }
    this.showTable = false;
  }
  /* -------------------------- LOAD SELECTS ---------------------------- */
  //Grupos
  CarregaoGrupos() {

    this.consultarGruposSegmento();
  }

  private consultarGruposSegmento() {

    this.sendRequest('spConsultarGruposSegmento', {
      StatusCRUD: 'READ',
      formValues: { 'segmento': 'Policia Civil' }
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



  dataInicio(event) {
    if (event.detail.value) {
      this.disabledata = false;
    } else {
      this.disabledata = true;
    }
  }
  /* -------------------------- END LOAD SELECTS ---------------------------- */
  /* --------------------- LOAD TABLE --------------------------------------- */
  private consultaInfracoes(_statusCRUD, _formValues) {

    _formValues.Segmento == "TODOS" ? _formValues.Segmento = '' : null;
    _formValues.Grupo == "TODOS" ? _formValues.Grupo = '' : null;
    _formValues.usuario == "TODOS" ? _formValues.usuario = '' : null;

    this.alertService.loaderPresent();
    this.sendRequest('spInfracoesParaReenviar', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {
      this.Infracoes = JSON.parse(atob(resultado.results));
      this.alertService.loaderDismiss();

      if (this.Infracoes.length === 0) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
      } else {
        this.showTable = true;
        this.showButtonReenviar = true;
        this.showChecks = true;
      }
    });
  }

  PesquisarGuiaPericia(form: NgForm) {
    //validate fields
    form.value.periodoRegistroDataInicio = this.validateUndefinedFields(form.value.periodoRegistroDataInicio)
    form.value.periodoRegistroDataFin = this.validateUndefinedFields(form.value.periodoRegistroDataFin)
    form.value.periodoDoFatoDataInicio = this.validateUndefinedFields(form.value.periodoDoFatoDataInicio)
    form.value.periodoDoFatoDataFin = this.validateUndefinedFields(form.value.periodoRegistroDataFin)
    form.value.destino_lado = this.validateUndefinedFields(form.value.destino_lado)
    form.value.tipo_guia = this.validateUndefinedFields(form.value.tipo_guia)
    form.value.ano = this.validateUndefinedFields(form.value.ano)
    form.value.sequencial = this.validateUndefinedFields(form.value.sequencial)
    form.value.periciando = this.validateUndefinedFields(form.value.periciando)
    // change later for the search
    form.value.periciando = '';
    //format datas
    //Datas Registro
    if (form.value.periodoRegistroDataInicio != '' && form.value.periodoRegistroDataFin != '') {
      form.value.periodoRegistroDataInicio = form.value.periodoRegistroDataInicio.substring(8, 10) + '/' + form.value.periodoRegistroDataInicio.substring(5, 7) + '/' + form.value.periodoRegistroDataInicio.substring(0, 4) + ' ' + '00:00:00'
      form.value.periodoRegistroDataFin = form.value.periodoRegistroDataFin.substring(8, 10) + '/' + form.value.periodoRegistroDataFin.substring(5, 7) + '/' + form.value.periodoRegistroDataFin.substring(0, 4) + ' ' + '23:59:59'

    } else {
      form.value.periodoRegistroDataInicio = '';
      form.value.periodoRegistroDataFin = '';
    }
    //Datas Fato
    if (form.value.periodoDoFatoDataInicio != '' && form.value.periodoDoFatoDataFin != '') {
      form.value.periodoDoFatoDataInicio = form.value.periodoDoFatoDataInicio.substring(8, 10) + '/' + form.value.periodoDoFatoDataInicio.substring(5, 7) + '/' + form.value.periodoDoFatoDataInicio.substring(0, 4) + ' ' + '00:00:00'
      form.value.periodoDoFatoDataFin = form.value.periodoDoFatoDataFin.substring(8, 10) + '/' + form.value.periodoDoFatoDataFin.substring(5, 7) + '/' + form.value.periodoDoFatoDataFin.substring(0, 4) + ' ' + '23:59:59'

    } else {
      form.value.periodoDoFatoDataInicio = '';
      form.value.periodoDoFatoDataFin = '';
    }

    //end of format datas   
    console.log("form", form.value)
    this.sendRequest('spBuscarGuiaPericia', {
      StatusCRUD: 'READ',
      formValues: form.value
    }, (resultado) => {
      this.gpMedicoLegals = JSON.parse(atob(resultado.results));
      for (let index = 0; index < this.gpMedicoLegals.length; index++) {

        if (this.gpMedicoLegals[index].nome_guia == null || this.gpMedicoLegals[index].nome_guia == 'NULL' || this.gpMedicoLegals[index].nome_guia == 'null') {
          this.gpMedicoLegals[index].nome_guia = ''
        }
        if (this.gpMedicoLegals[index].tipo_guia == null || this.gpMedicoLegals[index].tipo_guia == 'NULL' || this.gpMedicoLegals[index].tipo_guia == 'null') {
          this.gpMedicoLegals[index].tipo_guia = ''
        }
        if (this.gpMedicoLegals[index].ano == null || this.gpMedicoLegals[index].ano == 'NULL' || this.gpMedicoLegals[index].ano == 'null') {
          this.gpMedicoLegals[index].ano = ''
        }
        if (this.gpMedicoLegals[index].sequencial == null || this.gpMedicoLegals[index].sequencial == 'NULL' || this.gpMedicoLegals[index].sequencial == 'null') {
          this.gpMedicoLegals[index].sequencial = ''
        }
        if (this.gpMedicoLegals[index].numero_periciando == null || this.gpMedicoLegals[index].numero_periciando == 'NULL' || this.gpMedicoLegals[index].numero_periciando == 'null') {
          this.gpMedicoLegals[index].numero_periciando = ''
        }
        if (this.gpMedicoLegals[index].data_registro == null || this.gpMedicoLegals[index].data_registro == 'NULL' || this.gpMedicoLegals[index].data_registro == 'null') {
          this.gpMedicoLegals[index].data_registro = ''
        }
        if (this.gpMedicoLegals[index].hora_registro == null || this.gpMedicoLegals[index].hora_registro == 'NULL' || this.gpMedicoLegals[index].hora_registro == 'null') {
          this.gpMedicoLegals[index].hora_registro = ''
        }
        if (this.gpMedicoLegals[index].numero_procedimento == null || this.gpMedicoLegals[index].numero_procedimento == 'NULL' || this.gpMedicoLegals[index].numero_procedimento == 'null') {
          this.gpMedicoLegals[index].numero_procedimento = ''
        }
        if (this.gpMedicoLegals[index].destino_lado == null || this.gpMedicoLegals[index].destino_lado == 'NULL' || this.gpMedicoLegals[index].destino_lado == 'null') {
          this.gpMedicoLegals[index].destino_lado = ''
        }
        if (this.gpMedicoLegals[index].situacao == null || this.gpMedicoLegals[index].situacao == 'NULL' || this.gpMedicoLegals[index].situacao == 'null') {
          this.gpMedicoLegals[index].situacao = ''
        }
        if (this.gpMedicoLegals[index].orgao == null || this.gpMedicoLegals[index].orgao == 'NULL' || this.gpMedicoLegals[index].orgao == 'null') {
          this.gpMedicoLegals[index].orgao = ''
        }
        if (this.gpMedicoLegals[index].unidade == null || this.gpMedicoLegals[index].unidade == 'NULL' || this.gpMedicoLegals[index].unidade == 'null') {
          this.gpMedicoLegals[index].unidade = ''
        }
        if (this.gpMedicoLegals[index].sigilosa == null || this.gpMedicoLegals[index].sigilosa == 'NULL' || this.gpMedicoLegals[index].sigilosa == 'null') {
          this.gpMedicoLegals[index].sigilosa = ''
        }
        if (this.gpMedicoLegals[index].resgistrado == null || this.gpMedicoLegals[index].resgistrado == 'NULL' || this.gpMedicoLegals[index].resgistrado == 'null') {
          this.gpMedicoLegals[index].resgistrado = ''
        }
        if (this.gpMedicoLegals[index].autoridade == null || this.gpMedicoLegals[index].autoridade == 'NULL' || this.gpMedicoLegals[index].autoridade == 'null') {
          this.gpMedicoLegals[index].autoridade = ''
        }
        if (this.gpMedicoLegals[index].usuario == null || this.gpMedicoLegals[index].usuario == 'NULL' || this.gpMedicoLegals[index].usuario == 'null') {
          this.gpMedicoLegals[index].usuario = ''
        }
      }
      this.alertService.loaderDismiss();

      if (this.gpMedicoLegals.length === 0) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
      } else {
        this.showTable = true;
        this.showButtonReenviar = true;
        this.showChecks = true;
      }
      console.log('dataGuias', this.gpMedicoLegals)
    });

  }
  /* --------------------- END LOAD TABLE --------------------------------------- */

  public compareWithFn = (o1, o2) => {
    return o1 === o2;
  };
  compareWith = this.compareWithFn;
  /* ------------------- PERMISIONS USER -------------------------------------- */
  // NEEDED FUNCTIONS
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
  validateUndefinedFields(value) {
    if (value == undefined) {
      return (value = '');
    }
    else {
      return (value);
    }
  }

  formatDates(dataInicial, dataFinal) {
    let dateArray: Array<string> = [];
    if (dataInicial != '' && dataFinal != '') {
      dataInicial = dataInicial.substring(8, 10) + '/' + dataInicial.substring(5, 7) + '/' + dataInicial.substring(0, 4) + ' ' + '00:00:00'
      dataFinal = dataFinal.substring(8, 10) + '/' + dataFinal.substring(5, 7) + '/' + dataFinal.substring(0, 4) + ' ' + '23:59:59'


      dateArray.push(dataInicial, dataFinal);
      return (dateArray);
    } else {
      dateArray.push(dataInicial, dataFinal);
      return (dateArray);

    }
    console.log('datas', dateArray);
  }
  /* ------------------- END PERMISIONS USER -------------------------------------- */
  goBack() {
    this.router.navigate(['/menu/guia-pericia-digital']);
  }
  goToGuia() {
    if (this.gpMedicoLegal.tipo_guia == 'GM') {
      this.router.navigate(['/menu/incluir-exame-medico', this.gpMedicoLegal.codigo]);
    }
    if (this.gpMedicoLegal.tipo_guia == 'GL') {
      this.router.navigate(['/menu/incluir-exame-laboratorial', this.gpMedicoLegal.codigo]);
    }
  }
  /* ---------------------------- SENDREQUEST -------------------------------------- */
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
        // || (procedure === 'spCargos')
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
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.message });
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.APP_NAME, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack()
    }
  }

  /* ---------------------------- END SENDREQUEST -------------------------------------- */

  async confirmarGuiasSelecionadas(form: NgForm) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `Deseja Asociar ${this.quantGuiasSelecionadas} Guias selecionadas?`,
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
            this.asociarGuias();
            console.log('codigoGuiaPrincipal', this.gpMedicoLegal);
            console.log('codigosGuiasAsociadas', this.gpMedicoLegals);
          }
        }
      ]
    });

    await alert.present();
  }

  public onOffCheckInfracoes(event) {
    const valorOnOff = event.detail.checked;
    this.quantGuiasSelecionadas = (valorOnOff) ? this.gpMedicoLegals.length : 0;
    this.gpMedicoLegals.forEach(element => {
      element.reenviar = valorOnOff;
    });
  }

  public contarInfracaoSelecionada(value) {
    if (value) {
      this.quantGuiasSelecionadas++;
    } else {
      this.quantGuiasSelecionadas--;
    }
  }

  asociarGuias() {

    for (let index = 0; index < this.gpMedicoLegals.length; index++) {
      if (this.gpMedicoLegals[index].reenviar == true) {
        this.sendRequest('spAsociarGuias', {
          StatusCRUD: 'CREATE',
          formValues: { codigoGuiaPrincipal: this.gpMedicoLegal.codigo, codigoGuiaAsociada: this.gpMedicoLegals[index].codigo }
        }, (resultado) => {
          this.guiasAsociadas = JSON.parse(atob(resultado.results));
          this.showButtonReenviar = false;
          this.showChecks = false;
        });
      }
    }


    // Enviando informacao
    // this.sendRequest('spInfracoesParaReenviar', {
    //   StatusCRUD: 'UPDATE',
    //   formValues: { strCodigosGuias: strCodigos }
    // }, (resultado) => {
    //   this.Infracoes = JSON.parse(atob(resultado.results));
    //   this.showButtonReenviar = false;
    //   this.showChecks = false;
    // });

  }


  public showDescricao(texto, event) {
    event.target.textContent = texto;
  }

  public hiddeDescricao(texto, event) {
    event.target.textContent = texto;
  }

}
