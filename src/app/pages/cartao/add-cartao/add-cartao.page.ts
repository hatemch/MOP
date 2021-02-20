import { Component, OnInit } from '@angular/core';
import { EnvService } from 'src/app/services/env.service';
import { Cartao } from 'src/app/models/cartao';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-cartao',
  templateUrl: './add-cartao.page.html',
  styleUrls: ['./add-cartao.page.scss'],
})
export class AddCartaoPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';
  static APP_NAME: string = EnvService.name;

  public cartao = new Cartao();
  public title = "";

  constructor(
    private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    // Getting data from another page
    this.activatedRoute.params.subscribe(
      data => {

        //"data" carries all the parameters
        this.cartao.codigo = data.codigo;

        if (this.cartao.codigo) {
          this.title = 'Editar';
          this.CRUDCartaos(AddCartaoPage.CRUD_READ, { 'codigo': this.cartao.codigo });
        }
        else {
          this.title = 'Novo';
        }

      });
  }

  save(form: NgForm) {
    if (this.cartao.codigo) {
      //ADD CODIGO TO UPDATE 
      form.value.codigo = this.cartao.codigo;
      this.CRUDCartaos(AddCartaoPage.CRUD_UPDATE, form.value);
    }
    else {
      form.value.usuario = this.Authorizer.CodigoUsuarioSistema;
      let dateOfRegistre = new Date();
      form.value.date = dateOfRegistre;
      this.CRUDCartaos(AddCartaoPage.CRUD_CREATE, form.value);
    }

  }

  private CRUDCartaos(_statusCRUD, _formValues) {
    this.sendRequest('spCartaos', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case AddCartaoPage.CRUD_CREATE:
          this.router.navigate(['/menu/cartao']);
          break;
        case AddCartaoPage.CRUD_READ:
          this.cartao.cartao = JSON.parse(atob(resultado.results))[0].cartao;
          this.cartao.cerca = JSON.parse(atob(resultado.results))[0].cerca;
          break;
        case AddCartaoPage.CRUD_UPDATE:
          this.router.navigate(['/menu/cartao']);
          break;

        default:
          break;
      }


    });
  }

  goBack() {
    this.router.navigate(['/menu/cartao']);
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
            this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: AddCartaoPage.APP_NAME, pMessage: resultado.message });
          }
        } catch (err) {
          this.alertService.presentAlert({ pTitle: this.env.AppNameSigla, pSubtitle: AddCartaoPage.APP_NAME, pMessage: 'Erro ao fazer a petição' });
        }
      });
    } else {
      this.alertService.presentAlert({
        pTitle: 'SEM PERMISSÃO', pSubtitle: AddCartaoPage.APP_NAME, pMessage: 'Você não tem permissão para esta ação'
      });
    }
  }

}
