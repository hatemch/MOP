import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { GuiaPericia } from 'src/app/models/guia-pericia';
import { EnvService } from 'src/app/services/env.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ValidationsService } from 'src/app/services/validations.service';
import { Grupo } from 'src/app/models/grupo';
import { ArmaModel } from 'src/app/models/armas';
import { DrogaModel } from 'src/app/models/drogas';
import { OutrosObjetos } from 'src/app/models/outros-objetos';
import { VeiculoGuia } from 'src/app/models/veiculo-guia';

@Component({
  selector: 'app-objetos-pericia',
  templateUrl: './objetos-pericia.page.html',
  styleUrls: ['./objetos-pericia.page.scss'],
})
export class ObjetosPericiaPage implements OnInit {
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';
  private APP_NAME: string = this.env.AppName;

  public noCompleteForm: boolean = false;


  public subtitle = 'Nova Guia';
  public flagForm: boolean = false;
  public gpExameLaboratorialLegal = new GuiaPericia();
  public gpExameLaboratorialLegals: Array<GuiaPericia> = [];
  public veiculoGuia = new VeiculoGuia();
  public veiculoGuias: Array<VeiculoGuia> = [];

  public outroObjeto = new OutrosObjetos();
  public outrosObjetos: Array<OutrosObjetos> = [];
  public arma = new ArmaModel();
  public armas: Array<ArmaModel> = []; s
  public droga = new DrogaModel();
  public drogas: Array<DrogaModel> = [];
  public activateButton = true;
  public grupos: Array<Grupo> = [];
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
    private alertController: AlertController,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private modalCtrl: ModalController,
    private authService: AuthService,
    private validations: ValidationsService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    let current_datetime = new Date()
    let formatted_date = current_datetime.getDate() + "/" + (current_datetime.getMonth() + 1) + "/" + current_datetime.getFullYear() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds()

    this.gpExameLaboratorialLegal.tipo_guia = 'GL';
    this.gpExameLaboratorialLegal.situacao = 'Rascunho';
    this.gpExameLaboratorialLegal.unidade = '1ªDT BARRIS';
    this.gpExameLaboratorialLegal.orgao = 'Policia Civil';
    this.gpExameLaboratorialLegal.data_registro = formatted_date.toString();
    this.CarregaSegmentoGrupos();





    //   await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec

    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.gpExameLaboratorialLegal.codigo = data.codigo;

        console.log("numguia", this.gpExameLaboratorialLegal.codigo);
        if (this.gpExameLaboratorialLegal.codigo) {
          this.CRUDGuiaPericia(ObjetosPericiaPage.CRUD_READ)




          this.activateButton = false;
        }
      });



  }
  ionViewDidEnter() {
    this.getArmas();
    this.getOutros();
    this.getDrogas();
    this.getVeiculos();

    //await new Promise(resolve => setTimeout(resolve, 2000)); // 3 sec


  }


  getArmas() {
    this.sendRequest('spArmaFogo', {
      StatusCRUD: 'READ',
      formValues: { numguia: this.gpExameLaboratorialLegal.codigo },
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.armas = results.map(function callback(value) {
        let arma = new ArmaModel();
        arma.codigoArma = value.codigo;
        arma.numguia = value.numguia;
        arma.tipo_local = value.tipo_local;
        arma.tipo_arma = value.tipo_arma;
        arma.marca = value.unidade_medida;
        arma.serie = value.quantidade;
        arma.calibre = value.calibre;
        arma.descricao = value.descricao;
        arma.descricao_local = value.descricao_local;
        arma.quesitacoes = value.quesitacoes;
        arma.usuario = value.usuario;
        arma.examen_requisitado = value.Exames.split(/['<''>']/);
        arma.nome_examen_requisitado = '';
        return arma;

      });
      for (let index = 0; index < this.armas.length; index++) {
        for (var i = 0; i < this.armas[index].examen_requisitado.length; i++)
          if (this.armas[index].examen_requisitado[i] == 'div') {
            this.armas[index].nome_examen_requisitado = this.armas[index].nome_examen_requisitado + this.armas[index].examen_requisitado[i + 1] + ', '
          }
      }
    });

  }

  getDrogas() {
    this.sendRequest('spDroga', {
      StatusCRUD: 'READ',
      formValues: { numguia: this.gpExameLaboratorialLegal.codigo },
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.drogas = results.map(function callback(value) {
        let droga = new DrogaModel();
        droga.numguia = value.numguia;
        droga.codigoDroga = value.codigo;
        droga.tipo_local = value.tipo_local;
        droga.tipo_droga = value.tipo_droga;
        droga.unidade_medida = value.unidade_medida;
        droga.quantidade = value.quantidade;
        droga.descricao = value.descricao;
        droga.descricao_local = value.descricao_local;
        droga.quesitacoes = value.quesitacoes;
        droga.usuario = value.usuario;
        droga.examen_requisitado = value.Exames.split(/['<''>']/);
        droga.nome_examen_requisitado = '';
        return droga;
      });
      for (let index = 0; index < this.drogas.length; index++) {
        for (var i = 0; i < this.drogas[index].examen_requisitado.length; i++)
          if (this.drogas[index].examen_requisitado[i] == 'div') {
            this.drogas[index].nome_examen_requisitado = this.drogas[index].nome_examen_requisitado + this.drogas[index].examen_requisitado[i + 1] + ', '
          }
      }
    });

  }

  getOutros() {
    this.sendRequest('spOutrosGuia', {
      StatusCRUD: 'READ',
      formValues: { numguia: this.gpExameLaboratorialLegal.codigo },
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.outrosObjetos = results.map(function callback(value) {
        let outroObjeto = new OutrosObjetos();
        outroObjeto.codigoObjeto = value.codigo;
        outroObjeto.numguia = value.numguia;
        outroObjeto.tipo_local = value.tipo_local;
        outroObjeto.tipo_objeto = value.tipo_objeto;
        outroObjeto.unidade_medida = value.unidade_medida;
        outroObjeto.quantidade = value.quantidade;
        outroObjeto.descricao = value.descricao;
        outroObjeto.descricao_local = value.descricao_local;
        outroObjeto.quesitacoes = value.quesitacoes;
        outroObjeto.usuario = value.usuario;
        outroObjeto.examen_requisitado = value.Exames.split(/['<''>']/);
        outroObjeto.nome_examen_requisitado = '';
        return outroObjeto;
      });
      for (let index = 0; index < this.outrosObjetos.length; index++) {
        for (var i = 0; i < this.outrosObjetos[index].examen_requisitado.length; i++)
          if (this.outrosObjetos[index].examen_requisitado[i] == 'div') {
            this.outrosObjetos[index].nome_examen_requisitado = this.outrosObjetos[index].nome_examen_requisitado + this.outrosObjetos[index].examen_requisitado[i + 1] + ', '
          }
      }
      console.log('outros', this.outrosObjetos);
    });


  }

  getVeiculos() {
    this.sendRequest('spVeiculoGuia', {
      StatusCRUD: 'READ',
      formValues: { numguia: this.gpExameLaboratorialLegal.codigo },
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.veiculoGuias = results.map(function callback(value) {
        let veiculoGuia = new VeiculoGuia()
        veiculoGuia.codigo = value.codigo;
        veiculoGuia.numguia = value.numguia;
        veiculoGuia.placa = value.placa;
        veiculoGuia.marca = value.marca;
        veiculoGuia.tipo_local = value.tipo_local;
        veiculoGuia.tipo_veiculo = value.tipo_veiculo;
        veiculoGuia.ano_mod = value.ano_mod;
        veiculoGuia.modelo = value.modelo;
        veiculoGuia.ano_fab = value.ano_fab;
        veiculoGuia.chassi = value.chassi;
        veiculoGuia.renavam = value.renavam;
        veiculoGuia.descricao = value.descricao;
        veiculoGuia.descricao_local = value.descricao_local;
        veiculoGuia.quesitacoes = value.quesitacoes;
        veiculoGuia.usuario = value.usuario;
        veiculoGuia.examen_requisitado = value.Exames.split(/['<''>']/);
        veiculoGuia.nome_examen_requisitado = '';
        return veiculoGuia;
      });
      for (let index = 0; index < this.veiculoGuias.length; index++) {
        for (var i = 0; i < this.veiculoGuias[index].examen_requisitado.length; i++)
          if (this.veiculoGuias[index].examen_requisitado[i] == 'div') {
            this.veiculoGuias[index].nome_examen_requisitado = this.veiculoGuias[index].nome_examen_requisitado + this.veiculoGuias[index].examen_requisitado[i + 1] + ', '
          }
      }

    });

  }
  CarregaSegmentoGrupos() {

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


      // if (this.user.GRUPO) {
      //   let grupo
      //   grupo = this.user.GRUPO;
      //   this.user.GRUPO = '';
      //   this.user.GRUPO = grupo;
      // }
    });
  }



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
  private CRUDGuiaPericia(_statusCRUD) {

    this.sendRequest('spGuiaPericia', {
      StatusCRUD: _statusCRUD,
      formValues: this.gpExameLaboratorialLegal
    }, (resultado) => {

      switch (_statusCRUD) {
        case ObjetosPericiaPage.CRUD_CREATE:
          // this.router.navigate(['/menu/exame-laboratorial-legal']);
          this.gpExameLaboratorialLegal.codigo = JSON.parse(atob(resultado.results))[0].codigo;
          console.log('data guia', this.gpExameLaboratorialLegal.codigo)


          break;
        case ObjetosPericiaPage.CRUD_READ:


          this.gpExameLaboratorialLegal.nome_guia = JSON.parse(atob(resultado.results))[0].nome_guia;
          this.gpExameLaboratorialLegal.tipo_guia = JSON.parse(atob(resultado.results))[0].tipo_guia;
          this.gpExameLaboratorialLegal.ano = JSON.parse(atob(resultado.results))[0].ano;
          this.gpExameLaboratorialLegal.sequencial = JSON.parse(atob(resultado.results))[0].sequencial;
          this.gpExameLaboratorialLegal.numero_periciando = JSON.parse(atob(resultado.results))[0].numero_periciando;
          this.gpExameLaboratorialLegal.data_registro = JSON.parse(atob(resultado.results))[0].data_registro;
          this.gpExameLaboratorialLegal.hora_registro = JSON.parse(atob(resultado.results))[0].hora_registro;
          this.gpExameLaboratorialLegal.numero_procedimento = JSON.parse(atob(resultado.results))[0].numero_procedimento;
          this.gpExameLaboratorialLegal.destino_lado = JSON.parse(atob(resultado.results))[0].destino_lado;
          this.gpExameLaboratorialLegal.orgao = JSON.parse(atob(resultado.results))[0].orgao;
          this.gpExameLaboratorialLegal.unidade = JSON.parse(atob(resultado.results))[0].unidade;
          this.gpExameLaboratorialLegal.sigilosa = JSON.parse(atob(resultado.results))[0].sigilosa;
          this.gpExameLaboratorialLegal.resgistrado = JSON.parse(atob(resultado.results))[0].resgistrado;
          this.gpExameLaboratorialLegal.autoridade = JSON.parse(atob(resultado.results))[0].autoridade;
          this.gpExameLaboratorialLegal.usuario = JSON.parse(atob(resultado.results))[0].usuario;



          this.CarregaSegmentoGrupos();


          break;
        case ObjetosPericiaPage.CRUD_UPDATE:
          this.router.navigate(['/menu/exame-laboratorial-legal']);
          break;

        default:
          break;
      }
    });
  }



  private CRUDArmas(_statusCRUD) {

    this.sendRequest('spArmaFogo', {
      StatusCRUD: _statusCRUD,
      formValues: this.arma
    }, (resultado) => {

      switch (_statusCRUD) {
        case ObjetosPericiaPage.CRUD_CREATE:
          // this.router.navigate(['/menu/exame-laboratorial-legal']);
          this.arma.codigoArma = JSON.parse(atob(resultado.results))[0].codigo;
          console.log('data guia arma', this.arma.codigoArma)


          break;

        case ObjetosPericiaPage.CRUD_UPDATE:
          this.router.navigate(['/menu/objetos-pericia', this.arma.numguia]);
          break;
        case ObjetosPericiaPage.CRUD_DELETE:
          //this.veiculoGuias = [];
          this.getArmas();
          break;

        default:
          break;
      }
    });
  }
  async willDeleteArma(codigoArma: string, value: string) {
    this.arma.codigoArma = codigoArma;
    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar Guia com sequencial: <strong>' + value + '?</strong>!!!',
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
            this.deleteArma(codigoArma);
          }
        }
      ]
    });

    await alert.present();
  }
  public deleteArma(codigoArma: string) {
    this.arma.codigoArma = codigoArma;
    this.arma.numguia = this.gpExameLaboratorialLegal.codigo;
    this.CRUDArmas(ObjetosPericiaPage.CRUD_DELETE);
  }
  private CRUDDrogas(_statusCRUD) {

    this.sendRequest('spDroga', {
      StatusCRUD: _statusCRUD,
      formValues: this.droga
    }, (resultado) => {

      switch (_statusCRUD) {
        case ObjetosPericiaPage.CRUD_CREATE:
          // this.router.navigate(['/menu/exame-laboratorial-legal']);
          this.droga.codigoDroga = JSON.parse(atob(resultado.results))[0].codigoObjeto;
          console.log('data guia droga', this.droga.codigoDroga)


          break;

        case ObjetosPericiaPage.CRUD_UPDATE:
          this.router.navigate(['/menu/exame-laboratorial-legal']);
          break;
        case ObjetosPericiaPage.CRUD_DELETE:
          //this.veiculoGuias = [];
          this.getDrogas();
          break;

        default:
          break;
      }
    });
  }
  async willDeleteDroga(codigo: string, value: string) {
    this.droga.codigoDroga = codigo;
    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar Guia com sequencial: <strong>' + value + '?</strong>!!!',
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
            this.deleteDroga(codigo);
          }
        }
      ]
    });

    await alert.present();
  }
  public deleteDroga(codigoDroga: string) {
    this.droga.codigoDroga = codigoDroga;
    this.droga.numguia = this.gpExameLaboratorialLegal.codigo;
    this.CRUDDrogas(ObjetosPericiaPage.CRUD_DELETE);
  }
  private CRUDVeiculo(_statusCRUD) {

    this.sendRequest('spVeiculoGuia', {
      StatusCRUD: _statusCRUD,
      formValues: this.veiculoGuia
    }, (resultado) => {

      switch (_statusCRUD) {
        case ObjetosPericiaPage.CRUD_CREATE:
          // this.router.navigate(['/menu/exame-laboratorial-legal']);
          this.veiculoGuia.codigo = JSON.parse(atob(resultado.results))[0].codigo;
          console.log('data guia', this.veiculoGuia.codigo)


          break;

        case ObjetosPericiaPage.CRUD_UPDATE:
          this.router.navigate(['/menu/exame-laboratorial-legal']);
          break;
        case ObjetosPericiaPage.CRUD_DELETE:
          //this.veiculoGuias = [];
          this.getVeiculos();
          break;

        default:
          break;
      }
    });
  }
  async willDeleteVeiculo(codigo: string, value: string) {

    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar Guia com sequencial: <strong>' + value + '?</strong>!!!',
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
            this.deleteVeiculo(codigo);
          }
        }
      ]
    });

    await alert.present();
  }
  public deleteVeiculo(codigoVeiculo: string) {
    this.veiculoGuia.codigo = codigoVeiculo;
    this.veiculoGuia.numguia = this.gpExameLaboratorialLegal.codigo;
    this.CRUDVeiculo(ObjetosPericiaPage.CRUD_DELETE);
  }
  private CRUDOutrosObjetos(_statusCRUD) {

    this.sendRequest('spOutrosGuia', {
      StatusCRUD: _statusCRUD,
      formValues: this.outroObjeto
    }, (resultado) => {

      switch (_statusCRUD) {
        case ObjetosPericiaPage.CRUD_CREATE:
          // this.router.navigate(['/menu/exame-laboratorial-legal']);
          this.outroObjeto.codigoObjeto = JSON.parse(atob(resultado.results))[0].codigoObjeto;
          console.log('data guia', this.outroObjeto.codigoObjeto)


          break;

        case ObjetosPericiaPage.CRUD_UPDATE:
          this.router.navigate(['/menu/objetos-pericia', this.outroObjeto.numguia]);
          break;
        case ObjetosPericiaPage.CRUD_DELETE:
          //this.veiculoGuias = [];
          this.getOutros();
          break;

        default:
          break;
      }
    });
  }
  async willDeleteOutro(codigo: string, value: string) {
    this.outroObjeto.codigoObjeto = codigo;
    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar Guia com sequencial: <strong>' + value + '?</strong>!!!',
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
            this.deleteOutro(codigo);
          }
        }
      ]
    });

    await alert.present();
  }
  public deleteOutro(codigoOutro: string) {
    this.outroObjeto.codigoObjeto = codigoOutro;
    this.outroObjeto.numguia = this.gpExameLaboratorialLegal.codigo;
    this.CRUDOutrosObjetos(ObjetosPericiaPage.CRUD_DELETE);
  }

  goOutros() {
    this.router.navigate(['/menu/outros', this.gpExameLaboratorialLegal.codigo]);
  }
  goDrogas() {
    this.router.navigate(['/menu/drogas', this.gpExameLaboratorialLegal.codigo]);
  }
  goArma() {
    this.router.navigate(['/menu/arma', this.gpExameLaboratorialLegal.codigo]);
  }
  goVeiculo() {
    this.router.navigate(['/menu/veiculo', this.gpExameLaboratorialLegal.codigo]);
  }
  goBack() {
   
    this.router.navigate(['/menu/incluir-exame-laboratorial', this.gpExameLaboratorialLegal.codigo]);
  }
 
  goToEditDrogas(codigoDroga, numguia) {
    //this.drogas = [];
    this.router.navigate(['/menu/drogas', codigoDroga, numguia])

  }
  goToEditArma(codigoArma, numguia) {
    //this.armas = [];
    this.router.navigate(['/menu/arma', codigoArma, numguia])

  }
  goToEditVeiculo(codigoVeiculo, numguia) {
    //this.veiculoGuias = [];
    this.router.navigate(['/menu/veiculo', codigoVeiculo, numguia])


  }
  goToEditOutrosObjestos(codigoOutroObjeto, numguia) {
    //this.outrosObjetos = [];
    this.router.navigate(['/menu/outros', codigoOutroObjeto, numguia])


  }

}
