import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { MenuPage } from './menu.page';
//import { Clipboard } from '@ionic-native/clipboard';

const routes: Routes = [
  {
    path: '',
    component: MenuPage,
    children: [
      {
        path: 'options',
        loadChildren: '../menuoptions/menuoptions.module#OptionsPageModule'
      },
      {
        path: 'minhaconta',
        loadChildren: '../minhaconta/minhaconta.module#MinhaContaPageModule'
      },
      {
        path: 'consultainfracao',
        loadChildren: '../consultainfracao/consultainfracao.module#ConsultaInfracaoPageModule'
      },

      {
        path: 'cadastro-user',
        loadChildren: '../users/cadastro-user/cadastro-user.module#CadastroUserPageModule'
      },
      {
        path: 'cadastro-user/:codigo',
        loadChildren: '../users/cadastro-user/cadastro-user.module#CadastroUserPageModule'
      },

      {
        path: 'users',
        loadChildren: '../users/users.module#UsersPageModule'
      },

      {
        path: 'consulta-ocorrencias',
        loadChildren: '../consulta-ocorrencias/consulta-ocorrencias.module#ConsultaOcorrenciasPageModule'
      },

      {
        path: 'alertas',
        loadChildren: '../alertas/alertas.module#AlertasPageModule'
      },

      {
        path: 'perfis',
        loadChildren: '../perfis/perfis.module#PerfisPageModule'
      },
      {
        path: 'add-perfis',
        loadChildren: '../perfis/add-perfis/add-perfis.module#AddPerfisPageModule'
      },
      {
        path: 'add-perfis/:codigo',
        loadChildren: '../perfis/add-perfis/add-perfis.module#AddPerfisPageModule'
      },

      { path: 'Rastreabilidade', loadChildren: '../rastreabilidade/rastreabilidade.module#RastreabilidadePageModule' },


      {
        path: 'cargos',
        loadChildren: '../cargos/cargos.module#CargosPageModule'
      },
      {
        path: 'add-cargo/:codigo',
        loadChildren: '../cargos/add-cargo/add-cargo.module#AddCargoPageModule'
      },
      {
        path: 'add-cargo',
        loadChildren: '../cargos/add-cargo/add-cargo.module#AddCargoPageModule'
      },

      {
        path: 'modulos',
        loadChildren: '../modulos/modulos.module#ModulosPageModule'
      },
      {
        path: 'localizacao',
        loadChildren: '../localizacao/localizacao.module#LocalizacaoPageModule'
      },
      {
        path: 'consultasgeo',
        loadChildren: '../consultasgeo/consultasgeo.module#ConsultasgeoPageModule'
      },
      {
        path: 'consulta-online-conductores',
        loadChildren: '../consulta-online-conductores/consulta-online-conductores.module#ConsultaOnlineConductoresPageModule'
      },
      {
        path: 'consulta-lista',
        loadChildren: '../consulta-lista/consulta-lista.module#ConsultaListaPageModule'
      },


      {
        path: 'modif-bairros/:codigo',
        loadChildren: '../bairros/modif-bairros/modif-bairros.module#ModifBairrosPageModule'
      },
      {
        path: 'modif-bairros',
        loadChildren: '../bairros/modif-bairros/modif-bairros.module#ModifBairrosPageModule'
      },
      {
        path: 'bairros',
        loadChildren: '../bairros/bairros.module#BairrosPageModule'
      },

      {
        path: 'user-detran',
        loadChildren: '../user-detran/user-detran.module#UserDetranPageModule'
      },
      {
        path: 'add-user-detran',
        loadChildren: '../user-detran/add-user-detran/add-user-detran.module#AddUserDetranPageModule'
      },
      { path: 'grupos', loadChildren: '../grupos/grupos.module#GruposPageModule' },
      { path: 'add-grupo', loadChildren: '../grupos/add-grupo/add-grupo.module#AddGrupoPageModule' },
      { path: 'add-grupo/:codigo', loadChildren: '../grupos/add-grupo/add-grupo.module#AddGrupoPageModule' },
      { path: 'Usuarios-pre', loadChildren: '../usuarios-pre/usuarios-pre.module#UsuariosPrePageModule' },
      { path: 'gestaodoaparelhos', loadChildren: '../gestaodoaparelhos/gestaodoaparelhos.module#GestaodoaparelhosPageModule' },



      {
        path: 'municipios-enderecos',
        loadChildren: '../municipios-enderecos/municipios-enderecos.module#MunicipiosEnderecosPageModule'
      },
      {
        path: 'add-municipio-endereco',
        loadChildren: '../municipios-enderecos/add-municipio-endereco/add-municipio-endereco.module#AddMunicipioEnderecoPageModule'
      },
      {
        path: 'add-municipio-endereco/:cidade',
        loadChildren: '../municipios-enderecos/add-municipio-endereco/add-municipio-endereco.module#AddMunicipioEnderecoPageModule'
      },


      // { path: 'bairros',
      //   loadChildren: '../bairros/bairros.module#BairrosPageModule' }


      { path: 'modif-bairros/:codigo', loadChildren: '../bairros/modif-bairros/modif-bairros.module#ModifBairrosPageModule' },
      { path: 'modif-bairros', loadChildren: '../bairros/modif-bairros/modif-bairros.module#ModifBairrosPageModule' },
      { path: 'bairros', loadChildren: '../bairros/bairros.module#BairrosPageModule' },

      { path: 'cartao', loadChildren: '../cartao/cartao.module#CartaoPageModule' },
      { path: 'add-cartao', loadChildren: '../cartao/add-cartao/add-cartao.module#AddCartaoPageModule' },
      { path: 'add-cartao/:codigo', loadChildren: '../cartao/add-cartao/add-cartao.module#AddCartaoPageModule' },


      { path: 'permissoes', loadChildren: '../permissoes/permissoes.module#PermissoesPageModule' },
      {
        path: 'relatorio-ocorrencia-natureza',
        loadChildren: '../relatorio-ocorrencia-natureza/relatorio-ocorrencia-natureza.module#RelatorioOcorrenciaNaturezaPageModule'
      },

      { path: 'adm-devices', loadChildren: '../adm-devices/adm-devices.module#AdmDevicesPageModule' },
      { path: 'cadastro-adm-devices/:codigo', loadChildren: '../adm-devices/cadastro-adm-devices/cadastro-adm-devices.module#CadastroAdmDevicesPageModule' },
      { path: 'cadastro-adm-devices', loadChildren: '../adm-devices/cadastro-adm-devices/cadastro-adm-devices.module#CadastroAdmDevicesPageModule' },
      { path: 'add-alerta', loadChildren: '../alertas/add-alerta/add-alerta.module#AddAlertaPageModule' },
      {
        path: 'uso',
        loadChildren: '../uso/uso.module#UsoPageModule'
      },
      {
        path: 'cadastro-user',
        loadChildren: '../users/cadastro-user/cadastro-user.module#CadastroUserPageModule'
      },
      {
        path: 'fotos',
        loadChildren: '../fotos/fotos.module#FotosPageModule'
      },
      {
        path: 'antecedentes',
        loadChildren: '../antecedentes/antecedentes.module#AntecedentesPageModule'
      },
      {
        path: 'veiculos',
        loadChildren: '../veiculos/veiculos.module#VeiculosPageModule'
      },

      {
        path: 'reenvio-infracoes',
        loadChildren: '../reenvio-infracoes/reenvio-infracoes.module#ReenvioInfracoesPageModule'
      },
      {
        path: 'exame-medico-legal',
        loadChildren: '../exame-medico-legal/exame-medico-legal.module#ExameMedicoLegalPageModule'
      },
      {
        path: 'exame-laboratorial-legal',
        loadChildren: '../exame-laboratorial-legal/exame-laboratorial-legal.module#ExameLaboratorialLegalPageModule'
      },
     
      {
        path: 'incluir-exame-laboratorial',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/incluir-exame-laboratorial.module#IncluirExameLaboratorialPageModule'
      },
      {
        path: 'incluir-exame-laboratorial/:codigo',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/incluir-exame-laboratorial.module#IncluirExameLaboratorialPageModule'
      },
     
      {
        path: 'periciandos',
        loadChildren: '../periciandos/periciandos.module#PericiandosPageModule'
      },
      {
        path: 'periciandos/:codigo/:tipoGuia',
        loadChildren: '../periciandos/periciandos.module#PericiandosPageModule'
      },
      {
        path: 'incluir-periciando',
        loadChildren: '../periciandos/incluir-periciando/incluir-periciando.module#IncluirPericiandoPageModule'
      },
      {
        path: 'incluir-periciando/:codigoGuia/:tipoGuia',
        loadChildren: '../periciandos/incluir-periciando/incluir-periciando.module#IncluirPericiandoPageModule'
      },
      {
        path: 'incluir-periciando/:codigoGuia/:codigoPericiando/:tipoGuia',
        loadChildren: '../periciandos/incluir-periciando/incluir-periciando.module#IncluirPericiandoPageModule'
      },

      {
        path: 'incluir-exame',
        loadChildren: '../exame-medico-legal/incluir-exame/incluir-exame.module#IncluirExamePageModule'
      },

      {
        path: 'tabs',
        loadChildren: '../tabs/tabs.module#TabsPageModule'
      },

      {
        path: 'detalhes/:numguia/:tipoGuia',
        loadChildren: '../exame-medico-legal/incluir-exame/detalhes/detalhes.module#DetalhesPageModule'
      },
      {
        path: 'local-pericia/:numguia/:tipoGuia',
        loadChildren: '../exame-medico-legal/incluir-exame/local-pericia/local-pericia.module#LocalPericiaPageModule'
      },
      {
        path: 'periciandos',
        loadChildren: '../periciandos/periciandos.module#PericiandosPageModule'
      },
      {
        path: 'periciandos/:codigo',
        loadChildren: '../periciandos/periciandos.module#PericiandosPageModule'
      },
      {
        path: 'incluir-periciando',
        loadChildren: '../periciandos/incluir-periciando/incluir-periciando.module#IncluirPericiandoPageModule'
      },
      {
        path: 'incluir-periciando/:codigoGuia/:codigoPericiando',
        loadChildren: '../periciandos/incluir-periciando/incluir-periciando.module#IncluirPericiandoPageModule'
      },
      {
        path: 'incluir-exame-medico',
        loadChildren: '../exame-medico-legal/incluir-exame/incluir-exame.module#IncluirExamePageModule'
      },
      {
        path: 'incluir-exame-medico/:codigo',
        loadChildren: '../exame-medico-legal/incluir-exame/incluir-exame.module#IncluirExamePageModule'
      },
      {
        path: 'buscar-guia-perica/:codigo/:tipoGuia',
        loadChildren: '../buscar-guia-perica/buscar-guia-perica.module#BuscarGuiaPericaPageModule'
      },
      {
        path: 'buscar-guia-perica',
        loadChildren: '../buscar-guia-perica/buscar-guia-perica.module#BuscarGuiaPericaPageModule'
      },
      {
        path: 'outras-pericias/:numguia/:tipoGuia',
        loadChildren: '../exame-medico-legal/incluir-exame/outras-pericias/outras-pericias.module#OutrasPericiasPageModule'
      },
      {
        path: 'incluir-outras-pericias/:numguia/:tipoGuia',
        loadChildren: '../exame-medico-legal/incluir-exame/outras-pericias/incluir-outras-pericias/incluir-outras-pericias.module#IncluirOutrasPericiasPageModule'
      },
      {
        path: 'incluir-outras-pericias/:numguia/:codigo/:opcao/:tipoGuia',
        loadChildren: '../exame-medico-legal/incluir-exame/outras-pericias/incluir-outras-pericias/incluir-outras-pericias.module#IncluirOutrasPericiasPageModule'
      },
      {
        path: 'objetos-pericia/:codigo',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/objetos-pericia.module#ObjetosPericiaPageModule'
      },
      {
        path: 'veiculo/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/veiculo/veiculo.module#VeiculoPageModule'
      },
      {
        path: 'veiculo/:codigoVeiculo/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/veiculo/veiculo.module#VeiculoPageModule'
      },

      {
        path: 'outros/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/outros/outros.module#OutrosPageModule'
      },
      {
        path: 'outros/:codigoOutros/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/outros/outros.module#OutrosPageModule'
      },
      {
        path: 'drogas/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/drogas/drogas.module#DrogasPageModule'
      },
      {
        path: 'drogas/:codigoDroga/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/drogas/drogas.module#DrogasPageModule'
      },
      {
        path: 'arma/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/arma/arma.module#ArmaPageModule'
      },
      {
        path: 'arma/:codigoArma/:codigoGuia',
        loadChildren: '../exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/arma/arma.module#ArmaPageModule'
      },
      {
        path: 'guia-pericia-digital',
        loadChildren: '../guia-pericia-digital/guia-pericia-digital.module#GuiaPericiaDigitalPageModule'
      },


    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    //[Clipboard]

  ],
  declarations: [MenuPage]
})
export class MenuPageModule { }