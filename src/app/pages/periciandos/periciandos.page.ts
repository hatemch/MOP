import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';


//SERVICES
import { EnvService } from 'src/app/services/env.service';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { ValidationsService } from 'src/app/services/validations.service';
//MODELS
import { Periciandos } from 'src/app/models/periciandos';


@Component({
  selector: 'app-periciandos',
  templateUrl: './periciandos.page.html',
  styleUrls: ['./periciandos.page.scss'],
})
export class PericiandosPage implements OnInit {
  private APP_NAME: string = this.env.AppName;

  static CRUD_READ: string = 'READ';
  static CRUD_DELETE: string = 'DELETE';
  public showOutrasPericias: boolean  = false;
  public showTable: boolean = false;
  public periciando = new Periciandos();
  public periciandos: Array<Periciandos> = [];
  public showTablePesquisa: boolean = false;
  public nomeGuia: string;
  public showObjetosPericia: boolean = false;

  public permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  }; // Permissoes do modulo para o usuario logado

  public columns = [{ text: 'Número da Guia', bold: true }, { text: 'Data/Hora', bold: true }];
  public date: Date = new Date();

  constructor(

    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    public modalController: ModalController
  ) { }


  ngOnInit() {
    this.getPermissoesModulo();
    this.activatedRoute.params.subscribe(
      data => {

        //"data" carries all the parameters
        this.periciando.numguia = data.codigo;
        this.periciando.tipo_guia=data.tipoGuia;
        if (this.periciando.tipo_guia == 'GM') {
          this.nomeGuia = 'Guia Medica';
          this.showOutrasPericias=true;
        }
        if (this.periciando.tipo_guia == 'GL') {
          this.showObjetosPericia= true;
          this.nomeGuia = 'Guia Laboratorial';
        }


      }
    )
  }


  ionViewDidEnter() {
    this.CRUDPericiandos(PericiandosPage.CRUD_READ);
  }

  // Guia Pericia Exame Medico Legal

  CRUDPericiandos(_statusCRUD) {


    this.sendRequest('spPericiandos', {
      StatusCRUD: _statusCRUD,
      formValues: this.periciando,

    }, (resultado) => {

      let results = JSON.parse(atob(resultado.results));

      this.periciandos = results.map(function callback(value) {
        let periciando = new Periciandos();
        periciando.codigo = value.codigo;
        periciando.usuario = value.usuario;
        periciando.envolvimento = value.descricaoEnvolvimento;
        periciando.tipificacao = value.tipificacao;
        periciando.nao_identificado = value.nao_identificado;
        periciando.recem_nascido = value.recem_nascido;
        periciando.mae_nao_identificada = value.mae_nao_identificada;
        periciando.tipo = value.tipo;
        periciando.cpf = value.cpf;
        periciando.rg = value.rg;
        periciando.orgaoExp = value.orgaoExp;
        periciando.passaporte = value.passaporte;
        periciando.nome = value.nome;
        periciando.nome_social = value.nome_social;
        periciando.filiacao = value.filiacao;
        periciando.sexo = value.sexo;
        periciando.cutis = value.cutis;
        periciando.nacionalidade = value.nacionalidade;
        periciando.naturalidade = value.naturalidade;
        periciando.deficiencia = value.deficiencia;
        periciando.idade = value.idade;
        periciando.fisica = value.fisica;
        periciando.mental = value.mental;
        periciando.auditiva = value.auditiva;
        periciando.visual = value.visual;
        periciando.estado_civil = value.estado_civil;
        periciando.profissao = value.profissao;
        periciando.reliagao = value.reliagao;
        periciando.graude_instrucao = value.graude_instrucao;
        periciando.orientacao_sexual = value.orientacao_sexual;
        periciando.email = value.email;
        periciando.telefone = value.telefone;
        periciando.pais = value.pais;
        periciando.uf = value.uf;
        periciando.cep = value.cep;
        periciando.municipio = value.municipio;
        periciando.bairro = value.bairro;
        periciando.tipo_logradouro = value.tipo_logradouro;
        periciando.complemento = value.complemento;
        periciando.data = value.data;
        periciando.hora = value.hora;
        periciando.local_provavel = value.local_provavel;
        periciando.causas_provavel = value.causas_provavel;
        periciando.uf2 = value.uf2;
        periciando.cep2 = value.cep2;
        periciando.municipio2 = value.municipio2;
        periciando.bairro2 = value.bairro2;
        periciando.tipo_logradouro2 = value.tipo_logradouro2;
        periciando.complemento2 = value.complemento2;
        periciando.mesmo_endereco_pericando = value.mesmo_endereco_pericando;
        periciando.mesmo_endereco_localfato = value.mesmo_endereco_localfato;
        periciando.exame_externo = value.exame_externo;
        periciando.tipo_local = value.tipo_local;
        periciando.descricao_local = value.descricao_local;
        periciando.estado_periciando = value.estado_periciando;
        periciando.data_nacimento = value.data_nacimento;
        periciando.dataexamen1 = value.Dataexamen1;
        periciando.horaexamen1 = value.Horaexamen1;
        periciando.dataexamen2 = value.Dataexamen2;
        periciando.horaexamen2 = value.Horaexamen2;
        periciando.acidente_trabalho = value.acidente_trabalho;
        periciando.quesitacoes = value.quesitacoes;
        periciando.numguia = value.numguia;
        periciando.numocur = value.numocur;
        periciando.rascunho = value.rascunho;

        periciando.descricao = 
          'CPF:' + periciando.cpf +
          ',Data Nacimento: ' + periciando.data_nacimento +
          ',Filiação:' + periciando.filiacao +
          ',SEXO:' + periciando.sexo +
          ',Matricula:' + periciando.matricula


        return periciando;
      });
      console.log('periciando', this.periciandos);
    });

  }

  async delete(codigo: string, value: string) {
    this.periciando.codigo = codigo;
    const alert = await this.alertController.create({
      header: 'Excluir',
      message: 'Você deseja apagar periciando com o codigo: <strong>' + codigo + '?</strong>!!!',
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
            this.CRUDPericiandos(PericiandosPage.CRUD_DELETE,);
          }
        }
      ]
    });

    await alert.present();
  }
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
  /* ------------------- END PERMISIONS USER -------------------------------------- */
  goBack() {
    this.router.navigate(['/menu/incluir-exame-medico', this.periciando.numguia]);
  }
  goObjetosPericia() {
    this.router.navigate(['/menu/objetos-pericia', this.periciando.numguia]);
  }
  goToGuia(){
    if(this.periciando.tipo_guia=='GM'){
      this.router.navigate(['/menu/incluir-exame-medico', this.periciando.numguia]);
    }
    if(this.periciando.tipo_guia=='GL'){
      this.router.navigate(['/menu/incluir-exame-laboratorial', this.periciando.numguia]);
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

  public showDescricao(texto, event) {
    event.target.textContent = texto;
  }

  public hiddeDescricao(texto, event) {
    event.target.textContent = texto;
  }
}
