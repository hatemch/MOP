import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { EnvService } from 'src/app/services/env.service';
import { environment } from "../../../../environments/environment.prod";

import { Cargo } from "../../../models/cargo";
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-add-cargo',
  templateUrl: './add-cargo.page.html',
  styleUrls: ['./add-cargo.page.scss'],
})
export class AddCargoPage implements OnInit {

  static CRUD_READ: string = 'READ';
  static CRUD_CREATE: string = 'CREATE';
  static CRUD_UPDATE: string = 'UPDATE';

  private APP_NAME: string = this.env.AppName;

  public cargo = new Cargo();

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
        this.cargo.codigo = data.codigo;

        if (this.cargo.codigo) {
          this.CRUDCargos(AddCargoPage.CRUD_READ, { 'codigo': this.cargo.codigo });
        }

      });
  }

  save(form: NgForm) {
    if (this.cargo.codigo) {
      //ADD CODIGO TO UPDATE 
      console.log('cargo', this.cargo.codigo);
      form.value.codigo = this.cargo.codigo;
      this.CRUDCargos(AddCargoPage.CRUD_UPDATE, form.value);
      
    }
    else {
      console.log('cargo new', this.cargo.codigo);
      this.CRUDCargos(AddCargoPage.CRUD_CREATE, form.value);
    }

  }

  private CRUDCargos(_statusCRUD, _formValues) {
    this.sendRequest('spCargos', {
      StatusCRUD: _statusCRUD,
      formValues: _formValues
    }, (resultado) => {

      switch (_statusCRUD) {
        case AddCargoPage.CRUD_CREATE:
          this.router.navigate(['/menu/cargos']);
          break;
        case AddCargoPage.CRUD_READ:
          this.cargo.cargo = JSON.parse(atob(resultado.results))[0].CARGO;
          break;
        case AddCargoPage.CRUD_UPDATE:
          this.router.navigate(['/menu/cargos']);
          break;

        default:
          break;
      }


    });
  }

  goBack() {
    this.router.navigate(['/menu/cargos']);
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
  }

}
