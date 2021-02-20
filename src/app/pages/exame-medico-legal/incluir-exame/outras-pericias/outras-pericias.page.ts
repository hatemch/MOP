import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
//SERVICES
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { EnvService } from 'src/app/services/env.service';
//MODULES
import { OutrasPericias } from 'src/app/models/outra-pericia';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-outras-pericias',
  templateUrl: './outras-pericias.page.html',
  styleUrls: ['./outras-pericias.page.scss'],
})
export class OutrasPericiasPage implements OnInit {
  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static CRUD_DELETE: string = 'DELETE';

  private APP_NAME: string = this.env.AppName;

  private permissoes = {
    Route: '',
    Pesquisar: 1,
    Inserir: 1,
    Editar: 1,
    Deletar: 1
  };

  public arrayExames: Array<any> = [];
  public nomeGuia: string;
  public outraPericia = new OutrasPericias;
  public outrasPericias: Array<OutrasPericias> = [];

  constructor(
    private alertService: AlertService,
    private Authorizer: AuthService,
    private env: EnvService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController
  ) { }



  ngOnInit() {
    this.activatedRoute.params.subscribe(
      data => {
        //"data" carries all the parameters
        this.outraPericia.numguia = data.numguia;
        this.outraPericia.tipo_guia=data.tipoGuia;
        if (this.outraPericia.tipo_guia == 'GM') {
          this.nomeGuia = 'Guia Medica';
        }
        if (this.outraPericia.tipo_guia == 'GL') {
          this.nomeGuia = 'Guia Laboratorial';
        }
        if (this.outraPericia.numguia) {
          this.CRUDOutrasPericias(OutrasPericiasPage.CRUD_READ);
          //this.readExames()
        }
      });
  }

  goBack() {
    this.router.navigate(['/menu/incluir-exame-medico', this.outraPericia.numguia]);
  }
  goToGuia(){
    if(this.outraPericia.tipo_guia=='GM'){
      this.router.navigate(['/menu/incluir-exame-medico', this.outraPericia.numguia]);
    }
    if(this.outraPericia.tipo_guia=='GL'){
      this.router.navigate(['/menu/incluir-exame-laboratorial', this.outraPericia.numguia]);
    }
  }

  /* ======= CRUD OUTRAS PERICIAS ============================================================== */
  private CRUDOutrasPericias(_statusCRUD: any) {

    this.sendRequest('spOutrasPericias', {
      StatusCRUD: _statusCRUD,
      formValues: this.outraPericia
    }, (resultado) => {

      switch (_statusCRUD) {
        case OutrasPericiasPage.CRUD_READ:
          let results = JSON.parse(atob(resultado.results));
          this.outrasPericias = results.map(function callback(value) {
            let outraP = new OutrasPericias();
            outraP.codigo = value.codigo;
            outraP.tipo = value.tipo;
            outraP.nome_tipo = value.nome_tipo;
            outraP.descricao = value.descricao;
            outraP.nome_tipo_local = value.nome_tipo_local;
            outraP.numguia = value.numguia;
            outraP.tipo_local = value.tipo_local;
            outraP.nome_tipo_local = value.nome_tipo_local;
            outraP.examen_requisitado = value.Exames.split(/['<''>']/);
            outraP.nome_examen_requisitado = '';
            return outraP;
          });
          for (let index = 0; index < this.outrasPericias.length; index++) {
            for (var i = 0; i < this.outrasPericias[index].examen_requisitado.length; i++)
              if (this.outrasPericias[index].examen_requisitado[i] == 'div') {
                this.outrasPericias[index].nome_examen_requisitado = this.outrasPericias[index].nome_examen_requisitado + this.outrasPericias[index].examen_requisitado[i + 1] + ', '
              }
          }

          break;
        case OutrasPericiasPage.CRUD_DELETE:
          this.CRUDOutrasPericias(OutrasPericiasPage.CRUD_READ);
          break;
        default:
          break;
      }
    });
  }
  /* ======= END CRUD OUTRAS PERICIAS ============================================================== */

  readExames() {
    console.log('cod to read exames', this.outraPericia.codigo);
    this.sendRequest('spOutrasPericias', {
      StatusCRUD: 'READ_EXAM_ONE',
      formValues: { codigoOutrasPericias: this.outraPericia.codigo }
    }, (resultado) => {
      let results = JSON.parse(atob(resultado.results));
      this.arrayExames = results;
      console.log('read Exames:', results)
    });
  }

  EditOutraPericia(row: any) {
    console.log('info', row)
    this.router.navigate(['/menu/incluir-outras-pericias', this.outraPericia.numguia, row.codigo, '1', this.outraPericia.tipo_guia]);
  }

  incluirExamen(row: any) {
    this.router.navigate(['/menu/incluir-outras-pericias', this.outraPericia.numguia, row.codigo, '2', this.outraPericia.tipo_guia]);
  }

  public async alertDeletar(row: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar!',
      message: 'Você deseja apagar <strong>' + row.nome_tipo + '</strong>?',
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
            this.outraPericia.codigo = row.codigo;
            this.CRUDOutrasPericias(OutrasPericiasPage.CRUD_DELETE);
          }
        }
      ]
    });

    await alert.present();
    //this.CRUDOutrasPericias(LocalPericiaPage.CRUD_READ);

  }

  /* ======= SEND REQUEST ============================================================== */
  private sendRequest(
    procedure: string,
    params: { StatusCRUD: string; formValues: any; },
    next: any) {

    if (typeof this.Authorizer.HashKey !== 'undefined') {
      if (
        ((params.StatusCRUD === 'READ') && (this.permissoes.Pesquisar > 0))
        || ((params.StatusCRUD === 'DELETE') && (this.permissoes.Deletar > 0))
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
  /* ======= END SEND REQUEST ============================================================== */

}

/* 9L */
