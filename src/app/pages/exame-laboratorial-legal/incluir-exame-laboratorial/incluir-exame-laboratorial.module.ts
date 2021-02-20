import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicSelectableModule } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IncluirExameLaboratorialPage } from './incluir-exame-laboratorial.page';
import { BuscarOcorrenciaPageModule } from 'src/app/pages/exame-medico-legal/buscar-ocorrencia/buscar-ocorrencia.module';
import { BuscarOcorrenciaPage } from 'src/app/pages/exame-medico-legal/buscar-ocorrencia/buscar-ocorrencia.page';

const routes: Routes = [
  {
    path: '',
    component: IncluirExameLaboratorialPage
  }
];

@NgModule({
  imports: [
    IonicSelectableModule,
    NgxDatatableModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    BuscarOcorrenciaPageModule
    
  ],
  declarations: [IncluirExameLaboratorialPage],
  entryComponents: [
    BuscarOcorrenciaPage
  ]
})
export class IncluirExameLaboratorialPageModule {}
