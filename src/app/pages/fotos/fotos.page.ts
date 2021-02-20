import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

//MODEL
import { Foto } from "../../models/foto";

//SERVICES
import { ValidationsService } from "../../services/validations.service";
import { AlertService } from '../../services/alert.service';
import { EnvService } from '../../services/env.service';
import { AuthService } from '../../services/auth.service';

import { GalleryPage } from '../gallery/gallery.page';

@Component({
  selector: 'app-fotos',
  templateUrl: './fotos.page.html',
  styleUrls: ['./fotos.page.scss'],
})
export class FotosPage implements OnInit {

  private APP_NAME: string = this.env.AppName;

  public foto = new Foto();
  public fotos: Array<Foto> = [];

  public columns = [{ text: 'ID', bold: true },
  { text: 'Mãe', bold: true },
  { text: 'Pai', bold: true },
  { text: 'Nascimento', bold: true },
  { text: 'Nome', bold: true },
  { text: 'Vulgo', bold: true },
  { text: 'RG', bold: true },
  { text: 'CPF', bold: true },
    // { text: 'Bairro ID', bold: true },
    // { text: 'Atuacao ID', bold: true },
  ];

  public permissoes = {
    Route: '',
    Pesquisar: 0,
    Inserir: 0,
    Editar: 0,
    Deletar: 0
  }; // Permissoes do modulo para o usuario logado

  constructor(private alertService: AlertService,
    private env: EnvService,
    private Authorizer: AuthService,
    private router: Router,
    private alertController: AlertController,
    private validations: ValidationsService,
    private modalController: ModalController,
  ) { }

  ngOnInit() {
    this.getPermissoesModulo();
  }

  goBack() {
    this.router.navigate(['/menu/options/tabs/main/95']);
  }

  public search(form: NgForm) {

    // Validate all the fields
    if (!form.value.rg && !form.value.cpf && !form.value.nome && !form.value.vulgo
      && !form.value.mae && !form.value.bairro && !form.value.area
    ) {
      this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Preencha ao menos um campo' });
      return;
    }

    // Validate RF
    if (form.value.rg) {
      if (!this.validations.validateRG(form.value.rg)) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'RG inválido' });
        return;
      }
    }

    // Validate CPF
    if (form.value.cpf) {
      form.value.cpf = this.validations.convertCPFtoNumber(form.value.cpf);
      if (form.value.cpf.length < 11) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'CPF inválido' });
        return;
      }
    }

    // Validate NOME
    if (form.value.nome) {
      if (form.value.nome.length < 5) {
        this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Nome deve ter mínimo 5 caracteres.' });
        return;
      }
    }


    const params = new FormData();

    params.append('rg', this.Authorizer.encripta(this.foto.rg));
    params.append('cpf', this.Authorizer.encripta(this.foto.cpf));
    params.append('nome', this.Authorizer.encripta(this.foto.nome));
    params.append('vulgo', this.Authorizer.encripta(this.foto.vulgo));
    params.append('mae', this.Authorizer.encripta(this.foto.mae));
    params.append('bairro', this.Authorizer.encripta(this.foto.bairro));
    params.append('area', this.Authorizer.encripta(this.foto.area));

    this.sendRequestOnline('ConsultaFotos',params
      , (resultado) => {

        //console.log('resultado.results:', resultado);

        this.fotos = resultado.map(function callback(value) {
          let foto = new Foto();
          foto.id = value.id;
          foto.mae = value.mae;
          foto.pai = value.pai;
          if(value.nascimento)
          {
            // foto.nascimento = value.nascimento.substring(0,10);
            foto.nascimento = value.nascimento.substring(8,10)  + '/' +
                              value.nascimento.substring(5,7)  + '/' +
                              value.nascimento.substring(0,4);
          }
          
          foto.nome = value.nome;
          foto.vulgo = value.vulgo;
          foto.rg = value.rg;
          foto.cpf = value.cpf;
          foto.bairro_id = value.bairro_id;
          foto.atuacao_id = value.atuacao_id;
          foto.logradouro = value.logradouro;

          return foto;
        });

        if (this.fotos.length == 0) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem dados a mostrar' });
        }

       // console.log('this.fotos:', this.fotos);

      });
  }

  //NEEDE FUNCTIONS
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

  showPicture(id){
    const params = new FormData();

   // params.append('id',id);
    params.append('id', this.Authorizer.encripta(this.Authorizer.encripta(id.toString()))); //Coment by Viviana Because in the webservice they dont decripted so, thats why was not showing the correct foto

    this.sendRequestOnline('ConsultaIndividuoFotos',params
      , (resultado) => {

       // console.log('resultado.results:', resultado);

        if (!resultado) {
          this.alertService.presentAlert({ pTitle: 'ATENÇÃO', pSubtitle: this.APP_NAME, pMessage: 'Sem imagens a mostrar' });
          return;
        }

        this.modalController.create({
          component: GalleryPage,
          componentProps: {
            fotos: resultado,

         }
        }).then(modal => modal.present());

      });

  }

  /* ==================== CPF MASK ====================== */
  formatCPF(valString: any, idComponent: any) {
    this.validations.formatCPF(valString, idComponent)
  }


}
