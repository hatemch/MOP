import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';


//SERVICES
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { ValidationsService } from 'src/app/services/validations.service';
//MODELS
import { Periciandos } from 'src/app/models/periciandos';
import { Municipio } from 'src/app/models/municipio';
import { BuscarPessoasPage } from '../buscar-pessoas/buscar-pessoas.page';
@Component({
  selector: 'app-incluir-periciando',
  templateUrl: './incluir-periciando.page.html',
  styleUrls: ['./incluir-periciando.page.scss'],
})
export class IncluirPericiandoPage implements OnInit {
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  private APP_NAME: string = this.env.AppName;



  public columns = [{ text: 'Nome', bold: true }, { text: 'Descriçao', bold: true }];
  public subtitle = 'Periciandos';
  public flagForm: boolean = false;
  public periciando = new Periciandos();
  public periciandos: Array<Periciandos> = [];

  //arrays to show the data in the selects//

  public envolvimentos: Array<any> = [];
  public orgaoExpedidor: Array<any> = [];
  public examePericiando: Array<any> = [];
  public tipologradouros: Array<any> = [];
  public tipoLocal: Array<any> = [];


  public municipio: Array<any> = [];
  public bairros: Array<any> = [];
  public logradouro: Array<any> = [];
  public localProvavel: Array<any> = [];
  public municipios: Array<Municipio> = [];
  public causaProvavel: Array<any> = [
    { id: 1, nome: 'Natural' },
    { id: 2, nome: 'Homicídio' },
    { id: 3, nome: 'Suicidio' }
  ];

  public pais: Array<any> = [

    { id: 1, nome: 'Brasil' }

  ];
  public uf: Array<any> = [
    { codigoUF: 29, sigla: "BA" }
  ]
  public cutis: Array<any> = [
    { id: 1, nome: 'Branca' },
    { id: 2, nome: 'Preta' },
    { id: 3, nome: 'Parda' }
  ];
  public nacionalidade: Array<any> = [
    { id: 1, nome: 'Brasileiro' },
    { id: 2, nome: 'Alemão' },
    { id: 3, nome: 'Americano' },
    { id: 4, nome: 'Andorrano' }
  ];
  public estadoCivil: Array<any> = [
    { id: 1, nome: 'Solteiro(a)' },
    { id: 2, nome: 'Casado(a)' },
    { id: 3, nome: 'Divorciado(a)' },
    { id: 4, nome: 'Viúvo(a)' },
    { id: 5, nome: 'Separado(a)' }
  ];
  public grauInstrucao: Array<any> = [
    { id: 1, nome: 'Analfabeto' },
    { id: 2, nome: 'Ensino Fundamental' },
    { id: 3, nome: 'bacharelado' },
    { id: 4, nome: 'Mestrado' },
    { id: 5, nome: 'Doutorado' }
  ];
  public naturalidade: Array<any> = [
    { id: 1, nome: 'Brasil-bahia-salvador' },
    { id: 2, nome: 'Brasil-Brasilia-Guara' },
    { id: 3, nome: 'Brasil-Rio de janeiro-copa Cabana' }
  ];
  public proficao: Array<any> = [
    { id: 1, nome: 'Engenheiro de software' },
    { id: 2, nome: 'Gerente de serviços médicos' },
    { id: 3, nome: 'Proffesor universitario' },
    { id: 4, nome: 'Analista de informações' },
    { id: 5, nome: 'Cientista de dados' },
    { id: 6, nome: 'Repórter de jornal' },
    { id: 7, nome: 'Bombeiro' }
  ];
  public orientacaoSexual: Array<any> = [
    { id: 1, nome: 'Heterosexual' },
    { id: 2, nome: 'Homosexual' },
    { id: 3, nome: 'bisexual' },
    { id: 4, nome: 'Transsexual' },
    { id: 5, nome: 'Outro' }
  ];
  public sexo: Array<any> = [
    { id: 1, nome: 'Femenino' },
    { id: 2, nome: 'Masculino' },
    { id: 3, nome: 'Não Identificado' }
  ]
  public religiao: Array<any> = [
    { id: 1, nome: 'Catókico' },
    { id: 2, nome: 'Judaísmo' },
    { id: 3, nome: 'Islamismo' },
    { id: 4, nome: 'Protestante' },
    { id: 5, nome: 'Hinduísmo' },
    { id: 6, nome: 'Espiritismo' },
    { id: 7, nome: 'Sikhismo' }
  ];







  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  };


  constructor(
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private authService: AuthService,
    private validations: ValidationsService,
    private activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {




    this.activatedRoute.params.subscribe(
      data => {

        //"data" carries all the parameters
        this.periciando.numguia = data.codigoGuia;
        this.periciando.codigo = data.codigoPericiando;
        if (this.periciando.codigo) {
          this.CRUDPericiandos(IncluirPericiandoPage.CRUD_READ);
        }

      }
    )

    let current_datetime = new Date()
    let formatted_date = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()

    // await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec

    this.carregaTipoLogradouro()
    this.carregaEnvolvimento();
    this.CarregaOrgaoExpendidor();
    // this.carregaExamePericiando();
    this.carregaLocalProvavel();
    this.carregaMunicipios();
    this.carregaTipoLocal();


  }

  goBack() {
    this.navCtrl.back();
  }
  goToIncluirPericiando() {
    this.router.navigate(['/menu/incluir-periciando']);;
  }

  //filing the selects with the data from the data base//

  carregaEnvolvimento() {
    this.sendRequest('spCarregaEnvolvimento', {
      StatusCRUD: 'READ',
      formValues: '',

    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      this.envolvimentos = results;
      console.log('envolvimentos', this.envolvimentos);
    });
  }
  carregaMunicipios() {

    this.sendRequest('spMunicipios', {
      StatusCRUD: 'READ',
      formValues: { 'codigoUF': "29" },
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.municipios = results;
      console.log('Municipios', this.municipios);
    });

  }

  public carregaBairros() {

    this.sendRequest('spConsultaBairros', {
      StatusCRUD: 'READ',
      formValues: { 'codigoMunicipio': this.periciando.municipio }
    }, (resultado) => {

      this.bairros = JSON.parse(atob(resultado.results));
      console.log("bairros", this.bairros)


    });

  }
  carregaTipoLogradouro() {

    this.sendRequest('spTipoLogradouro', {
      StatusCRUD: 'READ',
      formValues: ''
    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));



      this.tipologradouros = results
      console.log('tiposLogradouro', this.tipologradouros);
    });
  }

  carregaLocalProvavel() {
    this.sendRequest('spConsultaTipolocal', {
      StatusCRUD: 'READ',
      formValues: '',

    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      this.localProvavel = results;
      console.log('localProvavel', this.localProvavel);
    });
  }
  carregaTipoLocal() {
    this.sendRequest('spCarregaTipoLocal', {
      StatusCRUD: 'READ',
      formValues: '',

    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      this.tipoLocal = results;
      console.log('tipoLocal', this.tipoLocal);
    });
  }
  carregaExamePericiando() {
    this.sendRequest('spCarregaExameItem', {
      StatusCRUD: 'READ',
      formValues: { aplicado: 'Periciando' },

    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      this.examePericiando = results;
      console.log('exame Periciando', this.examePericiando);
    });
  }
  CarregaOrgaoExpendidor() {
    this.sendRequest('spCarregaOrgaoExpendidor', {
      StatusCRUD: 'READ',
      formValues: '',

    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));
      this.orgaoExpedidor = results;
      console.log('orgaoExpedidor', this.orgaoExpedidor);
    });
  }
  formatCPF(valString: any, idComponent: any) {
    this.validations.formatCPF(valString, idComponent)
  }
  formatTelefone(valString: any, idComponent: any) {
    this.validations.formatTelefone(valString, idComponent)
  }

  formatRG(valString: any, idComponent: any) {
    this.validations.formatRG(valString, idComponent)
  }

  /* ===== SAVE NEW/CHANGES =============================================================================== */
  save() {
    //logic to assing the values to the checkbox 

    if (this.periciando.nao_identificado.toString() == 'true') {
      this.periciando.nao_identificado = 'S';
    }
    // else {
    //   this.periciando.nao_identificado = 'N';
    // }
    if (this.periciando.fisica.toString() == 'true') {
      this.periciando.fisica = 'S';
    }
    // else {
    //   this.periciando.fisica = 'N';
    // }
    if (this.periciando.mental.toString() == 'true') {
      this.periciando.mental = 'S';
    }
    // else {
    //   this.periciando.mental = 'N';
    // }
    if (this.periciando.auditiva.toString() == 'true') {
      this.periciando.auditiva = 'S';
    }
    // else {
    //   this.periciando.auditiva = 'N';
    // }
    if (this.periciando.visual.toString() == 'true') {
      this.periciando.visual = 'S';
    }
    // else {
    //   this.periciando.visual = 'N';
    // }
    if (this.periciando.mesmo_endereco_localfato.toString() == 'true') {
      this.periciando.mesmo_endereco_localfato = 'S';
    }
    // else {
    //   this.periciando.mesmo_endereco_localfato = 'N';
    // }
    if (this.periciando.exame_externo.toString() == 'true') {
      this.periciando.exame_externo = 'S';
    }
    // else {
    //   this.periciando.exame_externo = 'N';
    // }
    if (this.periciando.acidente_trabalho.toString() == 'true') {
      this.periciando.acidente_trabalho = 'S';
    }
    // else {
    //   this.periciando.acidente_trabalho = 'N';
    // }

if(this.periciando.envolvimento==null){
  this.alertService.presentAlert({
    pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo Envolvimento não pode estar vazio '
  });
  return
}
if(this.periciando.cpf==null ||this.periciando.cpf.trim()=='' ){
  this.alertService.presentAlert({
    pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo CPF não pode estar vazio '
  });
  return
}
if(this.periciando.data_nacimento==null ||this.periciando.data_nacimento.trim()=='' ){
  this.alertService.presentAlert({
    pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo data do nacimento não pode estar vazio '
  });
  return
}
if(this.periciando.filiacao1==null ||this.periciando.filiacao1.trim()=='' ){
  this.alertService.presentAlert({
    pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo  Filiação não pode estar vazio '
  });
  return
}
if(this.periciando.sexo==null ||this.periciando.sexo.trim()=='' ){
  this.alertService.presentAlert({
    pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'O campo sexo não pode estar vazio '
  });
  return
}





    //Custom Validation, you can create a function to validate it

    if (this.periciando.codigo) {
      //ADD CODIGO TO UPDATE 


      console.log('UPDATE')

      this.CRUDPericiandos(IncluirPericiandoPage.CRUD_UPDATE);
    }
    else {
      console.log('CREATE')
      this.CRUDPericiandos(IncluirPericiandoPage.CRUD_CREATE);

    }
    console.log("periciandos", this.periciando)
  }
  /* ===== END SAVE NEW/CHANGES =============================================================================== */


  /* ===== CRUD MODULE Periciandos =============================================================================== */
  private CRUDPericiandos(statusCRUD) {

    this.sendRequest('spPericiandos', {
      StatusCRUD: statusCRUD,
      formValues: this.periciando
    }, (resultado) => {

      switch (statusCRUD) {
        case IncluirPericiandoPage.CRUD_CREATE:
          this.router.navigate(['/menu/periciandos', this.periciando.numguia]);

          break;
        case IncluirPericiandoPage.CRUD_READ:
          //Logic to get the values of the db for the selects 
          this.periciando.envolvimento = Number(JSON.parse(atob(resultado.results))[0].envolvimento);
          this.periciando.uf = Number(JSON.parse(atob(resultado.results))[0].uf);
          this.periciando.orgaoExp = Number(JSON.parse(atob(resultado.results))[0].orgaoExp);
          this.periciando.municipio = Number(JSON.parse(atob(resultado.results))[0].municipio);
          this.periciando.bairro = Number(JSON.parse(atob(resultado.results))[0].bairro);
          this.periciando.tipo_logradouro = Number(JSON.parse(atob(resultado.results))[0].tipo_logradouro);
          this.periciando.local_provavel = Number(JSON.parse(atob(resultado.results))[0].local_provavel);
          this.periciando.idade = JSON.parse(atob(resultado.results))[0].idade;
          this.periciando.tipificacao = JSON.parse(atob(resultado.results))[0].tipificacao;
          this.periciando.tipo_local = Number(JSON.parse(atob(resultado.results))[0].tipo_local);


          //logic to get the checkbox value from the db   
          if (JSON.parse(atob(resultado.results))[0].nao_identificado.trim() == 'S') {
            this.periciando.nao_identificado = 'true';
          } else {
            this.periciando.nao_identificado = 'false'
          }
          if (JSON.parse(atob(resultado.results))[0].fisica.trim() == 'S') {
            this.periciando.fisica = 'true';
          } else {
            this.periciando.fisica = 'false'
          }
          if (JSON.parse(atob(resultado.results))[0].mental.trim() == 'S') {
            this.periciando.mental = 'true';
          } else {
            this.periciando.mental = 'false'
          }
          if (JSON.parse(atob(resultado.results))[0].auditiva.trim() == 'S') {
            this.periciando.auditiva = 'true';
          } else {
            this.periciando.auditiva = 'false'
          }
          if (JSON.parse(atob(resultado.results))[0].visual.trim() == 'S') {
            this.periciando.visual = 'true';
          } else {
            this.periciando.visual = 'false'
          }
          if (JSON.parse(atob(resultado.results))[0].mesmo_endereco_localfato.trim() == 'S') {
            this.periciando.mesmo_endereco_localfato = 'true';
          } else {
            this.periciando.mesmo_endereco_localfato = 'false'
          }
          if (JSON.parse(atob(resultado.results))[0].exame_externo.trim() == 'S') {
            this.periciando.exame_externo = 'true';
          } else {
            this.periciando.exame_externo = 'false'
          }
          if (JSON.parse(atob(resultado.results))[0].acidente_trabalho.trim() == 'S') {
            this.periciando.acidente_trabalho = 'true';
          } else {
            this.periciando.acidente_trabalho = 'false'
          }

          this.periciando.usuario = JSON.parse(atob(resultado.results))[0].usuario;
          this.periciando.usuario = JSON.parse(atob(resultado.results))[0].usuario;
          this.periciando.recem_nascido = JSON.parse(atob(resultado.results))[0].recem_nascido;
          this.periciando.mae_nao_identificada = JSON.parse(atob(resultado.results))[0].mae_nao_identificada;
          this.periciando.tipo = JSON.parse(atob(resultado.results))[0].tipo;
          this.periciando.cpf = JSON.parse(atob(resultado.results))[0].cpf;
          this.periciando.rg = JSON.parse(atob(resultado.results))[0].rg;

          this.periciando.passaporte = JSON.parse(atob(resultado.results))[0].passaporte;
          this.periciando.nome = JSON.parse(atob(resultado.results))[0].nome;
          this.periciando.nome_social = JSON.parse(atob(resultado.results))[0].nome_social;
          this.periciando.filiacao = JSON.parse(atob(resultado.results))[0].filiacao;

          this.periciando.sexo = JSON.parse(atob(resultado.results))[0].sexo;
          this.periciando.cutis = JSON.parse(atob(resultado.results))[0].cutis;
          this.periciando.nacionalidade = JSON.parse(atob(resultado.results))[0].nacionalidade;
          this.periciando.naturalidade = JSON.parse(atob(resultado.results))[0].naturalidade;
          this.periciando.estado_civil = JSON.parse(atob(resultado.results))[0].estado_civil;
          this.periciando.profissao = JSON.parse(atob(resultado.results))[0].profissao;
          this.periciando.reliagao = JSON.parse(atob(resultado.results))[0].reliagao;
          this.periciando.graude_instrucao = JSON.parse(atob(resultado.results))[0].graude_instrucao;
          this.periciando.orientacao_sexual = JSON.parse(atob(resultado.results))[0].orientacao_sexual;


          this.periciando.deficiencia = JSON.parse(atob(resultado.results))[0].deficiencia;


          this.periciando.email = JSON.parse(atob(resultado.results))[0].email;
          this.periciando.telefone = JSON.parse(atob(resultado.results))[0].telefone;
          this.periciando.pais = JSON.parse(atob(resultado.results))[0].pais;

          this.periciando.cep = JSON.parse(atob(resultado.results))[0].cep;

          this.periciando.complemento = JSON.parse(atob(resultado.results))[0].complemento;
          this.periciando.data = JSON.parse(atob(resultado.results))[0].data;
          this.periciando.hora = JSON.parse(atob(resultado.results))[0].hora;

          this.periciando.causas_provavel = JSON.parse(atob(resultado.results))[0].causas_provavel;
          this.periciando.uf2 = JSON.parse(atob(resultado.results))[0].uf2;
          this.periciando.cep2 = JSON.parse(atob(resultado.results))[0].cep2;
          this.periciando.municipio2 = JSON.parse(atob(resultado.results))[0].municipio2;
          this.periciando.bairro2 = JSON.parse(atob(resultado.results))[0].bairro2;
          this.periciando.tipo_logradouro2 = JSON.parse(atob(resultado.results))[0].tipo_logradouro2;
          this.periciando.complemento2 = JSON.parse(atob(resultado.results))[0].complemento2;
          this.periciando.mesmo_endereco_pericando = JSON.parse(atob(resultado.results))[0].mesmo_endereco_pericando;



          this.periciando.descricao_local = JSON.parse(atob(resultado.results))[0].descricao_local;
          this.periciando.estado_periciando = JSON.parse(atob(resultado.results))[0].estado_periciando;
          this.periciando.data_nacimento = JSON.parse(atob(resultado.results))[0].data_nacimento;
          this.periciando.dataexamen1 = JSON.parse(atob(resultado.results))[0].Dataexamen1;
          this.periciando.horaexamen1 = JSON.parse(atob(resultado.results))[0].Horaexamen1;
          this.periciando.dataexamen2 = JSON.parse(atob(resultado.results))[0].Dataexamen2;
          this.periciando.horaexamen2 = JSON.parse(atob(resultado.results))[0].Horaexamen2;

          this.periciando.quesitacoes = JSON.parse(atob(resultado.results))[0].quesitacoes;
          this.periciando.numguia = JSON.parse(atob(resultado.results))[0].numguia;
          this.periciando.numocur = JSON.parse(atob(resultado.results))[0].numocur;
          this.periciando.rascunho = JSON.parse(atob(resultado.results))[0].rascunho;

          this.carregaBairros();







          break;
        case IncluirPericiandoPage.CRUD_UPDATE:
          this.router.navigate(['/menu/periciandos', this.periciando.numguia]);
          break;

        default:
          break;
      }
    });
  }
  /* ===== END CRUD MODULE Periciandos =============================================================================== */




  /* ===== GET PERMISSOES =============================================================================== */
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
  /* ===== END GET PERMISSOES =============================================================================== */




  // public compareWithFn(c1: any, c2: any): boolean {
  //   return c1 && c2 ? c1.id === c2.id : c1 === c2;
  // }
  // compareWith = this.compareWithFn;

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
        || (procedure === 'spUsuarios')
      ) {

        const _params = {
          StatusCRUD: params.StatusCRUD,
          formValues: params.formValues,
          CodigoUsuarioSistema: this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
          Hashkey: this.Authorizer.HashKey // Por defeito sempre está este valor
        }

        this.Authorizer.QueryStoreProcPost('ExecutarPOST', procedure, _params).then(res => {
          // this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
          const resultado: any = res[0];
          try {
            if (resultado.success) {
              next(resultado);
              this.alertService.showLoader(resultado.message, 1000);
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

  async openBuscarPessoas() {
    const modal = await this.modalCtrl.create({
      component: BuscarPessoasPage
    });

    await modal.present();
    
    const { data } = await modal.onDidDismiss();

    this.periciando.cpf = data.cpf;
    this.periciando.nome = data.nome;
    this.periciando.orgaoExp = data.orgao;
    this.periciando.sexo = data.sexo;
    this.periciando.filiacao1 = data.mae;
    this.periciando.data_nacimento = new Date(data.nascimento).toISOString();
    this.periciando.naturalidade = data.naturalidade;
    this.periciando.cep = data.cep;
    this.periciando.rg = data.numerodocumento;
  }

}