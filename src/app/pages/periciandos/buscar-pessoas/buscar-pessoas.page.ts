import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-buscar-pessoas',
  templateUrl: './buscar-pessoas.page.html',
  styleUrls: ['./buscar-pessoas.page.scss'],
})
export class BuscarPessoasPage implements OnInit {

  public pessoas: any[];
  public formPesquisaPessoas = {
    nome: '',
    cpf: '',
    filiacao: '',
    matricula: '',
    data_nacimento: ''
  }

  constructor(
    private modalCtrl: ModalController,
    private Authorizer: AuthService,
  ) { }

  ngOnInit() {
  }

  buscar() {
    // Este metodo deve ser alterado, nao deveria procurar condutores.
    const params = new FormData();

    params.append('cpf', this.Authorizer.encripta(this.formPesquisaPessoas.cpf));

    this.Authorizer.QueryOnline('ConsultaCondutor', params).then(resultado => {
      console.log(resultado);
      if (Array.isArray(resultado)) {
        this.pessoas = resultado;
      }
    });
  }

  seleccionarPessoa(pessoa: any) {
    this.modalCtrl.dismiss(pessoa);
  }
}
