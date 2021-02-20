import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

//MODELS
import { ConsultaOnlineConductores } from "../../models/consultaonlineconductores";

//SERVICES
import { ValidationsService } from "../../services/validations.service";
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-consulta-online-conductores',
  templateUrl: './consulta-online-conductores.page.html',
  styleUrls: ['./consulta-online-conductores.page.scss'],
})
export class ConsultaOnlineConductoresPage implements OnInit {

  static CRUD_READ: string = 'READ';
  private APP_NAME: string = this.env.AppName;

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public consultaOnlineConductores: Array<ConsultaOnlineConductores> = [];
  public consultaOnlineConductor = new ConsultaOnlineConductores();

  constructor(

    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private validations: ValidationsService
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();

  }
  // private ConsultaConductor(_statusCRUD, _formValues) {
  //   if (_formValues.cpf == null || _formValues.cpf.trim() == '') {
  //     this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'informe cpf' });
  //     return;
  //   }
  //   this.sendRequest('spConsultaCondutorMop', {
  //     StatusCRUD: _statusCRUD,
  //     formValues: _formValues
  //   }, (resultado) => {

  //     let results = JSON.parse(atob(resultado.results));

  //     this.consultaOnlineConductores = results.map(function callback(value) {
  //       let consultaOnlineConductor = new ConsultaOnlineConductores();
  //       consultaOnlineConductor.codigo = value.codigo;
  //       consultaOnlineConductor.cpf = value.cpf;
  //       consultaOnlineConductor.nome = value.nome;
  //       consultaOnlineConductor.sexo = value.sexo;
  //       consultaOnlineConductor.categoria = value.categoria;
  //       consultaOnlineConductor.validade = value.validade;

  //       return consultaOnlineConductor;
  //     });

  //     console.log("info", this.consultaOnlineConductores)


  //   });
  // }
  getConductor() {

    let fechaActual = new Date()
    let anoActual = (fechaActual.getFullYear()).toString();
    let mesActual = (fechaActual.getMonth() + 1).toString();
    let diaActual = (fechaActual.getDay()).toString();
    let horaActual = (fechaActual.getHours()).toString();
    let minutoActual = (fechaActual.getMinutes()).toString();
    let segundoActual = (fechaActual.getSeconds()).toString();

    this.consultaOnlineConductor.fecha = anoActual + '/' + mesActual + '/' + diaActual + ' ' + horaActual + ':' + minutoActual + ':' + segundoActual;

    this.consultaOnlineConductor.cpf = this.validations.convertCPFtoNumber(this.consultaOnlineConductor.cpf);
    if (this.consultaOnlineConductor.cpf.length < 11) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'CPF inválido' });
      return;
    }

    // this.ConsultaConductor(ConsultaOnlineConductoresPage.CRUD_READ, {
    //   'cpf': this.consultaOnlineConductor.cpf,
    //   'fecha': this.consultaOnlineConductor.fecha

    // }) 

    const params = new FormData();
    params.append('cpf', this.Authorizer.encripta(this.consultaOnlineConductor.cpf));

    this.sendRequestOnline('ConsultaCondutor', params
      , (resultado) => {

        console.log('resultado.results:', resultado);

        this.consultaOnlineConductores = resultado.map(function callback(value) {
          let consultaOnlineConductor = new ConsultaOnlineConductores();

          if (value.codretorno == 0) {
            // consultaOnlineConductor.codigo = value.codigo;
            consultaOnlineConductor.cpf = value.cpf;
            consultaOnlineConductor.nome = value.nome;
            consultaOnlineConductor.sexo = value.sexo;
            consultaOnlineConductor.categoria = value.categoria;
            consultaOnlineConductor.validade = value.validade;
            consultaOnlineConductor.usuario = value.usuario;
            consultaOnlineConductor.fecha = value.fecha;
            consultaOnlineConductor.bairro = value.bairro;
            consultaOnlineConductor.bloqueio = value.bloqueio;
            if(consultaOnlineConductor.bloqueio.trim()!='SIM'||consultaOnlineConductor.bloqueio.trim()!='sim'){
              consultaOnlineConductor.bloqueio='NÃO'
            }
            consultaOnlineConductor.cep = value.cep;
            consultaOnlineConductor.complemento = value.complemento;
            consultaOnlineConductor.descricaocnh = value.descricaocnh;
            consultaOnlineConductor.endereco = value.endereco;
            consultaOnlineConductor.mae = value.mae;
            consultaOnlineConductor.municipio = value.municipio;
            consultaOnlineConductor.nascimento = value.nascimento;
            consultaOnlineConductor.naturalidade = value.naturalidade;
            consultaOnlineConductor.numerodocumento = value.numerodocumento;
            consultaOnlineConductor.orgao = value.orgao;
            consultaOnlineConductor.pai = value.pai;
            consultaOnlineConductor.pgu = value.pgu;
            consultaOnlineConductor.pontos = value.pontos;
            consultaOnlineConductor.primeira = value.primeira;
            consultaOnlineConductor.registro = value.registro;
            consultaOnlineConductor.tipodocumento = value.tipodocumento;
            consultaOnlineConductor.ufcondutor = value.ufcondutor;
            consultaOnlineConductor.ufendereco = value.ufendereco;

          }

          return consultaOnlineConductor;
        });

        if (this.consultaOnlineConductores.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        }

        if (!this.consultaOnlineConductores[0].cpf) {
          this.consultaOnlineConductores = [];
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'CPF não encontrado' });
        }else{
          
        }

        console.log('this.consultaOnlineConductores:', this.consultaOnlineConductores);

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
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Você não tem permissão para esta ação' })
    }
  }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/95']);
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
      console.log('armando');
    }
  }

  private sendRequestOnline(
    procedure: string,
    params: any,
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {

      if (this.permissoes.Pesquisar > 0
        || this.permissoes.Deletar > 0
        || this.permissoes.Inserir > 0
        || this.permissoes.Editar > 0
        // || (params.StatusCRUD == 'READ') && (this.permissoes.Pesquisar > 0))
      ) {
        this.Authorizer.QueryOnline(procedure, params).then(res => {
          const resultado: any = res;
          try {
            if (Array.isArray(resultado)) {
              next(resultado);
              this.alertService.showLoader('Cargando', 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: resultado.error.Message });
              console.log('resultado.error.StackTrace: ', resultado.error.StackTrace);
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

  /* ==================== CPF MASK ====================== */
  formatCPF(valString: any, idComponent: any) {
    this.validations.formatCPF(valString, idComponent)
  }
}

