import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
import { Router } from '@angular/router';
import { Chart } from 'chart.js';
import { NgForm } from '@angular/forms';
import { IonicSelectableComponent } from 'ionic-selectable';
import { Segmento } from 'src/app/models/segmento';
import { Grupo } from "src/app/models/grupo";
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-relatorio-ocorrencia-natureza',
  templateUrl: './relatorio-ocorrencia-natureza.page.html',
  styleUrls: ['./relatorio-ocorrencia-natureza.page.scss'],
})
export class RelatorioOcorrenciaNaturezaPage implements OnInit {

  private chart: any;
  public DataInicialFormatada: string;
  public DataFinalFormatada: string;
  public subtitle = 'Relatório Ocorrências por Natureza';
  public collection: any[] = [];
  public segmento = new Segmento();
  public segmentos: Array<Segmento> = [];
  public grupos: Array<Grupo> = [];
  private grupoTEMP: string = "";
  public user = new User();
  public modelPesquisa = {
    data1: '',
    data2: '',
    segmento: '',
    grupo: '0',
    tipo: 'T'
  };
  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  public columns = [
    { text: 'Nome', bold: true },
    { text: 'Quantidade de consultas', bold: true },
  ];

  private cores = [];

  private coresBorde = [
    'rgba(26, 188, 156, 1)'
    , 'rgba(241, 196, 15, 1)'
    , 'rgba(46, 204, 113, 1)'
    , 'rgba(230, 126, 34, 1)'
    , 'rgba(52, 152, 219, 1)'
    , 'rgba(231, 76, 60, 1)'
    , 'rgba(155, 89, 182, 1)'
    , 'rgba(22, 160, 133, 1)'
    , 'rgba(243, 156, 18, 1)'
    , 'rgba(39, 174, 96, 1)'
    , 'rgba(41, 128, 185, 1)'
    , 'rgba(192, 57, 43, 1)'
  ];
  collectionSegmentos: Segmento[] = [];
  collectionGrupos: any;

  constructor(
    private navCtrl: NavController,
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private renderer: Renderer2
  ) { }

  @ViewChild('canvasChart', { static: true }) canvasChart: ElementRef;

  private criarChart() {
    let arrLabels: any[] = [];
    let arrData1: any[] = [];

    this.cores = [];

    this.collection.forEach(element => {
      // arrLabels.push(element.nome + ' ' + element.tipo);
      arrLabels.push(element.nome);
      arrData1.push(element.total);
      let cor = this.random_rgba();
      this.cores.push(cor);
    });

    if (typeof this.chart !== 'undefined') {
      this.chart.destroy();
    }
    this.chart = new Chart(this.canvasChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: arrLabels,
        datasets: [{
          label: 'Quantidad de consultas',
          data: arrData1,
          backgroundColor: this.cores, // array should have same number of elements as number of dataset
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          align: 'start',
          labels: {
            boxWidth: 20,
            padding: 5
          }
        },
        /*tooltips: {
          callbacks: {
            label: tooltipItem => `${tooltipItem.yLabel}: ${tooltipItem.xLabel}`,
            title: () => null,
          }
        }*/
        /*scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }],
          xAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }*/
      }
    });
  }

  private function
  ngOnInit() {
    this.getPermissoesModulo();
    this.getSegmentos();
    this.user.perfil = localStorage.getItem('perfilUsuario').trim();
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.modelPesquisa.segmento = localStorage.getItem('orgaoUsuario').trim();
      this.CarregaSegmentoGrupos()

    }
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
        (this.permissoes.Pesquisar > 0)
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
              this.alertService.showLoader(resultado.message, 1000);
            } else {
              this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.subtitle, pMessage: resultado.message });
              this.navCtrl.back();
            }
          } catch (err) {
            this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.subtitle, pMessage: 'Erro ao fazer a petição' });
          }
        });
      } else {
        this.alertService.presentAlert({
          pTitle: 'SEM PERMISSÃO', pSubtitle: this.subtitle, pMessage: 'Você não tem permissão para esta ação'
        });
      }
    } else {
      this.goBack();
    }
  }

  // Usado quando nao usa o parametro formValues
  // Alem disso quando nao precisa de permissoes
  private sendRequest2(
    procedure: string,
    params: any,
    next: any) {


    let _params = params
    _params.CodigoUsuarioSistema = this.Authorizer.CodigoUsuarioSistema, // Por defeito sempre está este valor
      _params.Hashkey = this.Authorizer.HashKey // Por defeito sempre está este valor
    if (typeof this.Authorizer.HashKey !== 'undefined') {
      this.Authorizer.QueryStoreProc('Executar', procedure, _params).then(res => {
        const resultado: any = res[0];
        try {
          if (resultado.success) {
            next(resultado);
            this.alertService.showLoader(resultado.message, 1000);
          } else {
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.subtitle, pMessage: resultado.message });
            this.navCtrl.back();
          }
        } catch (err) {
          this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.subtitle, pMessage: 'Erro ao fazer a petição' });
        }
      });
    }
  }


  read(form: NgForm) {
    this.collection = [];
    if (this.modelPesquisa.grupo == null || this.modelPesquisa.grupo == undefined) {
      this.modelPesquisa.grupo = '';
    }
    // this.DataInicialFormatada = this.formatarData(this.modelPesquisa.data1);
    // this.DataFinalFormatada = this.formatarData(this.modelPesquisa.data2);
    // Obtendo a informação do banco de dados
    const params = {
      StatusCRUD: this.modelPesquisa.tipo,
      formValues: this.modelPesquisa
    };

    this.sendRequest('spOcorrenciasPorNatureza', params, (resultado) => {
      this.collection = JSON.parse(atob(resultado.results));
      if (this.collection.length > 0) {
        this.criarChart();
      } else {
        this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: this.subtitle, pMessage: 'Sem dados para mostrar' });
      }

    });
  }

  goBack() {
    this.navCtrl.back();
  }

  public submitFiltrar(form: NgForm) {
    const dados = form.value;
  }


  public formatarData(strDataHora) {
    let strData: string;
    const data = new Date(strDataHora);
    if (data.toDateString() !== 'Invalid Date') {
      const mes: string = (data.getMonth() + 1).toString().padStart(2, '0');
      const dia: string = (data.getDate()).toString().padStart(2, '0');

      strData = `${dia}/${mes}/${data.getFullYear()}`;
    } else {
      strData = strDataHora;
    }
    return strData;
  }

  CarragaSegmentos() {
    // Obtendo a informação do banco de dados
    const params = {
      StatusCRUD: '',
    };

    this.sendRequest2('spCarregaSegmentos', params, (resultado) => {
      // this.collectionSegmentos = JSON.parse(atob(resultado.results));

      this.collectionSegmentos = JSON.parse(atob(resultado.results)).map(function callback(value) {
        let segmento = new Segmento();
        segmento.codigo = value.SEGMENTO;
        segmento.segmento = value.SEGMENTO;

        return segmento;
      });

      if (this.collectionSegmentos.length > 0)
        this.modelPesquisa.segmento = this.collectionSegmentos[0].segmento;
    });

  }

  public changeSelectSegmento(event) {
    this.modelPesquisa.segmento = event.target.value;
    // this.modelPesquisa.grupo = 0;

    const params = {
      Segmento: event.target.value
    };

    this.sendRequest2('spCarregaSegmentoGrupos', params, (resultado) => {
      this.collectionGrupos = JSON.parse(atob(resultado.results));
    });
  }

  public changeSelect(modelAttr, e, model = null) {
    this[model][modelAttr] = e.target.value;
  }

  public random_rgba() {
    let o = Math.round, r = Math.random, s = 255;
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
  }

  clearCollection() {
    console.log('hello');
    this.collection = [];
  }
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
      }
    );
  }
  CarregaSegmentoGrupos() {


    this.consultarGruposSegmento(this.modelPesquisa.segmento);
  }
  private consultarGruposSegmento(segmento: string) {
    this.modelPesquisa.grupo = "";
    if (this.user.perfil == 'SUPERVISOR DE UNIDADE') {
      this.modelPesquisa.grupo = localStorage.getItem('codigoUnidade');
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
        if (this.modelPesquisa.grupo) {
          this.grupos[0].codigo = this.modelPesquisa.grupo
          this.grupos[0].nome = this.user.nomegrupo;
         
          console.log('grupos', this.grupos);
          return;
        }
        //

          this.modelPesquisa.grupo = this.grupoTEMP;
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
}
