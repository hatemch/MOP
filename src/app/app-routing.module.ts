
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
 
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'trocosenha', loadChildren: './pages/trocosenha/trocosenha.module#TrocosenhaPageModule' },
  { path: 'menu', loadChildren: './pages/menu/menu.module#MenuPageModule' },    
  { path: 'register', loadChildren: './pages/register/register.module#RegisterPageModule' },  
  { path: 'recuperasenha', loadChildren: './pages/recuperasenha/recuperasenha.module#RecuperasenhaPageModule' },
  { path: 'devices', loadChildren: './pages/devices/devices.module#DevicesPageModule' },
  { path: 'consultainfracao', loadChildren: './pages/consultainfracao/consultainfracao.module#ConsultaInfracaoPageModule' },
  { path: 'splash', loadChildren: './pages/splash/splash.module#SplashPageModule' },  
  { path: 'adm-devices', loadChildren: './pages/adm-devices/adm-devices.module#AdmDevicesPageModule' },
  { path: 'cadastro-adm-devices', loadChildren: './pages/adm-devices/cadastro-adm-devices/cadastro-adm-devices.module#CadastroAdmDevicesPageModule' },

  { path: 'rastreabilidade', loadChildren: './pages/rastreabilidade/rastreabilidade.module#RastreabilidadePageModule' },
  { path: 'usuarios-pre', loadChildren: './pages/usuarios-pre/usuarios-pre.module#UsuariosPrePageModule' },
  { path: 'adm-devices', loadChildren: './pages/adm-devices/adm-devices.module#AdmDevicesPageModule' },
  { path: 'cadastro-adm-devices', loadChildren: './pages/adm-devices/cadastro-adm-devices/cadastro-adm-devices.module#CadastroAdmDevicesPageModule' },

  { path: 'Usuarios-pre', loadChildren: './pages/usuarios-pre/usuarios-pre.module#UsuariosPrePageModule' },



  { path: 'consulta-ocorrencias', loadChildren: './pages/consulta-ocorrencias/consulta-ocorrencias.module#ConsultaOcorrenciasPageModule' },
  { path: 'modulos', loadChildren: './pages/modulos/modulos.module#ModulosPageModule' },
  

 
  { path: 'gestaodoaparelhos', loadChildren: './pages/gestaodoaparelhos/gestaodoaparelhos.module#GestaodoaparelhosPageModule' },


  
  { path: 'consulta-ocorrencias', loadChildren: './pages/consulta-ocorrencias/consulta-ocorrencias.module#ConsultaOcorrenciasPageModule' },
  { path: 'modulos', loadChildren: './pages/modulos/modulos.module#ModulosPageModule' },
  { path: 'add-grupo', loadChildren: './pages/grupos/add-grupo/add-grupo.module#AddGrupoPageModule' },
  { path: 'gallery', loadChildren: './pages/gallery/gallery.module#GalleryPageModule' },
  { path: 'detalhes', loadChildren: './pages/exame-medico-legal/incluir-exame/detalhes/detalhes.module#DetalhesPageModule' },
  { path: 'local-pericia', loadChildren: './pages/exame-medico-legal/incluir-exame/local-pericia/local-pericia.module#LocalPericiaPageModule' },
  { path: 'outras-pericias', loadChildren: './pages/exame-medico-legal/incluir-exame/outras-pericias/outras-pericias.module#OutrasPericiasPageModule' },
  { path: 'incluir-outras-pericias', loadChildren: './pages/exame-medico-legal/incluir-exame/outras-pericias/incluir-outras-pericias/incluir-outras-pericias.module#IncluirOutrasPericiasPageModule' },
  { path: 'objetos-pericia', loadChildren: './pages/exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/objetos-pericia.module#ObjetosPericiaPageModule' },
  { path: 'veiculo', loadChildren: './pages/exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/veiculo/veiculo.module#VeiculoPageModule' },
  { path: 'drogas', loadChildren: './pages/exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/drogas/drogas.module#DrogasPageModule' },
  { path: 'arma', loadChildren: './pages/exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/arma/arma.module#ArmaPageModule' },
  { path: 'outros', loadChildren: './pages/exame-laboratorial-legal/incluir-exame-laboratorial/objetos-pericia/outros/outros.module#OutrosPageModule' },
  


 

  


 

 
 
 
 
  

 

];
 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }