import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ModalController, IonButton, IonInput } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { environment } from 'src/environments/environment.prod';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-buscar-ocorrencia',
  templateUrl: './buscar-ocorrencia.page.html',
  styleUrls: ['./buscar-ocorrencia.page.scss'],
})
export class BuscarOcorrenciaPage implements OnInit {

  public modelPesquisa = {
    Usuario: '',
    Tipo: 'PC',
    Numero: '',
    NumeroUnidade: '',
    NumeroTipo: '',
    NumeroAno: '',
    NumeroSequencial: '',
    PessoaEnvolvida: '',
    DataRegistroInicio: '',
    DataRegistroFim: '',
    DataFatoInicio: '',
    DataFatoFim: ''
  }

  public unidades = [];
  public Pessoas = [];

  public form: FormGroup;

  @ViewChild(IonButton, { static: true }) btnBuscar: IonButton;
  @ViewChild(IonInput, { static: true }) inputDataRegistroFim: IonInput;

  constructor(
    private modalCtrl: ModalController,
    private Authorizer: AuthService,
    private alertService: AlertService,
    private fb: FormBuilder,
  ) {
    this.buildForm();
  }

  ngOnInit() {
    this.getUnidades();
  }

  public goBack() {
    this.modalCtrl.dismiss();
  }

  private getUnidades() {
    const params = new FormData();

    this.Authorizer.QueryOnline('ConsultaUnidadesSigip', params).then(res => {
      if (Array.isArray(res)) {
        this.unidades = res;
      }
    });
  }

  public importarPessoas(ocorrencia) {
    this.modalCtrl.dismiss(ocorrencia);
  }

  public BuscarPessoa() {
    this.btnBuscar.disabled = true;

    this.modelPesquisa.Usuario = this.Authorizer.CodigoUsuarioSistema;
    const params = new FormData();

    if (this.modelPesquisa.NumeroUnidade == null) {
      this.modelPesquisa.NumeroUnidade = '';
    }

    // tslint:disable-next-line: forin
    for (const key in this.modelPesquisa) {
      // params.append(key, this.Authorizer.encripta(this.modelPesquisa[key]));
      params.append(key, this.modelPesquisa[key]);
    }

    this.Authorizer.QueryOnline('ConsultarOcorrenciasSIGIP', params).then(res => {
      console.log(res)
      if (Array.isArray(res)) {
        this.Pessoas = res;
        this.btnBuscar.disabled = false;
      } else {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: environment.AppName, pMessage: res['error']['message'] });
        console.log('resultado.error.StackTrace: ', res['error']['StackTrace']);
        this.btnBuscar.disabled = false;
      }
    });
  }

  public buildForm() {
    this.form = this.fb.group({
      Tipo: [{ value: 'PC', disabled: true }],
      NumeroUnidade: [''],
      NumeroTipo: [''],
      NumeroAno: [''],
      NumeroSequencial: [''],
      DataRegistroInicio: [''],
      DataRegistroFim: [''],
      DataFatoInicio: [''],
      DataFatoFim: [''],
      PessoaEnvolvida: ['']
    });




    /* Obrigatorio: unidade, ano e numero
      Ou
      Data início e fim de registro
      Ou 
      data início e fim de fato
      Um dos três conjuntos
    */
    // ================= Validacao do conjunto 1
    this.form.get('NumeroUnidade')
      .valueChanges
      .subscribe(value => {
        if (value == null) {
          this.form.get('NumeroAno').clearValidators();
          this.form.get('NumeroSequencial').clearValidators();

        } else {
          const validators = [Validators.required];
          this.form.get('NumeroAno').setValidators(validators);
          this.form.get('NumeroSequencial').setValidators(validators);
        }

        // Atualizando as validacoes
        this.form.get('NumeroAno').updateValueAndValidity({ emitEvent: false });
        this.form.get('NumeroSequencial').updateValueAndValidity({ emitEvent: false });
      });

    // ================ validacao do conjunto 2
    this.form.get('DataRegistroInicio')
      .valueChanges
      .subscribe(value => {
        console.log(value);
        if (value !== '') {
          this.form.get('DataRegistroFim').setValidators([Validators.required]);

        } else {
          this.form.get('DataRegistroFim').clearValidators();

        }

        // Atualizando as validacoes
        this.form.get('DataRegistroFim').updateValueAndValidity({ emitEvent: false });
      });

    // ===================== validacao do conjunto 3
    this.form.get('DataFatoInicio')
      .valueChanges
      .subscribe(value => {
        console.log(value);
        if (value !== '') {
          this.form.get('DataFatoFim').setValidators([Validators.required]);

        } else {
          this.form.get('DataFatoFim').clearValidators();

        }

        // atualizando
        this.form.get('DataFatoFim').updateValueAndValidity({ emitEvent: false });
      });
  }

}
